/**
 * 스냅샷 결과와 DB 저장 데이터 비교 스크립트
 * 스냅샷의 날짜 범위와 동일한 구간을 DB에서 조회해 비교
 *
 * 실행: npx tsx scripts/compare-snapshot-to-db.ts
 */
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';
config();

const SNAPSHOT_FILE = resolve('.omc/crawler-snapshot-after.json');

const CRAWLER_TO_COURT: Record<string, string> = {
	// 신규 factory 기반 크롤러 이름 (facilityKey + 'Crawler')
	YEOULCrawler: '화성 여울공원 테니스장',
	WANGBAESANCrawler: '화성 왕배산체육공원 테니스장',
	GEUMBANCrawler: '화성 금반저류지 테니스장',
	BIBONGCrawler: '화성 비봉체육공원 테니스장',
	DOLMORUCrawler: '화성 돌모루 근린공원 테니스장',
	YONGINCrawler: '용인시립골드테니스장',
	NAMSANCrawler: '용인 남산근린공원 테니스장'
};

interface SnapshotEntry {
	source: string;
	count: number;
	reservations: { date: string; startTime: string; endTime: string; status: string; courtNumber: string }[];
}

async function main() {
	const { db } = await import('../src/lib/server/db/client.js');
	const { reservations, courts } = await import('../src/lib/server/db/schema.js');
	const { eq, and, gte, lte, sql } = await import('drizzle-orm');

	const snapshot: SnapshotEntry[] = JSON.parse(readFileSync(SNAPSHOT_FILE, 'utf-8'));

	console.log('=== 스냅샷 vs DB 비교 (동일 날짜 범위) ===\n');
	console.log(
		`${'크롤러'.padEnd(26)} ${'스냅샷'.padStart(8)} ${'DB'.padStart(8)} ${'결과'.padStart(4)}`
	);
	console.log('─'.repeat(52));

	let allMatch = true;

	for (const entry of snapshot) {
		const courtName = CRAWLER_TO_COURT[entry.source];
		if (!courtName) continue;

		if (entry.reservations.length === 0) {
			console.log(`${entry.source.padEnd(26)} ${'0'.padStart(8)} ${'0'.padStart(8)} ✅`);
			continue;
		}

		// 스냅샷의 날짜 범위 추출
		const dates = entry.reservations.map((r) => r.date).sort();
		const minDate = new Date(dates[0]);
		const maxDate = new Date(dates[dates.length - 1]);
		maxDate.setHours(23, 59, 59, 999);

		const courtRow = await db
			.select({ id: courts.id })
			.from(courts)
			.where(eq(courts.name, courtName));

		if (courtRow.length === 0) {
			console.log(`${entry.source.padEnd(26)} ${'코트 DB 없음'.padStart(16)}`);
			allMatch = false;
			continue;
		}

		const dbRows = await db
			.select({ id: reservations.id })
			.from(reservations)
			.where(
				and(
					eq(reservations.courtId, courtRow[0].id),
					gte(reservations.date, minDate),
					lte(reservations.date, maxDate)
				)
			);

		const dbCount = dbRows.length;
		const match = entry.count === dbCount;
		if (!match) allMatch = false;

		const status = match ? '✅' : '❌';
		console.log(
			`${entry.source.padEnd(26)} ${String(entry.count).padStart(8)} ${String(dbCount).padStart(8)} ${status}`
		);
	}

	console.log('─'.repeat(52));
	console.log(allMatch ? '\n✅ 완전 일치 — DB 전환 검증 완료' : '\n❌ 차이 발생');

	process.exit(0);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
