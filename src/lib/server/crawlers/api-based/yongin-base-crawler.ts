import { ApiBaseCrawler } from './api-base-crawler';
import type { RawReservation, CrawlResult } from '../types';
import type {
	YonginFacilityConfig,
	YonginApiResponse,
	TimeRange,
	MonthlyCourtMappings
} from './types';
import { sortCourtNumbers } from '../court-mappings';
import { db } from '../../db/client.js';
import { courtApiMappings } from '../../db/schema.js';
import { and, eq, ne } from 'drizzle-orm';
import { createLimiter } from './request-limiter';

// 용인 서버가 대량 동시 요청에 응답을 멈추므로(2026-07 장애) 크롤러 인스턴스
// 전체가 하나의 상한을 공유한다. 배치·크롤러 병렬성과 무관하게 origin 기준으로 걸린다.
//
// 동시성만으로는 부족하다. 2026-08-10 측정 결과 용인은 **요청률**로 클라이언트 IP를
// 일시 차단한다: 동시 5개로 150요청을 연속으로 보내자 차단됐고, 같은 시각 다른 IP는
// 정상이었으며 약 25분 뒤 자동 해제됐다. 동시 5개라도 응답이 ~100ms면 초당 50건이
// 나가므로, 간격을 걸어 약 10 req/s로 낮춘다. 이 값을 키우면 차단이 재발한다.
const YONGIN_MAX_CONCURRENT_REQUESTS = 5;
const YONGIN_MIN_REQUEST_INTERVAL_MS = 100;
const yonginRequestLimiter = createLimiter(
	YONGIN_MAX_CONCURRENT_REQUESTS,
	YONGIN_MIN_REQUEST_INTERVAL_MS
);

// 조회 일수 상한(오늘부터 N일). monthsToFetch만 쓰면 새 달 매핑이 등록되는 순간
// 조회 일수가 22일 -> 52일로 뛰면서 요청 수가 배가된다 — 2026-07 장애가 정확히
// 이 패턴이었다. 일수로 직접 묶어 매핑이 몇 달치 있든 요청량이 일정하게 유지된다.
export const YONGIN_MAX_DAYS_TO_FETCH = 14;

// 먼 날짜(15일째~YONGIN_FAR_HORIZON_DAYS일째)는 회차마다 YONGIN_FAR_DAYS_PER_RUN일씩
// 돌아가며 수집한다. 요청량은 회차당 2일치(약 15%)만 늘고, 먼 날짜 전체는 약 2시간마다
// 한 바퀴 갱신된다. 저장이 upsert라 이번 회차에 안 돈 날짜의 데이터는 그대로 남는다.
// 2시간 주기는 /api/reservations의 신선도 기준(24시간)보다 충분히 짧아야 한다.
export const YONGIN_FAR_HORIZON_DAYS = 31;
export const YONGIN_FAR_DAYS_PER_RUN = 2;
// 크론 주기(15분)와 같게 잡아 연속 회차가 서로 다른 묶음을 돈다
const YONGIN_FAR_ROTATE_MS = 15 * 60_000;

/**
 * 오늘부터 이어지는 날짜 목록에서 이번 회차에 조회할 날짜를 고른다.
 * 가까운 YONGIN_MAX_DAYS_TO_FETCH일은 전부, 그 뒤는 시각에 따라 돌아가는 묶음 하나만.
 */
export function selectYonginDates(dates: string[], nowMs: number = Date.now()): string[] {
	const near = dates.slice(0, YONGIN_MAX_DAYS_TO_FETCH);
	const far = dates.slice(YONGIN_MAX_DAYS_TO_FETCH, YONGIN_FAR_HORIZON_DAYS);
	if (far.length === 0) return near;

	const per = Math.min(YONGIN_FAR_DAYS_PER_RUN, far.length);
	const start = (Math.floor(nowMs / YONGIN_FAR_ROTATE_MS) * per) % far.length;
	// 끝을 넘으면 앞으로 감아 매 회차 같은 일수를 돈다
	const picked = Array.from({ length: per }, (_, i) => far[(start + i) % far.length]);
	return [...near, ...picked];
}

// 헬스 게이트 — 이미 차단된 상태에서 수백 요청을 더 던지면 차단이 연장된다.
// 크롤 전에 단건으로 살아있는지 확인하고, 응답이 없으면 그 회차를 통째로 건너뛴다.
// origin 단위로 한 번만 검사해 21개 크롤러가 결과를 공유한다(요청은 정확히 1건).
// TTL은 크롤 1회(데드라인 180초)보다 길고 크론 주기보다 짧게 잡아, 한 회차 안에서는
// 재검사하지 않되 다음 회차에서는 차단 해제를 자동으로 감지하게 한다.
const YONGIN_HEALTH_TTL_MS = 5 * 60_000;
const YONGIN_HEALTH_TIMEOUT_MS = 5_000;
let yonginHealthProbe: { at: number; result: Promise<boolean> } | null = null;

function checkYonginReachable(apiUrl: string, body: string): Promise<boolean> {
	const now = Date.now();
	if (yonginHealthProbe && now - yonginHealthProbe.at < YONGIN_HEALTH_TTL_MS) {
		return yonginHealthProbe.result;
	}

	// 아래 IIFE는 첫 await(fetch)까지 동기로 실행된 뒤 캐시에 담긴다.
	// 같은 틱에 몰려 들어온 나머지 크롤러들은 이 캐시를 그대로 받는다.
	const result = (async () => {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), YONGIN_HEALTH_TIMEOUT_MS);
		try {
			const res = await fetch(apiUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
				body,
				signal: controller.signal
			});
			return res.ok;
		} catch {
			return false;
		} finally {
			clearTimeout(timeoutId);
		}
	})();

	yonginHealthProbe = { at: now, result };
	return result;
}

/** 테스트 전용 — 모듈 캐시를 비운다 */
export function resetYonginHealthProbe(): void {
	yonginHealthProbe = null;
}

// 데드라인 초과로 요청을 포기했음을 나타내는 내부 에러 (재시도하지 않음)
class CrawlDeadlineError extends Error {
	constructor(deadlineMs: number) {
		super(`크롤 데드라인(${Math.round(deadlineMs / 1000)}초) 초과로 남은 요청을 건너뜁니다`);
		this.name = 'CrawlDeadlineError';
	}
}

/**
 * 용인시 API 기반 크롤러 추상 클래스
 * 일별 조회 방식, resveTmList + fcltRceptRsvctmTime 응답 구조
 */
export abstract class YonginBaseCrawler extends ApiBaseCrawler {
	protected config: YonginFacilityConfig;
	private effectiveMappings: MonthlyCourtMappings = {};
	private attemptedFetches = 0;
	private failedFetches = 0;
	private lastFetchError: unknown = null;
	private crawlStartedAt = 0;

	// Vercel 함수 maxDuration(300초) 안에 저장 단계까지 반드시 도달하도록,
	// 이 시간이 지나면 새 요청을 그만두고 그때까지 모은 것만 반환한다.
	// (초과 후 잔여 in-flight 최대 15초 + 이미 큐에 든 요청이 간격만큼 빠지는 시간 +
	//  크롤러 21개 순차 저장 시간을 감안한 여유)
	protected readonly crawlDeadlineMs: number = 180_000;

	constructor(config: YonginFacilityConfig) {
		super();
		this.config = config;
	}

	getCrawlerName(): string {
		return this.config.crawlerName;
	}

	getTargetUrls(): string[] {
		// API 크롤러는 URLs를 사용하지 않지만 인터페이스 구현
		return [this.config.apiUrl];
	}

	/**
	 * 크롤링 실행 (BaseCrawler.crawl() 오버라이드)
	 */
	async crawl(): Promise<CrawlResult> {
		const startTime = Date.now();
		this.crawlStartedAt = startTime;
		console.log(`[${this.getCrawlerName()}] 크롤링 시작`);

		try {
			this.effectiveMappings = await this.loadMonthlyMappingsFromDb();
			this.attemptedFetches = 0;
			this.failedFetches = 0;
			this.lastFetchError = null;

			const allReservations: RawReservation[] = [];
			const dates = this.generateDates(this.config.monthsToFetch ?? 2);
			const datesByMonth = this.groupDatesByMonth(dates);

			console.log(
				`[${this.getCrawlerName()}] ${dates.length}일치 데이터 수집 예정 (${Object.keys(datesByMonth).length}개월)...`
			);

			// 차단 상태면 여기서 끝낸다. 데드라인이 이미 지났다면 어차피 요청을 안 보내므로
			// 프로브도 생략한다.
			const probeMonth = Object.keys(datesByMonth)[0];
			const probeCourtId = probeMonth ? this.getCourtIdsForMonth(probeMonth)[0] : undefined;
			if (!this.isPastDeadline() && probeMonth && probeCourtId !== undefined) {
				const reachable = await checkYonginReachable(
					this.config.apiUrl,
					`dateVal=${datesByMonth[probeMonth][0]}&resveId=${probeCourtId}`
				);
				if (!reachable) {
					const duration = Date.now() - startTime;
					console.error(
						`[${this.getCrawlerName()}] 용인 API 무응답 — 이번 회차를 건너뜁니다 (차단 의심)`
					);
					return {
						success: false,
						source: this.getCrawlerName(),
						reservations: [],
						recordsCount: 0,
						duration,
						error: this.categorizeError(
							new Error('용인 API 무응답(헬스 체크 실패) — 차단 의심, 이번 회차 건너뜀')
						)
					};
				}
			}

			const BATCH_SIZE = this.config.batchSize ?? 10;
			let totalProcessedCount = 0;

			// 월별로 처리
			for (const [yearMonth, monthDates] of Object.entries(datesByMonth)) {
				const courtIds = this.getCourtIdsForMonth(yearMonth);
				if (courtIds.length === 0) continue;
				console.log(`[${yearMonth}] 코트 IDs: [${courtIds.join(', ')}]`);

				let monthProcessedCount = 0;

				// 배치 병렬 처리
				for (let i = 0; i < monthDates.length; i += BATCH_SIZE) {
					const batch = monthDates.slice(i, i + BATCH_SIZE);

					const batchPromises = batch.map(async (dateVal) => {
						const courtPromises = courtIds.map((courtId) =>
							this.fetchCourtData(dateVal, courtId, yearMonth)
						);
						const courtResults = await Promise.all(courtPromises);
						return courtResults.flat();
					});

					const batchResults = await Promise.all(batchPromises);
					const batchData = batchResults.flat();

					// 날짜+시간별 통합
					const merged = this.mergeCourtData(batchData, yearMonth);
					allReservations.push(...merged);
					monthProcessedCount += batch.length;
					totalProcessedCount += batch.length;

					console.log(
						`  ✓ [${yearMonth}] 진행: ${monthProcessedCount}/${monthDates.length}일 완료 (${merged.length}건 통합)`
					);

					// 서버 부하 방지
					if (i + BATCH_SIZE < monthDates.length) {
						await this.sleep(500);
					}
				}
			}

			const duration = Date.now() - startTime;

			// 전 요청 실패 시에만 실패로 보고, 일부 실패는 수집분을 살린다
			if (this.attemptedFetches > 0 && this.failedFetches >= this.attemptedFetches) {
				console.error(
					`[${this.getCrawlerName()}] 전체 ${this.attemptedFetches}건 요청 실패, ${duration}ms`
				);
				return {
					success: false,
					source: this.getCrawlerName(),
					reservations: [],
					recordsCount: 0,
					duration,
					error: this.categorizeError(this.lastFetchError)
				};
			}

			if (this.failedFetches > 0) {
				console.warn(
					`[${this.getCrawlerName()}] ${this.attemptedFetches}건 중 ${this.failedFetches}건 실패, 성공분만 수집`
				);
			}
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
	 * 특정 코트의 특정 날짜 데이터 가져오기 (재시도 로직)
	 * 최종 실패해도 throw하지 않고 빈 배열을 반환해 다른 날짜·코트 수집을 살린다.
	 */
	private async fetchCourtData(
		dateVal: string,
		courtId: number,
		yearMonth: string
	): Promise<RawReservation[]> {
		const { maxRetries, baseDelay } = this.defaultRetryOptions;
		this.attemptedFetches++;

		// 데드라인이 지났으면 세마포어 큐에 들어가지도 않는다. 큐에 넣으면 요청
		// 간격만큼 기다렸다가 버려져, 남은 요청 수 x 간격만큼 종료가 늦어진다.
		if (this.isPastDeadline()) {
			this.failedFetches++;
			this.lastFetchError = new CrawlDeadlineError(this.crawlDeadlineMs);
			return [];
		}

		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			try {
				return await yonginRequestLimiter(() => {
					// 세마포어 대기 중에 데드라인이 지났을 수 있으므로 슬롯 획득 후 재확인
					if (this.isPastDeadline()) {
						throw new CrawlDeadlineError(this.crawlDeadlineMs);
					}
					return this.requestOnce(dateVal, courtId, yearMonth);
				});
			} catch (error) {
				if (error instanceof CrawlDeadlineError) {
					this.failedFetches++;
					this.lastFetchError = error;
					return [];
				}

				const isTimeout =
					error instanceof Error &&
					(error.name === 'AbortError' || error.message.includes('aborted'));
				const isLastAttempt = attempt === maxRetries;

				if (isLastAttempt) {
					this.failedFetches++;
					this.lastFetchError = error;
					console.error(`  ❌ ${dateVal} 코트 ${courtId} 최종 실패 (${maxRetries}회):`, error);
					return [];
				}

				const delay = baseDelay * Math.pow(2, attempt - 1);
				console.warn(
					`  ⚠️ ${dateVal} 코트 ${courtId} 시도 ${attempt}/${maxRetries} 실패${isTimeout ? ' (timeout)' : ''}, ${delay}ms 후 재시도...`
				);
				await this.sleep(delay);
			}
		}

		return [];
	}

	private isPastDeadline(): boolean {
		return Date.now() - this.crawlStartedAt >= this.crawlDeadlineMs;
	}

	/**
	 * 단일 요청 실행. 타임아웃 타이머는 세마포어 슬롯을 얻은 뒤에 시작한다.
	 */
	private async requestOnce(
		dateVal: string,
		courtId: number,
		yearMonth: string
	): Promise<RawReservation[]> {
		const { timeout } = this.defaultRetryOptions;
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		try {
			const response = await fetch(this.config.apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				},
				body: `dateVal=${dateVal}&resveId=${courtId}`,
				signal: controller.signal
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data: YonginApiResponse = await response.json();
			return this.parseApiResponse(data, dateVal, courtId, yearMonth);
		} finally {
			clearTimeout(timeoutId);
		}
	}

	/**
	 * API 응답 파싱 (용인시 전용 로직)
	 */
	private parseApiResponse(
		data: YonginApiResponse,
		dateVal: string,
		courtId: number,
		yearMonth: string
	): RawReservation[] {
		const reservations: RawReservation[] = [];
		const formattedDate = `${dateVal.slice(0, 4)}-${dateVal.slice(4, 6)}-${dateVal.slice(6, 8)}`;

		// 1. 예약 완료된 시간대 먼저 처리 (fcltRceptRsvctmTime) - 우선순위 높음
		const reservedTimeSet = new Set<string>();
		if (data.fcltRceptRsvctmTime && Array.isArray(data.fcltRceptRsvctmTime)) {
			for (const item of data.fcltRceptRsvctmTime) {
				if (!item.useTm || item.rsvctmStts !== 'RESVECOMPT') continue;

				const timeRange = this.parseTimeContent(item.useTm);
				if (!timeRange) continue;

				reservedTimeSet.add(timeRange.start);

				reservations.push({
					courtName: this.config.displayName,
					courtNumber: '',
					courtId,
					date: formattedDate,
					startTime: timeRange.start,
					endTime: timeRange.end,
					status: 'reserved'
				});
			}
		}

		// 2. 예약 가능한 시간대 (resveTmList) - 예약 완료 시간 제외
		if (data.resveTmList && Array.isArray(data.resveTmList)) {
			for (const item of data.resveTmList) {
				if (!item.timeContent) continue;

				const timeRange = this.parseTimeContent(item.timeContent);
				if (!timeRange) continue;

				// 이미 예약 완료로 처리된 시간은 건너뛰기
				if (reservedTimeSet.has(timeRange.start)) continue;

				reservations.push({
					courtName: this.config.displayName,
					courtNumber: '',
					courtId,
					date: formattedDate,
					startTime: timeRange.start,
					endTime: timeRange.end,
					status: 'available'
				});
			}
		}

		return reservations;
	}

	/**
	 * 시간 문자열 파싱: "8:00 ~ 10:00" → { start: "08:00", end: "10:00" }
	 */
	protected parseTimeContent(timeContent: string): TimeRange | null {
		const match = timeContent.match(/(\d{1,2}):(\d{2})\s*~\s*(\d{1,2}):(\d{2})/);

		if (!match) {
			console.warn(`  ⚠️ 시간 파싱 실패: ${timeContent}`);
			return null;
		}

		return {
			start: `${String(match[1]).padStart(2, '0')}:${match[2]}`,
			end: `${String(match[3]).padStart(2, '0')}:${match[4]}`
		};
	}

	/**
	 * 날짜+시간별 코트 데이터 통합
	 */
	private mergeCourtData(courtData: RawReservation[], yearMonth: string): RawReservation[] {
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
					const courtNum = this.getCourtNumberForMonth(r.courtId, yearMonth);
					if (courtNum) {
						availableCourts.push(courtNum);
					}
				}
			}

			const hasAvailable = availableCourts.length > 0;
			const first = reservations[0];

			// sortMode에 따라 정렬 방식 결정 ('alpha': A,B 문자 정렬, 'numeric': 1,2,3 숫자 정렬)
			const sortedCourts =
				(this.config.sortMode ?? 'numeric') === 'alpha'
					? [...availableCourts].sort()
					: sortCourtNumbers(availableCourts);

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
	 * 날짜에서 연-월 추출: "20250125" → "2025-01"
	 */
	private getYearMonthFromDate(dateVal: string): string {
		return `${dateVal.slice(0, 4)}-${dateVal.slice(4, 6)}`;
	}

	/**
	 * 날짜를 월별로 그룹화
	 */
	private groupDatesByMonth(dates: string[]): Record<string, string[]> {
		const grouped: Record<string, string[]> = {};
		for (const date of dates) {
			const yearMonth = this.getYearMonthFromDate(date);
			if (!grouped[yearMonth]) {
				grouped[yearMonth] = [];
			}
			grouped[yearMonth].push(date);
		}
		return grouped;
	}

	/**
	 * 특정 월의 코트 ID 조회 (DB 매핑 기준)
	 * 매핑 없으면 빈 배열 반환 → crawl()에서 해당 월 skip
	 */
	protected getCourtIdsForMonth(yearMonth: string): number[] {
		const mappings = this.effectiveMappings[yearMonth];
		if (!mappings) {
			console.warn(
				`[${this.getCrawlerName()}] ${yearMonth} 매핑 없음, 건너뜁니다. DB에 등록하세요.`
			);
			return [];
		}
		return Object.keys(mappings).map(Number);
	}

	/**
	 * 특정 월의 코트 번호 조회 (DB 매핑 기준)
	 */
	protected getCourtNumberForMonth(courtId: number, yearMonth: string): string | null {
		const mappings = this.effectiveMappings[yearMonth];
		if (!mappings) return null;
		return mappings[courtId] || null;
	}

	/**
	 * DB에서 용인시 월별 코트 매핑 로드 (yearMonth != 'STATIC')
	 */
	private async loadMonthlyMappingsFromDb(): Promise<MonthlyCourtMappings> {
		const rows = await db
			.select()
			.from(courtApiMappings)
			.where(
				and(
					eq(courtApiMappings.facilityKey, this.config.facilityKey),
					ne(courtApiMappings.yearMonth, 'STATIC')
				)
			);

		if (rows.length === 0) {
			throw new Error(
				`[${this.config.crawlerName}] DB에 월별 매핑 없음. seed 스크립트를 실행하세요: npx tsx scripts/seed-court-mappings.ts`
			);
		}

		const mappings: MonthlyCourtMappings = {};
		for (const row of rows) {
			if (!mappings[row.yearMonth]) mappings[row.yearMonth] = {};
			mappings[row.yearMonth][row.apiCourtId] = row.courtNumber;
		}
		return mappings;
	}

	/**
	 * 오늘부터 N개월치 날짜 배열 생성 (YYYYMMDD)
	 * 단 가까운 날 전부 + 먼 날 묶음 하나로 자른다(selectYonginDates) — 요청량 상한이 곧 차단 회피다.
	 */
	private generateDates(months: number): string[] {
		const dates: string[] = [];
		const today = new Date();

		for (let monthOffset = 0; monthOffset < months; monthOffset++) {
			const targetMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
			const year = targetMonth.getFullYear();
			const month = targetMonth.getMonth();
			const lastDay = new Date(year, month + 1, 0).getDate();
			const startDay = monthOffset === 0 ? today.getDate() : 1;

			for (let day = startDay; day <= lastDay; day++) {
				const dateStr = `${year}${String(month + 1).padStart(2, '0')}${String(day).padStart(2, '0')}`;
				dates.push(dateStr);
			}
		}

		return selectYonginDates(dates);
	}
}
