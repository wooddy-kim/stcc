/**
 * DB 주도 크롤러 팩토리
 * regions 테이블의 crawlerType에 따라 크롤러 인스턴스를 동적으로 생성
 *
 * 새 API 기반 코트 추가: courts 테이블에 행 추가 + court_api_mappings 등록만으로 완료
 * 새 Playwright 코트 추가: 크롤러 클래스 작성 + PLAYWRIGHT_CRAWLER_REGISTRY 등록
 */
import { db } from '../db/client.js';
import { regions, courts } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { YonginBaseCrawler } from './api-based/yongin-base-crawler.js';
import { HwaseongBaseCrawler } from './api-based/hwaseong-base-crawler.js';
import { MangpoCrawler } from './mangpo-crawler.js';
import type { BaseCrawler } from './base-crawler.js';
import type { YonginFacilityConfig, HwaseongFacilityConfig } from './api-based/types.js';

export type CrawlerType = 'PLAYWRIGHT' | 'YONGIN_API' | 'HWASEONG_API';

// TODO: 강남구(FMCS_API) · 군포시(FMCS_RENT_API) 크롤러 미구현 — 추후 개발 예정.
// regions/courts/court_api_mappings에는 이미 등록되어 있으나(GNCC05, GNCC06, GUNPO02, GUNPO03)
// 아래 switch에 case가 없어 default(PLAYWRIGHT) 분기로 떨어지고,
// PLAYWRIGHT_CRAWLER_REGISTRY 조회 실패 경고만 남긴 채 건너뛴다. 데이터는 수집되지 않는다.
// 구현 시: ApiBaseCrawler 상속 크롤러 작성 → CrawlerType에 타입 추가 → switch case 추가.

// Playwright 크롤러 레지스트리
// 새 Playwright 크롤러 추가 시 여기만 수정
const PLAYWRIGHT_CRAWLER_REGISTRY: Record<string, new () => BaseCrawler> = {
	MANGPO: MangpoCrawler
};

// 추상 클래스의 구체적인 서브클래스 (팩토리 전용)
class DynamicYonginCrawler extends YonginBaseCrawler {}
class DynamicHwaseongCrawler extends HwaseongBaseCrawler {}

function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
	return arr.reduce(
		(acc, item) => {
			const key = keyFn(item);
			(acc[key] ??= []).push(item);
			return acc;
		},
		{} as Record<string, T[]>
	);
}

/**
 * DB에서 활성화된 regions/courts를 읽어 크롤러 인스턴스 배열을 반환
 */
export async function buildCrawlersFromDb(filterTypes?: CrawlerType[]): Promise<BaseCrawler[]> {
	const activeRegions = await db.select().from(regions);
	const activeCourts = await db.select().from(courts).where(eq(courts.isActive, true));

	const crawlers: BaseCrawler[] = [];
	const playwrightAdded = new Set<string>();

	for (const region of activeRegions) {
		const regionCourts = activeCourts.filter((c) => c.regionId === region.id);
		if (regionCourts.length === 0) continue;

		const crawlerType = region.crawlerType ?? 'PLAYWRIGHT';
		if (filterTypes && !filterTypes.includes(crawlerType as CrawlerType)) continue;

		switch (crawlerType) {
			case 'YONGIN_API': {
				if (!region.apiUrl) {
					console.warn(`[Factory] YONGIN region '${region.code}' has no apiUrl, skipping`);
					break;
				}
				// facilityKey별로 그룹화 → facilityKey 1개 = 크롤러 1개
				const byFacility = groupBy(regionCourts, (c) => c.facilityKey ?? '');
				for (const [facilityKey, facilityCourts] of Object.entries(byFacility)) {
					if (!facilityKey) continue;
					const sortMode =
						(facilityCourts[0]?.courtSortMode as 'numeric' | 'alpha' | null) ?? 'numeric';
					const config: YonginFacilityConfig = {
						crawlerName: `${facilityKey}Crawler`,
						displayName: facilityCourts[0].name,
						facilityKey,
						apiUrl: region.apiUrl,
						monthsToFetch: region.monthsToFetch ?? 2,
						batchSize: region.batchSize ?? 10,
						sortMode
					};
					crawlers.push(new DynamicYonginCrawler(config));
				}
				break;
			}

			case 'HWASEONG_API': {
				if (!region.apiUrl) {
					console.warn(`[Factory] HWASEONG region '${region.code}' has no apiUrl, skipping`);
					break;
				}
				// facilityKey별로 그룹화 → facilityKey 1개 = 크롤러 1개
				const byFacility = groupBy(regionCourts, (c) => c.facilityKey ?? '');
				for (const [facilityKey, facilityCourts] of Object.entries(byFacility)) {
					if (!facilityKey) continue;
					const config: HwaseongFacilityConfig = {
						crawlerName: `${facilityKey}Crawler`,
						displayName: facilityCourts[0].name,
						facilityKey,
						apiUrl: region.apiUrl,
						monthsToFetch: region.monthsToFetch ?? 2
					};
					crawlers.push(new DynamicHwaseongCrawler(config));
				}
				break;
			}

			case 'PLAYWRIGHT':
			default: {
				// 미구현 crawlerType(FMCS_API, FMCS_RENT_API)도 여기로 떨어진다 — 파일 상단 TODO 참고
				// facilityKey로 등록된 Playwright 크롤러 조회 (중복 방지)
				for (const court of regionCourts) {
					const key = court.facilityKey;
					if (!key || playwrightAdded.has(key)) continue;
					const CrawlerClass = PLAYWRIGHT_CRAWLER_REGISTRY[key];
					if (CrawlerClass) {
						crawlers.push(new CrawlerClass());
						playwrightAdded.add(key);
					} else {
						console.warn(`[Factory] PLAYWRIGHT_CRAWLER_REGISTRY에 '${key}' 없음. 등록 필요.`);
					}
				}
				break;
			}
		}
	}

	return crawlers;
}
