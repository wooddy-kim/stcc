/**
 * 오래된 데이터 정리 스크립트 (CLI 수동 실행용)
 * 실제 삭제 로직은 src/lib/server/services/cleanup-service.ts와 공유한다.
 *
 * 사용법:
 *   npm run cleanup              # 실제 삭제 실행
 *   npm run cleanup -- --dry-run # 삭제 대상만 확인 (실제 삭제 안함)
 */
import { config } from 'dotenv';

const RETENTION_DAYS = 30;

async function main() {
	config();

	const DRY_RUN = process.argv.includes('--dry-run');

	console.log('=== 오래된 데이터 정리 시작 ===');
	if (DRY_RUN) {
		console.log('🔍 [DRY RUN 모드] 실제 삭제 없이 대상만 확인합니다.\n');
	}
	console.log(`시작 시간: ${new Date().toLocaleString('ko-KR')}\n`);

	const startTime = Date.now();

	try {
		if (DRY_RUN) {
			const { db } = await import('../src/lib/server/db/client.js');
			const { reservations, crawlLogs } = await import('../src/lib/server/db/schema.js');
			const { lt, sql } = await import('drizzle-orm');

			const cutoff = new Date();
			cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
			cutoff.setHours(0, 0, 0, 0);

			const r = await db
				.select({ count: sql<number>`count(*)::int` })
				.from(reservations)
				.where(lt(reservations.date, cutoff));
			const c = await db
				.select({ count: sql<number>`count(*)::int` })
				.from(crawlLogs)
				.where(lt(crawlLogs.createdAt, cutoff));

			console.log(`   📋 reservations: ${r[0]?.count ?? 0}건 삭제 예정`);
			console.log(`   📋 crawl_logs: ${c[0]?.count ?? 0}건 삭제 예정`);
		} else {
			const { cleanupOldData } = await import(
				'../src/lib/server/services/cleanup-service.js'
			);
			const result = await cleanupOldData(RETENTION_DAYS);
			console.log(`   ✅ reservations ${result.deletedReservations}건 삭제`);
			console.log(`   ✅ crawl_logs ${result.deletedCrawlLogs}건 삭제`);
		}
	} catch (error) {
		console.error('❌ 데이터 정리 중 오류 발생:', error);
		process.exit(1);
	}

	console.log(`\n=== 완료 (${((Date.now() - startTime) / 1000).toFixed(2)}초) ===\n`);
	process.exit(0);
}

main();
