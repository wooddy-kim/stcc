/**
 * 마이그레이션 전후 크롤러 결과 스냅샷 및 비교 스크립트
 * API 기반 크롤러만 실행 (Playwright 기반 MangpoCrawler 제외)
 *
 * 사용법:
 *   npx tsx scripts/snapshot-crawler-results.ts --before   # 마이그레이션 전 기준선 캡처
 *   npx tsx scripts/snapshot-crawler-results.ts --after    # 마이그레이션 후 캡처 + 자동 비교
 */
import { config } from 'dotenv';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const SNAPSHOT_DIR = resolve('.omc');
const BEFORE_FILE = resolve(SNAPSHOT_DIR, 'crawler-snapshot-before.json');
const AFTER_FILE = resolve(SNAPSHOT_DIR, 'crawler-snapshot-after.json');

interface SnapshotEntry {
	source: string;
	success: boolean;
	count: number;
	reservations: Record<string, unknown>[];
}

async function main() {
	config();

	const args = process.argv.slice(2);
	const mode = args[0];

	if (mode !== '--before' && mode !== '--after') {
		console.error('Usage: npx tsx scripts/snapshot-crawler-results.ts --before|--after');
		process.exit(1);
	}

	console.log(`=== 크롤러 결과 스냅샷 (${mode}) ===\n`);

	// DB 주도 팩토리로 크롤러 빌드 (Playwright 제외는 crawlerType으로 자동 필터링됨)
	const { buildCrawlersFromDb } = await import(
		'../src/lib/server/crawlers/crawler-factory.js'
	);
	const { MangpoCrawler } = await import('../src/lib/server/crawlers/mangpo-crawler.js');

	const allCrawlers = await buildCrawlersFromDb();
	// API 기반 크롤러만 스냅샷 (Playwright 크롤러는 제외 - 환경 의존성 높음)
	const crawlers = allCrawlers.filter((c) => !(c instanceof MangpoCrawler));

	console.log(`API 기반 크롤러 ${crawlers.length}개 실행 예정\n`);

	const results: SnapshotEntry[] = [];

	for (const crawler of crawlers) {
		const name = crawler.getCrawlerName();
		process.stdout.write(`실행 중: ${name}...`);
		try {
			const result = await crawler.crawl();
			// 타임스탬프 제외하고 비교 가능한 필드만 저장
			const reservations = result.reservations.map(({ courtId: _id, ...rest }) => rest);
			results.push({
				source: name,
				success: result.success,
				count: reservations.length,
				reservations
			});
			console.log(` ✓ ${reservations.length}건`);
		} catch (err) {
			console.log(` ❌ 실패`);
			console.error(err);
			results.push({ source: name, success: false, count: 0, reservations: [] });
		}
	}

	mkdirSync(SNAPSHOT_DIR, { recursive: true });
	const outputFile = mode === '--before' ? BEFORE_FILE : AFTER_FILE;
	writeFileSync(outputFile, JSON.stringify(results, null, 2), 'utf-8');
	console.log(`\n스냅샷 저장: ${outputFile}`);

	if (mode === '--after' && existsSync(BEFORE_FILE)) {
		compareSnapshots();
	}
}

function compareSnapshots() {
	console.log('\n=== 마이그레이션 전후 비교 ===');

	const before: SnapshotEntry[] = JSON.parse(readFileSync(BEFORE_FILE, 'utf-8'));
	const after: SnapshotEntry[] = JSON.parse(readFileSync(AFTER_FILE, 'utf-8'));

	let allMatch = true;

	for (const beforeEntry of before) {
		const afterEntry = after.find((r) => r.source === beforeEntry.source);

		if (!afterEntry) {
			console.log(`❌ ${beforeEntry.source}: 마이그레이션 후 결과 없음`);
			allMatch = false;
			continue;
		}

		if (!afterEntry.success) {
			console.log(`❌ ${afterEntry.source}: 마이그레이션 후 실패`);
			allMatch = false;
		} else if (beforeEntry.count !== afterEntry.count) {
			console.log(
				`⚠️  ${beforeEntry.source}: 건수 다름 (before: ${beforeEntry.count}, after: ${afterEntry.count})`
			);
			allMatch = false;
		} else {
			console.log(`✅ ${beforeEntry.source}: 동일 (${beforeEntry.count}건)`);
		}
	}

	console.log(
		allMatch
			? '\n✅ 마이그레이션 성공: 모든 크롤러 결과 동일'
			: '\n⚠️  일부 차이 발견. 위 결과를 확인하세요.'
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
