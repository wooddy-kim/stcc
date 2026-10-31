import { describe, it, expect, vi, beforeEach } from 'vitest';

const { buildCrawlersFromDb, saveReservations } = vi.hoisted(() => ({
	buildCrawlersFromDb: vi.fn(),
	saveReservations: vi.fn()
}));

vi.mock('../crawler-factory', () => ({ buildCrawlersFromDb }));
vi.mock('../../services/crawler-service', () => ({
	CrawlerService: vi.fn(() => ({ saveReservations }))
}));

import { runCrawl } from '../crawler-runner';

function fakeCrawler(name: string, result: any) {
	return { getCrawlerName: () => name, crawl: () => Promise.resolve(result) };
}

beforeEach(() => {
	buildCrawlersFromDb.mockReset();
	saveReservations.mockReset();
});

describe('runCrawl', () => {
	it('크롤러가 없으면 skipped:true', async () => {
		buildCrawlersFromDb.mockResolvedValue([]);
		const summary = await runCrawl();
		expect(summary.skipped).toBe(true);
		expect(summary.totalRecords).toBe(0);
	});

	it('성공 크롤러 2개 → totalSuccess 2, totalRecords 합산, 저장 호출', async () => {
		buildCrawlersFromDb.mockResolvedValue([
			fakeCrawler('A', {
				success: true,
				source: 'A',
				reservations: [],
				recordsCount: 5,
				duration: 1
			}),
			fakeCrawler('B', {
				success: true,
				source: 'B',
				reservations: [],
				recordsCount: 3,
				duration: 1
			})
		]);
		const summary = await runCrawl();
		expect(summary.totalSuccess).toBe(2);
		expect(summary.totalFailed).toBe(0);
		expect(summary.totalRecords).toBe(8);
		expect(saveReservations).toHaveBeenCalledTimes(2);
	});

	it('crawl()이 reject되면 totalFailed 증가', async () => {
		buildCrawlersFromDb.mockResolvedValue([
			{ getCrawlerName: () => 'X', crawl: () => Promise.reject(new Error('boom')) }
		]);
		const summary = await runCrawl();
		expect(summary.totalFailed).toBe(1);
		expect(summary.totalSuccess).toBe(0);
	});

	it('types 옵션을 팩토리에 그대로 전달', async () => {
		buildCrawlersFromDb.mockResolvedValue([]);
		await runCrawl({ types: ['YONGIN_API'] });
		expect(buildCrawlersFromDb).toHaveBeenCalledWith(['YONGIN_API']);
	});

	it('빨리 끝난 크롤러는 느린 크롤러를 기다리지 않고 즉시 저장된다', async () => {
		let releaseSlow!: () => void;
		const slowGate = new Promise<void>((resolve) => (releaseSlow = resolve));
		const fastResult = {
			success: true,
			source: 'FAST',
			reservations: [],
			recordsCount: 1,
			duration: 1
		};
		const slowResult = {
			success: true,
			source: 'SLOW',
			reservations: [],
			recordsCount: 2,
			duration: 1
		};
		buildCrawlersFromDb.mockResolvedValue([
			fakeCrawler('FAST', fastResult),
			{ getCrawlerName: () => 'SLOW', crawl: () => slowGate.then(() => slowResult) }
		]);

		const run = runCrawl();
		await vi.waitFor(() => expect(saveReservations).toHaveBeenCalledWith(fastResult));
		expect(saveReservations).toHaveBeenCalledTimes(1);

		releaseSlow();
		const summary = await run;
		expect(summary.totalSuccess).toBe(2);
		expect(saveReservations).toHaveBeenCalledTimes(2);
	});

	it('저장은 동시에 하나씩만 실행된다 (커넥션 max:1 hang 방지)', async () => {
		let inFlight = 0;
		let maxInFlight = 0;
		const releases: (() => void)[] = [];
		saveReservations.mockImplementation(() => {
			inFlight++;
			maxInFlight = Math.max(maxInFlight, inFlight);
			return new Promise<void>((resolve) =>
				releases.push(() => {
					inFlight--;
					resolve();
				})
			);
		});
		buildCrawlersFromDb.mockResolvedValue(
			['A', 'B', 'C'].map((n) =>
				fakeCrawler(n, { success: true, source: n, reservations: [], recordsCount: 1, duration: 1 })
			)
		);

		const run = runCrawl();
		await vi.waitFor(() => expect(releases.length).toBe(1));
		// 앞선 저장이 끝나기 전에는 다음 저장이 시작되지 않아야 한다
		expect(saveReservations).toHaveBeenCalledTimes(1);

		for (let i = 0; i < 3; i++) {
			await vi.waitFor(() => expect(releases.length).toBe(i + 1));
			releases[i]();
		}
		await run;
		expect(maxInFlight).toBe(1);
		expect(saveReservations).toHaveBeenCalledTimes(3);
	});

	describe('group 옵션', () => {
		const ok = (n: string) => ({
			success: true,
			source: n,
			reservations: [],
			recordsCount: 1,
			duration: 1
		});
		const five = ['E', 'A', 'D', 'B', 'C']; // 정렬 전 순서가 섞여 있어도 결과가 같아야 한다

		async function runGroup(index: number) {
			buildCrawlersFromDb.mockResolvedValue(five.map((n) => fakeCrawler(n, ok(n))));
			saveReservations.mockReset();
			await runCrawl({ group: { index, total: 2 } });
			return saveReservations.mock.calls.map((c) => c[0].source).sort();
		}

		it('그룹을 나눠도 전 크롤러가 정확히 한 번씩 실행된다', async () => {
			const g0 = await runGroup(0);
			const g1 = await runGroup(1);

			expect(g0).toEqual(['A', 'C', 'E']);
			expect(g1).toEqual(['B', 'D']);
			// 겹치지도, 빠지지도 않아야 한다 — 빠지면 그 시설만 영구히 굶는다
			expect([...g0, ...g1].sort()).toEqual(['A', 'B', 'C', 'D', 'E']);
		});

		it('같은 index는 호출 순서가 바뀌어도 같은 그룹을 준다', async () => {
			expect(await runGroup(0)).toEqual(await runGroup(0));
		});

		it('group을 안 주면 전부 실행한다', async () => {
			buildCrawlersFromDb.mockResolvedValue(five.map((n) => fakeCrawler(n, ok(n))));
			const summary = await runCrawl();
			expect(summary.totalSuccess).toBe(5);
		});
	});

	it('fulfilled이지만 success:false → saveReservations 호출 + totalFailed 증가', async () => {
		buildCrawlersFromDb.mockResolvedValue([
			fakeCrawler('C', {
				success: false,
				source: 'C',
				reservations: [],
				recordsCount: 0,
				duration: 1
			})
		]);
		const summary = await runCrawl();
		expect(saveReservations).toHaveBeenCalledTimes(1);
		expect(summary.totalFailed).toBe(1);
		expect(summary.totalSuccess).toBe(0);
	});
});
