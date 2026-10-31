/**
 * regions/courts 테이블에 DB 주도 크롤링 필드 시드
 *
 * Phase 2 실행 스크립트:
 *   - regions: crawlerType, apiUrl, monthsToFetch, batchSize 설정
 *   - courts: facilityKey, courtSortMode 설정
 *
 * 사용법:
 *   npx tsx scripts/seed-regions.ts
 */
import 'dotenv/config';
import { db } from '../src/lib/server/db/client.js';
import { regions, courts } from '../src/lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

const YONGIN_API_URL =
	'https://publicsports.yongin.go.kr/publicsports/sports/selectRegistTimeByChosenDateFcltyRceptResveApply.do';
const HWASEONG_API_URL = 'https://yeyak.hscity.go.kr/stadium/stadiumReserveUseList.do';

async function main() {
	console.log('=== regions/courts 시드 시작 ===\n');

	// ── 1. Regions: crawlerType + API 설정 ──────────────────────────────────
	console.log('📍 regions 테이블 업데이트...');

	// 용인 region: upsert (없으면 insert)
	await db
		.insert(regions)
		.values({
			code: 'yongin',
			name: '용인시',
			crawlerType: 'YONGIN_API',
			apiUrl: YONGIN_API_URL,
			monthsToFetch: 2,
			batchSize: 10
		})
		.onConflictDoUpdate({
			target: regions.code,
			set: {
				crawlerType: 'YONGIN_API',
				apiUrl: YONGIN_API_URL,
				monthsToFetch: 2,
				batchSize: 10
			}
		});
	console.log('  ✅ yongin → YONGIN_API');

	// 화성 region
	await db
		.update(regions)
		.set({
			crawlerType: 'HWASEONG_API',
			apiUrl: HWASEONG_API_URL,
			monthsToFetch: 2,
			batchSize: 10
		})
		.where(eq(regions.code, 'hwaseong'));
	console.log('  ✅ hwaseong → HWASEONG_API');

	// 수원 region (Playwright 기본값)
	await db
		.update(regions)
		.set({ crawlerType: 'PLAYWRIGHT' })
		.where(eq(regions.code, 'suwon'));
	console.log('  ✅ suwon → PLAYWRIGHT');

	// dongtan region이 있으면 hwaseong과 동일하게 설정 (하위 호환)
	const dongtanRows = await db.select().from(regions).where(eq(regions.code, 'dongtan'));
	if (dongtanRows.length > 0) {
		await db
			.update(regions)
			.set({ crawlerType: 'HWASEONG_API', apiUrl: HWASEONG_API_URL, monthsToFetch: 2 })
			.where(eq(regions.code, 'dongtan'));
		console.log('  ✅ dongtan → HWASEONG_API (하위 호환)');
	}

	// ── 2. Courts: facilityKey + courtSortMode 설정 ─────────────────────────
	console.log('\n🎾 courts 테이블 업데이트...');

	const courtUpdates: Array<{ slug: string; facilityKey: string; courtSortMode: string }> = [
		// 용인시 (YONGIN_API)
		{ slug: 'yongin-gold', facilityKey: 'YONGIN', courtSortMode: 'numeric' },
		{ slug: 'yongin-namsan', facilityKey: 'NAMSAN', courtSortMode: 'alpha' },
		// 화성시 (HWASEONG_API)
		{ slug: 'hwaseong-yeoul', facilityKey: 'YEOUL', courtSortMode: 'numeric' },
		{ slug: 'hwaseong-wangbaesan', facilityKey: 'WANGBAESAN', courtSortMode: 'numeric' },
		{ slug: 'hwaseong-geumban', facilityKey: 'GEUMBAN', courtSortMode: 'numeric' },
		{ slug: 'hwaseong-bibong', facilityKey: 'BIBONG', courtSortMode: 'numeric' },
		{ slug: 'hwaseong-dolmoru', facilityKey: 'DOLMORU', courtSortMode: 'numeric' },
		// 수원시 (PLAYWRIGHT)
		{ slug: 'suwon-mangpo', facilityKey: 'MANGPO', courtSortMode: 'numeric' }
	];

	for (const { slug, facilityKey, courtSortMode } of courtUpdates) {
		const updated = await db
			.update(courts)
			.set({ facilityKey, courtSortMode })
			.where(eq(courts.slug, slug))
			.returning({ id: courts.id });

		if (updated.length > 0) {
			console.log(`  ✅ ${slug} → facilityKey='${facilityKey}', sortMode='${courtSortMode}'`);
		} else {
			console.warn(`  ⚠️  ${slug}: DB에 해당 코트 없음 (slug 확인 필요)`);
		}
	}

	console.log('\n✨ 시드 완료!');
	console.log('다음 단계: npm run db:push (새 컬럼 반영 후 이 스크립트 실행)');
	process.exit(0);
}

main().catch((err) => {
	console.error('❌ 시드 실패:', err);
	process.exit(1);
});
