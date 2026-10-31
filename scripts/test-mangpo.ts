/**
 * 망포 크롤러 테스트 스크립트
 */
import { config } from 'dotenv';

async function main() {
	// 환경 변수 먼저 로드
	config();

	console.log('=== 망포 체육센터 크롤러 테스트 ===');
	console.log(`시작 시간: ${new Date().toLocaleString('ko-KR')}\n`);

	const startTime = Date.now();

	// 동적 import로 모듈 로드
	const { MangpoCrawler } = await import('../src/lib/server/crawlers/mangpo-crawler.js');
	const { CrawlerService } = await import('../src/lib/server/services/crawler-service.js');

	const mangpoCrawler = new MangpoCrawler();
	const crawlerService = new CrawlerService();

	// 크롤링 실행
	console.log('📡 망포 크롤러 실행 중...\n');

	try {
		const result = await mangpoCrawler.crawl();

		const crawlDuration = Date.now() - startTime;
		console.log(`\n✅ 크롤링 완료 (${(crawlDuration / 1000).toFixed(1)}초)\n`);

		// 결과 출력
		if (result.success) {
			console.log(`✅ 성공: ${result.recordsCount}건 수집`);
			console.log(`소요 시간: ${(result.duration / 1000).toFixed(1)}초\n`);

			// 데이터베이스 저장
			console.log('💾 데이터베이스 저장 중...');
			await crawlerService.saveReservations(result);
			console.log('✅ 저장 완료\n');

			// 최근 데이터 샘플 출력
			console.log('📋 수집된 데이터 샘플 (최근 10건):');
			result.reservations.slice(0, 10).forEach((r, i) => {
				const statusIcon = r.status === 'available' ? '✅' : '❌';
				const courts = r.availableCourts ? ` | 가능: ${r.availableCourts}` : '';
				console.log(
					`${i + 1}. ${statusIcon} ${r.date} ${r.startTime}-${r.endTime} | ${r.status}${courts}`
				);
			});
		} else {
			console.log(`❌ 실패: ${result.error?.message || 'Unknown error'}`);
		}

		const totalDuration = Date.now() - startTime;
		console.log(`\n완료 시간: ${new Date().toLocaleString('ko-KR')}`);
		console.log(`총 소요 시간: ${(totalDuration / 1000).toFixed(1)}초`);

		process.exit(result.success ? 0 : 1);
	} catch (error) {
		console.error('❌ 크롤러 실행 중 에러:', error);
		process.exit(1);
	}
}

main();
