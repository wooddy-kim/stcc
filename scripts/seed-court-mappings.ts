/**
 * court_api_mappings 테이블 초기 데이터 등록 스크립트
 * api-crawler-config.ts의 모든 매핑을 DB에 일괄 등록
 *
 * 실행: npx tsx scripts/seed-court-mappings.ts
 */
import { config } from 'dotenv';

async function main() {
	config();

	const { db } = await import('../src/lib/server/db/client.js');
	const { courtApiMappings } = await import('../src/lib/server/db/schema.js');
	const { YONGIN_FACILITIES, HWASEONG_FACILITIES } = await import(
		'../src/lib/server/crawlers/api-based/api-crawler-config.js'
	);

	const rows: {
		facilityKey: string;
		yearMonth: string;
		apiCourtId: number;
		courtNumber: string;
	}[] = [];

	// 화성시 시설: yearMonth = 'STATIC'
	for (const [, cfg] of Object.entries(HWASEONG_FACILITIES)) {
		if (!cfg.courtMappings) continue;
		for (const [apiId, courtNum] of Object.entries(cfg.courtMappings)) {
			rows.push({
				facilityKey: cfg.facilityKey,
				yearMonth: 'STATIC',
				apiCourtId: Number(apiId),
				courtNumber: courtNum as string
			});
		}
	}

	// 용인시 시설: yearMonth = 'YYYY-MM'
	for (const [, cfg] of Object.entries(YONGIN_FACILITIES)) {
		if (!cfg.monthlyCourtMappings) continue;
		for (const [month, mapping] of Object.entries(cfg.monthlyCourtMappings)) {
			for (const [apiId, courtNum] of Object.entries(mapping)) {
				rows.push({
					facilityKey: cfg.facilityKey,
					yearMonth: month,
					apiCourtId: Number(apiId),
					courtNumber: courtNum as string
				});
			}
		}
	}

	console.log(`Seeding ${rows.length}개 매핑 행...`);

	await db.insert(courtApiMappings).values(rows).onConflictDoNothing();

	console.log('✅ Seed 완료');
	process.exit(0);
}

main().catch((err) => {
	console.error('Seed 실패:', err);
	process.exit(1);
});
