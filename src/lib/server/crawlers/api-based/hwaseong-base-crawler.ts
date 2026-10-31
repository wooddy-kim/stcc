import { ApiBaseCrawler } from './api-base-crawler';
import type { RawReservation, CrawlResult } from '../types';
import type { HwaseongFacilityConfig, HwaseongApiResponse } from './types';
import { sortCourtNumbers } from '../court-mappings';
import { db } from '../../db/client.js';
import { courtApiMappings } from '../../db/schema.js';
import { and, eq } from 'drizzle-orm';

/**
 * 화성시 API 기반 크롤러 추상 클래스
 * 월별 조회 방식, useCntList + applyStatusCd 응답 구조
 */
export abstract class HwaseongBaseCrawler extends ApiBaseCrawler {
	protected config: HwaseongFacilityConfig;
	private effectiveMappings: Record<number, string> = {};

	constructor(config: HwaseongFacilityConfig) {
		super();
		this.config = config;
	}

	getCrawlerName(): string {
		return this.config.crawlerName;
	}

	getTargetUrls(): string[] {
		return [this.config.apiUrl];
	}

	async crawl(): Promise<CrawlResult> {
		const startTime = Date.now();
		console.log(`[${this.getCrawlerName()}] 크롤링 시작`);

		try {
			this.effectiveMappings = await this.loadCourtMappingsFromDb();

			const allReservations: RawReservation[] = [];
			const today = new Date();
			const monthsToFetch = this.config.monthsToFetch ?? 2;
			const courtIds = Object.keys(this.effectiveMappings).map(Number);

			for (let monthOffset = 0; monthOffset < monthsToFetch; monthOffset++) {
				const targetDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
				const year = targetDate.getFullYear();
				const month = targetDate.getMonth() + 1;

				console.log(
					`[${this.getCrawlerName()}] ${year}년 ${month}월 데이터 수집 중 (${courtIds.length}개 코트 병렬 처리)...`
				);

				// 월별 코트 병렬 수집
				const courtPromises = courtIds.map((courtId) => this.fetchCourtData(courtId, year, month));
				const courtResults = await Promise.all(courtPromises);
				const monthData = courtResults.flat();

				console.log(`  ✓ ${year}년 ${month}월: ${monthData.length}건 수집 완료`);

				// 통합
				const merged = this.mergeCourtData(monthData);
				allReservations.push(...merged);
			}

			const duration = Date.now() - startTime;
			console.log(
				`[${this.getCrawlerName()}] 크롤링 완료: ${allReservations.length}건 (통합 후), ${duration}ms`
			);

			return {
				success: true,
				source: this.getCrawlerName(),
				reservations: allReservations,
				recordsCount: allReservations.length,
				duration
			};
		} catch (error) {
			const duration = Date.now() - startTime;
			console.error(`[${this.getCrawlerName()}] 크롤링 실패:`, error);

			return {
				success: false,
				source: this.getCrawlerName(),
				reservations: [],
				recordsCount: 0,
				duration,
				error: this.categorizeError(error)
			};
		}
	}

	/**
	 * 특정 코트의 월별 데이터 가져오기
	 */
	private async fetchCourtData(
		stadiumIdx: number,
		year: number,
		month: number
	): Promise<RawReservation[]> {
		const { maxRetries, baseDelay, timeout } = this.defaultRetryOptions;

		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			try {
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), timeout);

				try {
					const response = await fetch(this.config.apiUrl, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded'
						},
						body: `stadiumIdx=${stadiumIdx}&searchYear=${year}&searchMonth=${String(month).padStart(2, '0')}`,
						signal: controller.signal
					});

					clearTimeout(timeoutId);

					if (!response.ok) {
						throw new Error(`HTTP ${response.status}: ${response.statusText}`);
					}

					const data: HwaseongApiResponse = await response.json();
					return this.parseApiResponse(data, stadiumIdx);
				} catch (fetchError) {
					clearTimeout(timeoutId);
					throw fetchError;
				}
			} catch (error) {
				const isTimeout =
					error instanceof Error &&
					(error.name === 'AbortError' || error.message.includes('aborted'));
				const isLastAttempt = attempt === maxRetries;

				if (isLastAttempt) {
					console.error(`  ❌ 코트 ${stadiumIdx} 최종 실패 (${maxRetries}회):`, error);
					throw error;
				}

				const delay = baseDelay * Math.pow(2, attempt - 1);
				console.warn(
					`  ⚠️ 코트 ${stadiumIdx} 시도 ${attempt}/${maxRetries} 실패${isTimeout ? ' (timeout)' : ''}, ${delay}ms 후 재시도...`
				);
				await this.sleep(delay);
			}
		}

		return [];
	}

	/**
	 * API 응답 파싱 (화성시 전용 로직)
	 */
	private parseApiResponse(data: HwaseongApiResponse, stadiumIdx: number): RawReservation[] {
		if (!data.useCntList || !Array.isArray(data.useCntList)) {
			throw new Error('Invalid API response structure');
		}

		const reservations: RawReservation[] = [];

		for (const item of data.useCntList) {
			if (!item.sorDate || !item.stadiumBeginHm || !item.stadiumEndHm) {
				continue;
			}

			// applyStatusCd가 null이면 예약 가능
			const isReserved = item.applyStatusCd !== null && item.applyStatusCd !== undefined;

			reservations.push({
				courtName: this.config.displayName,
				courtNumber: '',
				courtId: stadiumIdx,
				date: item.sorDate,
				startTime: item.stadiumBeginHm,
				endTime: item.stadiumEndHm,
				status: isReserved ? 'reserved' : 'available'
			});
		}

		return reservations;
	}

	/**
	 * 날짜+시간별 코트 데이터 통합
	 */
	private mergeCourtData(courtData: RawReservation[]): RawReservation[] {
		const grouped = new Map<string, RawReservation[]>();

		for (const reservation of courtData) {
			const key = `${reservation.date}_${reservation.startTime}`;
			if (!grouped.has(key)) {
				grouped.set(key, []);
			}
			grouped.get(key)!.push(reservation);
		}

		const merged: RawReservation[] = [];
		for (const [_, reservations] of grouped) {
			const availableCourts: string[] = [];

			for (const r of reservations) {
				if (r.status === 'available' && r.courtId) {
					const courtNum = this.effectiveMappings[r.courtId];
					if (courtNum) {
						availableCourts.push(courtNum);
					}
				}
			}

			const hasAvailable = availableCourts.length > 0;
			const first = reservations[0];
			const sortedCourts = sortCourtNumbers(availableCourts);

			merged.push({
				courtName: first.courtName,
				courtNumber: sortedCourts.join(','),
				date: first.date,
				startTime: first.startTime,
				endTime: first.endTime,
				status: hasAvailable ? 'available' : 'reserved'
			});
		}

		return merged;
	}

	/**
	 * DB에서 화성시 코트 매핑 로드 (yearMonth = 'STATIC')
	 */
	private async loadCourtMappingsFromDb(): Promise<Record<number, string>> {
		const rows = await db
			.select()
			.from(courtApiMappings)
			.where(
				and(
					eq(courtApiMappings.facilityKey, this.config.facilityKey),
					eq(courtApiMappings.yearMonth, 'STATIC')
				)
			);

		if (rows.length === 0) {
			throw new Error(
				`[${this.config.crawlerName}] DB에 매핑 없음. seed 스크립트를 실행하세요: npx tsx scripts/seed-court-mappings.ts`
			);
		}

		const mappings: Record<number, string> = {};
		for (const row of rows) {
			mappings[row.apiCourtId] = row.courtNumber;
		}
		return mappings;
	}
}
