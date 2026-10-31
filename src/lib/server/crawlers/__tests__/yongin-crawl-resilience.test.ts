import { describe, it, expect, vi, afterEach } from 'vitest';

// DB 의존성 모킹 - loadMonthlyMappingsFromDb가 mappingRows를 읽도록 체인 구성
const holder = vi.hoisted(() => ({ rows: [] as Record<string, unknown>[] }));
vi.mock('../../db/client.js', () => ({
	db: {
		select: () => ({
			from: () => ({
				where: async () => holder.rows
			})
		})
	}
}));
vi.mock('../../db/schema.js', () => ({
	courtApiMappings: { facilityKey: {}, yearMonth: {} }
}));

import {
	YonginBaseCrawler,
	YONGIN_MAX_DAYS_TO_FETCH,
	resetYonginHealthProbe
} from '../api-based/yongin-base-crawler';
import type { YonginFacilityConfig } from '../api-based/types';

function yearMonthOf(offset: number): string {
	const now = new Date();
	const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function remainingDaysOfCurrentMonth(): number {
	const now = new Date();
	const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
	return lastDay - now.getDate() + 1;
}

/** 이번 달만 조회할 때(monthsToFetch=1) 실제로 도는 날짜 수 — 일수 상한에 걸린다 */
function fetchedDaysOfCurrentMonth(): number {
	return Math.min(YONGIN_MAX_DAYS_TO_FETCH, remainingDaysOfCurrentMonth());
}

function setMappings() {
	holder.rows = [
		{ yearMonth: yearMonthOf(0), apiCourtId: 101, courtNumber: 'A' },
		{ yearMonth: yearMonthOf(0), apiCourtId: 102, courtNumber: 'B' },
		{ yearMonth: yearMonthOf(1), apiCourtId: 201, courtNumber: 'A' },
		{ yearMonth: yearMonthOf(1), apiCourtId: 202, courtNumber: 'B' }
	];
}

function makeConfig(monthsToFetch: number): YonginFacilityConfig {
	return {
		crawlerName: 'TestYonginCrawler',
		displayName: '테스트 시설',
		facilityKey: 'YONGIN',
		apiUrl: 'https://example.com/api',
		monthsToFetch,
		batchSize: 10
	};
}

class TestYonginCrawler extends YonginBaseCrawler {
	protected override readonly defaultRetryOptions = {
		maxRetries: 2,
		baseDelay: 1,
		timeout: 1000
	};

	constructor(monthsToFetch: number) {
		super(makeConfig(monthsToFetch));
	}
}

const successBody = {
	resveTmList: [{ timeContent: '6:00 ~ 8:00' }],
	fcltRceptRsvctmTime: []
};

function okResponse() {
	return { ok: true, json: async () => successBody };
}

function abortError() {
	return Object.assign(new Error('This operation was aborted'), { name: 'AbortError' });
}

function resveIdFromBody(init: RequestInit | undefined): number {
	const body = String(init?.body ?? '');
	const match = body.match(/resveId=(\d+)/);
	return match ? Number(match[1]) : NaN;
}

afterEach(() => {
	vi.unstubAllGlobals();
	// 헬스 체크 결과는 모듈 캐시에 남아 다음 테스트로 새어 나간다
	resetYonginHealthProbe();
});

/** 첫 호출(헬스 프로브)은 성공시키고 이후 호출만 주어진 동작을 하게 한다 */
function fetchAfterProbe(rest: (url: string, init?: RequestInit) => Promise<unknown>) {
	let first = true;
	return vi.fn(async (url: string, init?: RequestInit) => {
		if (first) {
			first = false;
			return okResponse();
		}
		return rest(url, init);
	});
}

describe('YonginBaseCrawler 부분 실패 허용', () => {
	// 요청 간격(100ms) 때문에 실제 크롤과 같은 속도로 돈다 — 기본 5초로는 부족하다
	it(
		'일부 코트 요청이 전부 실패해도 성공한 코트 데이터는 수집된다',
		{ timeout: 30_000 },
		async () => {
			setMappings();
			vi.stubGlobal(
				'fetch',
				vi.fn(async (_url: string, init?: RequestInit) => {
					if (resveIdFromBody(init) === 102) throw abortError();
					return okResponse();
				})
			);

			const result = await new TestYonginCrawler(1).crawl();

			expect(result.success).toBe(true);
			expect(result.recordsCount).toBe(fetchedDaysOfCurrentMonth());
			for (const r of result.reservations) {
				expect(r.status).toBe('available');
				expect(r.courtNumber).toBe('A');
			}
		}
	);

	it('모든 요청이 실패하면 크롤 결과는 실패로 보고된다', { timeout: 30_000 }, async () => {
		setMappings();
		// 헬스 체크는 통과시키고(= 차단이 아닌 상황) 본 요청만 전부 실패시킨다
		vi.stubGlobal(
			'fetch',
			fetchAfterProbe(async () => {
				throw abortError();
			})
		);

		const result = await new TestYonginCrawler(1).crawl();

		expect(result.success).toBe(false);
		expect(result.recordsCount).toBe(0);
		expect(result.error?.message).toContain('aborted');
	});
});

describe('YonginBaseCrawler 헬스 게이트', () => {
	it('용인이 무응답이면 단건 프로브만 보내고 회차를 건너뛴다', async () => {
		setMappings();
		const fetchSpy = vi.fn(async () => {
			throw abortError();
		});
		vi.stubGlobal('fetch', fetchSpy);

		const result = await new TestYonginCrawler(2).crawl();

		// 차단 상태에 수백 건을 더 던지면 차단이 연장된다 — 정확히 1건만 나가야 한다
		expect(fetchSpy).toHaveBeenCalledTimes(1);
		expect(result.success).toBe(false);
		expect(result.recordsCount).toBe(0);
		expect(result.error?.message).toContain('차단 의심');
	});

	it('헬스 체크 결과는 origin 단위로 공유된다 (크롤러가 여러 개여도 1건)', async () => {
		setMappings();
		const fetchSpy = vi.fn(async () => {
			throw abortError();
		});
		vi.stubGlobal('fetch', fetchSpy);

		await Promise.all([
			new TestYonginCrawler(1).crawl(),
			new TestYonginCrawler(1).crawl(),
			new TestYonginCrawler(1).crawl()
		]);

		expect(fetchSpy).toHaveBeenCalledTimes(1);
	});
});

describe('YonginBaseCrawler 크롤 데드라인', () => {
	it('데드라인이 지나면 남은 요청을 건너뛰고 실패로 종료한다', async () => {
		setMappings();
		const fetchSpy = vi.fn(async () => okResponse());
		vi.stubGlobal('fetch', fetchSpy);

		class ZeroDeadlineCrawler extends TestYonginCrawler {
			protected override readonly crawlDeadlineMs = 0;
		}
		const result = await new ZeroDeadlineCrawler(2).crawl();

		expect(fetchSpy).not.toHaveBeenCalled();
		expect(result.success).toBe(false);
		expect(result.recordsCount).toBe(0);
		expect(result.error?.message).toContain('데드라인');
	});
});

describe('YonginBaseCrawler 요청량 제한', () => {
	it(
		'동시 요청은 5개 이하이고, 요청률은 초당 15건을 넘지 않는다',
		{ timeout: 30_000 },
		async () => {
			setMappings();
			let inFlight = 0;
			let maxInFlight = 0;
			const sentAt: number[] = [];
			const t0 = Date.now();
			vi.stubGlobal(
				'fetch',
				vi.fn(async () => {
					sentAt.push(Date.now() - t0);
					inFlight++;
					maxInFlight = Math.max(maxInFlight, inFlight);
					await new Promise((resolve) => setTimeout(resolve, 5));
					inFlight--;
					return okResponse();
				})
			);

			await new TestYonginCrawler(2).crawl();

			expect(maxInFlight).toBeLessThanOrEqual(5);
			// 간격 제한이 없으면 응답 5ms짜리가 동시 5개로 초당 1000건까지 나간다.
			const elapsedSec = (sentAt[sentAt.length - 1] - sentAt[0]) / 1000;
			expect(sentAt.length / Math.max(elapsedSec, 0.001)).toBeLessThan(15);
		}
	);

	it('조회 일수가 상한을 넘지 않는다 (새 달 매핑이 있어도)', { timeout: 30_000 }, async () => {
		setMappings();
		const dates = new Set<string>();
		vi.stubGlobal(
			'fetch',
			vi.fn(async (_url: string, init?: RequestInit) => {
				const match = String(init?.body ?? '').match(/dateVal=(\d+)/);
				if (match) dates.add(match[1]);
				return okResponse();
			})
		);

		// monthsToFetch=2 + 두 달치 매핑이 있어도 일수 상한에서 잘려야 한다
		await new TestYonginCrawler(2).crawl();

		expect(dates.size).toBe(YONGIN_MAX_DAYS_TO_FETCH);
	});
});
