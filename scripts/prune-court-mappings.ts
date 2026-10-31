/**
 * 만료된 월별 코트 매핑 정리 스크립트 (CLI 수동 실행용)
 * 실제 삭제 로직은 src/lib/server/services/court-mapping-cleanup-service.ts와 공유한다.
 *
 * 용인시는 매월 resveId가 바뀌므로 court_api_mappings에 월별 매핑이 누적된다.
 * 크롤러는 오늘부터 monthsToFetch(기본 2)개월만 조회하므로 지난 달 이전 매핑은 사장 데이터다.
 * STATIC 매핑(화성·강남·군포)은 항상 보존한다.
 *
 * 사용법:
 *   npm run prune-mappings                      # 현재 월 이전 매핑 삭제
 *   npm run prune-mappings -- --dry-run         # 삭제 대상만 확인
 *   npm run prune-mappings -- --cutoff=2026-08  # 기준 월 직접 지정
 *   npm run prune-mappings -- --backup=path.json # 삭제 전 백업 파일 경로 지정
 *
 * 권장 순서: discover-yongin-tennis.ts로 새 달 매핑을 등록한 뒤 실행한다.
 */
import { config } from 'dotenv';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const DEFAULT_BACKUP_DIR = 'scripts/output';

function parseArg(prefix: string): string | undefined {
	const hit = process.argv.find((a) => a.startsWith(prefix));
	return hit ? hit.slice(prefix.length) : undefined;
}

async function main() {
	config();

	const dryRun = process.argv.includes('--dry-run');

	const { getCurrentYearMonth, pruneStaleCourtMappings } =
		await import('../src/lib/server/services/court-mapping-cleanup-service.js');

	const cutoff = parseArg('--cutoff=') ?? getCurrentYearMonth();
	const backupPath = resolve(
		parseArg('--backup=') ?? `${DEFAULT_BACKUP_DIR}/court-api-mappings-pruned-${cutoff}.json`
	);

	console.log('=== 만료 코트 매핑 정리 시작 ===');
	if (dryRun) {
		console.log('🔍 [DRY RUN 모드] 실제 삭제 없이 대상만 확인합니다.');
	}
	console.log(`기준 월: ${cutoff} (이 월 이전 매핑 삭제, STATIC 보존)`);
	console.log(`시작 시간: ${new Date().toLocaleString('ko-KR')}\n`);

	const startTime = Date.now();

	try {
		// dry-run에서도 대상 행을 먼저 확보하여 백업 후 삭제한다
		const preview = await pruneStaleCourtMappings(cutoff, true);

		if (preview.rows.length === 0) {
			console.log('   ✅ 삭제 대상 없음 (이미 정리된 상태)');
			console.log(`\n=== 완료 (${((Date.now() - startTime) / 1000).toFixed(2)}초) ===\n`);
			process.exit(0);
		}

		console.log(`   📋 삭제 대상: ${preview.rows.length}행`);
		for (const { yearMonth, count } of preview.byYearMonth) {
			console.log(`      - ${yearMonth}: ${count}행`);
		}

		writeFileSync(backupPath, JSON.stringify(preview.rows, null, 2), 'utf-8');
		console.log(`\n   💾 백업 저장: ${backupPath}`);

		if (dryRun) {
			console.log('\n   [dry-run] 삭제를 생략했습니다.');
		} else {
			const result = await pruneStaleCourtMappings(cutoff);
			console.log(`\n   ✅ court_api_mappings ${result.deletedCount}행 삭제`);
		}
	} catch (error) {
		console.error('❌ 매핑 정리 중 오류 발생:', error);
		process.exit(1);
	}

	console.log(`\n=== 완료 (${((Date.now() - startTime) / 1000).toFixed(2)}초) ===\n`);
	process.exit(0);
}

main();
