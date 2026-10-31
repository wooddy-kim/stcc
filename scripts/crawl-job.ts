/**
 * 크롤링 배치 작업 스크립트 (CLI 수동 실행/백필용)
 * 실제 로직은 src/lib/server/crawlers/crawler-runner.ts와 공유한다.
 */
import { config } from 'dotenv';
import type { CrawlerType } from '../src/lib/server/crawlers/crawler-factory.js';

async function main() {
	config();

	console.log('=== 테니스장 예약 현황 크롤링 시작 ===');
	console.log(`시작 시간: ${new Date().toLocaleString('ko-KR')}\n`);

	const startTime = Date.now();
	const { runCrawl } = await import('../src/lib/server/crawlers/crawler-runner.js');
	// 인자로 crawlerType을 주면 그것만 돈다 (예: `npm run crawl -- HWASEONG_API YONGIN_API`)
	const types = process.argv.slice(2) as CrawlerType[];
	const summary = await runCrawl(types.length ? { types } : {});

	const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
	console.log('\n=== 크롤링 작업 완료 ===');
	console.log(`완료 시간: ${new Date().toLocaleString('ko-KR')}`);
	console.log(`총 소요 시간: ${totalDuration}초`);
	console.log(`성공: ${summary.totalSuccess}개 크롤러`);
	console.log(`실패: ${summary.totalFailed}개 크롤러`);
	console.log(`총 수집 건수: ${summary.totalRecords}건\n`);

	process.exit(summary.totalFailed > 0 ? 1 : 0);
}

main();
