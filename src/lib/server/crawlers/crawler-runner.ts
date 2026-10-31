/**
 * 크롤링 오케스트레이션 공유 모듈
 * API 라우트와 CLI 스크립트가 동일 로직을 공유한다.
 */
import { buildCrawlersFromDb, type CrawlerType } from './crawler-factory.js';
import { CrawlerService } from '../services/crawler-service.js';
import { createLimiter } from './api-based/request-limiter.js';

export interface RunCrawlOptions {
	types?: CrawlerType[];
	/**
	 * 크롤러를 `total`개 그룹으로 나눠 `index`번째만 실행한다.
	 *
	 * 용인 origin이 Vercel IP를 약 2.6 req/s로 조여(2026-08-10 측정) 한 회차에
	 * 전 시설을 다 돌면 크롤 데드라인을 넘긴다. 크론을 시각을 달리해 두 번 호출하고
	 * 회차마다 절반씩 맡게 해 회당 요청 수를 줄인다.
	 *
	 * 그룹은 크롤러 이름 정렬 순의 나머지연산으로 정한다 — 회차·배포와 무관하게
	 * 같은 시설이 늘 같은 그룹에 남아야 한 시설이 계속 굶는 일이 없다.
	 */
	group?: { index: number; total: number };
}

export interface CrawlSummary {
	totalSuccess: number;
	totalFailed: number;
	totalRecords: number;
	skipped?: boolean;
}

function selectGroup<T>(
	items: T[],
	nameOf: (item: T) => string,
	group: { index: number; total: number }
): T[] {
	if (group.total <= 1) return items;
	const ordered = [...items].sort((a, b) => nameOf(a).localeCompare(nameOf(b)));
	const picked = new Set(
		ordered.filter((_, i) => i % group.total === group.index % group.total).map(nameOf)
	);
	return items.filter((item) => picked.has(nameOf(item)));
}

export async function runCrawl(opts: RunCrawlOptions = {}): Promise<CrawlSummary> {
	const built = await buildCrawlersFromDb(opts.types);
	const crawlers = opts.group ? selectGroup(built, (c) => c.getCrawlerName(), opts.group) : built;

	if (crawlers.length === 0) {
		console.warn('[runCrawl] 활성화된 크롤러가 없습니다.');
		return { totalSuccess: 0, totalFailed: 0, totalRecords: 0, skipped: true };
	}

	if (opts.group) {
		console.log(
			`[runCrawl] 그룹 ${opts.group.index}/${opts.group.total}: ${built.length}개 중 ${crawlers.length}개 실행`
		);
	}

	const service = new CrawlerService();

	// 크롤러별로 끝나는 즉시 저장한다. 전체 완료를 기다렸다 일괄 저장하면
	// 서버리스 maxDuration에 걸려 중단될 때 완료분(화성 등)까지 통째로 유실된다.
	//
	// 단 저장은 한 번에 하나씩만 보낸다. db 클라이언트가 커넥션 1개(max:1)라
	// 여러 크롤러가 동시에 배치 업서트를 던지면 첫 배치 이후 응답이 오지 않고
	// 영구히 멈춘다(2026-07-29~08-10 용인 전량 미수집의 원인, 로컬에서도 재현).
	//
	// 이 상한은 반드시 호출마다 새로 만든다. 모듈 레벨로 두면 서버리스 인스턴스가
	// 재사용될 때 이전 실행이 남긴 점유 상태가 그대로 새어, 그 인스턴스로 오는
	// 이후 모든 저장이 영구히 대기한다(2026-08-10에 실제로 겪음).
	// 대신 runCrawl을 동시에 두 번 부르면 안 된다 — 호출자가 순차로 돌려야 한다.
	const saveLimiter = createLimiter(1);

	const results = await Promise.allSettled(
		crawlers.map(async (crawler) => {
			const crawlResult = await crawler.crawl();
			await saveLimiter(() => service.saveReservations(crawlResult));
			return crawlResult;
		})
	);

	let totalSuccess = 0;
	let totalFailed = 0;
	let totalRecords = 0;

	for (let i = 0; i < results.length; i++) {
		const result = results[i];
		const name = crawlers[i].getCrawlerName();
		if (result.status === 'fulfilled') {
			if (result.value.success) {
				totalSuccess++;
				totalRecords += result.value.recordsCount;
			} else {
				totalFailed++;
			}
		} else {
			totalFailed++;
			console.error(`[runCrawl] ${name} 크롤/저장 실패:`, result.reason);
		}
	}

	return { totalSuccess, totalFailed, totalRecords };
}
