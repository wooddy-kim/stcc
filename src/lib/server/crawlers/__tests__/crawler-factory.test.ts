import { describe, it, expect, vi } from 'vitest';

// db 클라이언트만 모킹 — schema/drizzle는 실제 모듈 사용 (단순 객체라 무해)
vi.mock('../../db/client', () => {
	const regionRows = [
		{
			id: 1,
			code: 'SUWON',
			crawlerType: 'PLAYWRIGHT',
			apiUrl: null,
			monthsToFetch: 2,
			batchSize: 10
		},
		{
			id: 2,
			code: 'YONGIN',
			crawlerType: 'YONGIN_API',
			apiUrl: 'http://y',
			monthsToFetch: 2,
			batchSize: 10
		},
		{
			id: 3,
			code: 'HWASEONG',
			crawlerType: 'HWASEONG_API',
			apiUrl: 'http://h',
			monthsToFetch: 2,
			batchSize: 10
		}
	];
	const courtRows = [
		{
			id: 10,
			regionId: 1,
			facilityKey: 'MANGPO',
			isActive: true,
			name: '망포',
			courtSortMode: 'alpha'
		},
		{
			id: 20,
			regionId: 2,
			facilityKey: 'YONGIN',
			isActive: true,
			name: '골드',
			courtSortMode: 'numeric'
		},
		{
			id: 30,
			regionId: 3,
			facilityKey: 'YEOUL',
			isActive: true,
			name: '여울',
			courtSortMode: 'numeric'
		}
	];
	return {
		db: {
			select: () => ({
				// regions 경로: await 시 regionRows / courts 경로: .where() 호출 시 courtRows
				from: () => {
					const thenable: any = Promise.resolve(regionRows);
					thenable.where = () => Promise.resolve(courtRows);
					return thenable;
				}
			})
		}
	};
});

import { buildCrawlersFromDb } from '../crawler-factory';

describe('buildCrawlersFromDb filterTypes', () => {
	it('필터 없으면 전체(3개) 크롤러 생성', async () => {
		const crawlers = await buildCrawlersFromDb();
		expect(crawlers.length).toBe(3);
	});

	it("['YONGIN_API'] 필터 시 용인 크롤러 1개만", async () => {
		const crawlers = await buildCrawlersFromDb(['YONGIN_API']);
		expect(crawlers.length).toBe(1);
	});

	it("['PLAYWRIGHT'] 필터 시 망포 1개만", async () => {
		const crawlers = await buildCrawlersFromDb(['PLAYWRIGHT']);
		expect(crawlers.length).toBe(1);
	});
});
