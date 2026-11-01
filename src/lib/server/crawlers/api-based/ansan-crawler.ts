import { ApiBaseCrawler } from './api-base-crawler';
import type { RawReservation, CrawlResult } from '../types';
import type { HwaseongFacilityConfig } from './types';
import { sortCourtNumbers } from '../court-mappings';

/**
 * 안산도시공사 대관 대시보드 search.do 응답
 * revdata에는 예약된 칸만 내려오고, 빈 칸은 예약가능을 뜻한다.
 */
export interface AnsanApiResponse {
	flag: boolean;
	msg?: string;
	todayStr?: string; // "2026-11-01"
	cols?: { fullDate: string }[];
	rows?: { sisulNum: number; timeNum: number; timeName: string }[]; // timeName: "각골테니스장 1코트(06-08)"
	revdata?: { sisulNum: number; timeNum: number; reservationDay: string }[];
	offdays?: { sisulNum: number; offdayDate: string }[];
}

/**
 * 안산도시공사 테니스장 크롤러 (service.ansanuc.net)
 * facilityKey = 'ANSAN-{sisulNum}', apiUrl = search.do URL
 * 코트 번호가 timeName에 들어 있어 court_api_mappings 없이 동작한다.
 * 요청마다 dashboard.do에서 세션 쿠키와 CSRF 토큰을 새로 받는다 (없으면 302).
 */
export abstract class AnsanBaseCrawler extends ApiBaseCrawler {
	protected config: HwaseongFacilityConfig;

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
			const sisulNum = Number(this.config.facilityKey.split('-')[1]);
			const allReservations: RawReservation[] = [];
			const today = new Date();
			const monthsToFetch = this.config.monthsToFetch ?? 2;

			for (let monthOffset = 0; monthOffset < monthsToFetch; monthOffset++) {
				const targetDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
				const year = targetDate.getFullYear();
				const month = targetDate.getMonth() + 1;

				const monthData = await this.fetchMonthData(sisulNum, year, month);
				console.log(`  ✓ ${year}년 ${month}월: ${monthData.length}건 수집 완료`);
				allReservations.push(...monthData);
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
	 * 시설 1곳의 한 달치 데이터 (재시도 + 타임아웃)
	 */
	private async fetchMonthData(
		sisulNum: number,
		year: number,
		month: number
	): Promise<RawReservation[]> {
		const { maxRetries, baseDelay, timeout } = this.defaultRetryOptions;

		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			try {
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), timeout);

				try {
					const result = await this.requestMonth(sisulNum, year, month, controller.signal);
					clearTimeout(timeoutId);
					return result;
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
					console.error(`  ❌ 시설 ${sisulNum} ${month}월 최종 실패 (${maxRetries}회):`, error);
					throw error;
				}

				const delay = baseDelay * Math.pow(2, attempt - 1);
				console.warn(
					`  ⚠️ 시설 ${sisulNum} ${month}월 시도 ${attempt}/${maxRetries} 실패${isTimeout ? ' (timeout)' : ''}, ${delay}ms 후 재시도...`
				);
				await this.sleep(delay);
			}
		}

		return [];
	}

	private async requestMonth(
		sisulNum: number,
		year: number,
		month: number,
		signal: AbortSignal
	): Promise<RawReservation[]> {
		const origin = new URL(this.config.apiUrl).origin;
		const dashboard = await fetch(`${origin}/dashboard/dashboard.do?sisulCategory1Num=5`, {
			signal
		});
		if (!dashboard.ok) {
			throw new Error(`HTTP ${dashboard.status}: ${dashboard.statusText}`);
		}
		const cookie = dashboard.headers
			.getSetCookie()
			.map((c) => c.split(';')[0])
			.join('; ');
		// meta 속성이 content가 아니라 th:content로 렌더링되어 있다
		const csrf = (await dashboard.text()).match(/name="_csrf"[^>]*content="([^"]+)"/)?.[1];
		if (!csrf) {
			throw new Error('Invalid dashboard page: CSRF 토큰 없음');
		}

		const response = await fetch(this.config.apiUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-CSRF-TOKEN': csrf,
				Cookie: cookie
			},
			body: `sisulCategory1Num=5&searchYear=${year}&searchMonth=${month}&searchSisul=${sisulNum}`,
			redirect: 'manual', // 세션 만료 시 302 → HTTP 오류로 처리
			signal
		});
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data: AnsanApiResponse = await response.json();
		return parseAnsanResponse(data, sisulNum, this.config.displayName);
	}
}

/**
 * 응답을 (date, startTime)별 1건으로 통합한다. courtNumber = 예약가능 코트 목록.
 * flag:false("아직 잔여석 예약 가능일이 아닙니다")는 빈 결과, 휴무일·todayStr 이전 날짜는 제외.
 * 행 단위 평일/주말 제한(weekDay·jumal ≠ 'Y')은 테니스장에 없어 반영하지 않았다.
 */
export function parseAnsanResponse(
	data: AnsanApiResponse,
	sisulNum: number,
	courtName: string
): RawReservation[] {
	if (!data.flag) return [];
	if (!data.todayStr || !Array.isArray(data.cols) || !Array.isArray(data.rows)) {
		throw new Error('Invalid API response structure');
	}

	const reserved = new Set((data.revdata ?? []).map((r) => `${r.timeNum}_${r.reservationDay}`));
	const offdays = new Set(
		(data.offdays ?? []).filter((o) => o.sisulNum === sisulNum).map((o) => o.offdayDate)
	);
	const dates = data.cols
		.map((c) => c.fullDate)
		.filter((d) => d >= data.todayStr! && !offdays.has(d));

	const grouped = new Map<string, RawReservation & { courts: string[] }>();
	for (const row of data.rows) {
		if (row.sisulNum !== sisulNum) continue;
		const m = row.timeName.match(/(\d+)코트\((\d{2})-(\d{2})\)$/);
		if (!m) {
			console.warn(`  ⚠️ 안산 timeName 파싱 실패, 건너뜀: ${row.timeName}`);
			continue;
		}
		const [, courtNum, start, end] = m;

		for (const date of dates) {
			const key = `${date}_${start}`;
			let slot = grouped.get(key);
			if (!slot) {
				slot = {
					courtName,
					courtNumber: '',
					date,
					startTime: `${start}:00`,
					endTime: `${end}:00`,
					status: 'reserved',
					courts: []
				};
				grouped.set(key, slot);
			}
			if (!reserved.has(`${row.timeNum}_${date}`)) slot.courts.push(courtNum);
		}
	}

	return [...grouped.values()].map(({ courts, ...r }) => ({
		...r,
		courtNumber: sortCourtNumbers(courts).join(','),
		status: courts.length > 0 ? 'available' : 'reserved'
	}));
}
