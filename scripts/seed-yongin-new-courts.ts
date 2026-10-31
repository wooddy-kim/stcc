/**
 * 용인 신규 테니스 코트 DB 등록 스크립트
 *
 * - courts 테이블에 19개 신규 시설 업서트
 * - court_api_mappings 테이블에 02월 + 03월 매핑 등록
 * - 기존 YONGIN/NAMSAN 시설의 2026-03 매핑 추가
 *
 * 실행: npx tsx scripts/seed-yongin-new-courts.ts
 */
import 'dotenv/config';
import { db } from '../src/lib/server/db/client.js';
import { regions, courts, courtApiMappings } from '../src/lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

// ── 신규 시설 정의 ────────────────────────────────────────────────────────────

const NEW_COURTS = [
	{ facilityKey: 'GONGSEDONG', name: '공세동 테니스장', slug: 'yongin-gongsedong', courtSortMode: 'numeric' },
	{ facilityKey: 'GIHEUNG', name: '기흥 테니스장', slug: 'yongin-giheung', courtSortMode: 'alpha' },
	{ facilityKey: 'NAMSA', name: '남사 테니스장', slug: 'yongin-namsa', courtSortMode: 'numeric' },
	{ facilityKey: 'DONGBAEK', name: '동백산오름 테니스장', slug: 'yongin-dongbaek', courtSortMode: 'numeric' },
	{ facilityKey: 'DUNJEON', name: '둔전 테니스장', slug: 'yongin-dunjeon', courtSortMode: 'alpha' },
	{ facilityKey: 'MOHYUN', name: '모현레스피아 테니스장', slug: 'yongin-mohyun', courtSortMode: 'numeric' },
	{ facilityKey: 'BAEGAM', name: '백암 테니스장', slug: 'yongin-baegam', courtSortMode: 'numeric' },
	{ facilityKey: 'SEONGBOK', name: '성복배수지테니스장', slug: 'yongin-seongbok', courtSortMode: 'numeric' },
	{ facilityKey: 'SUJI', name: '수지체육공원테니스장', slug: 'yongin-suji', courtSortMode: 'alpha' },
	{ facilityKey: 'SILIB', name: '시립실외 테니스장', slug: 'yongin-silib', courtSortMode: 'numeric' },
	{ facilityKey: 'SINBONG', name: '신봉고가하부테니스장', slug: 'yongin-sinbong', courtSortMode: 'numeric' },
	{ facilityKey: 'SINYEOK', name: '신역동 테니스장', slug: 'yongin-sinyeok', courtSortMode: 'alpha' },
	{ facilityKey: 'ARPIA', name: '아르피아 테니스장', slug: 'yongin-arpia', courtSortMode: 'numeric' },
	{ facilityKey: 'YANGJI', name: '양지근린공원 테니스장', slug: 'yongin-yangji', courtSortMode: 'numeric' },
	{ facilityKey: 'WONSAN', name: '원삼 테니스장', slug: 'yongin-wonsan', courtSortMode: 'numeric' },
	{ facilityKey: 'WONSAN_PUBLIC', name: '원삼면 공공체육시설 테니스장', slug: 'yongin-wonsan-public', courtSortMode: 'numeric' },
	{ facilityKey: 'POGOK', name: '포곡 테니스장', slug: 'yongin-pogok', courtSortMode: 'numeric' },
	{ facilityKey: 'POGOK_B', name: '포곡대교하부 테니스장B존', slug: 'yongin-pogok-b', courtSortMode: 'numeric' },
	{ facilityKey: 'POGOK_D', name: '포곡대교하부 테니스장D존', slug: 'yongin-pogok-d', courtSortMode: 'numeric' },
] as const;

// ── court_api_mappings 정의 ───────────────────────────────────────────────────

const MAPPINGS: Array<{ facilityKey: string; yearMonth: string; apiCourtId: number; courtNumber: string }> = [
	// ── 공세동 ──────────────────────────────────────────────────────────────────
	{ facilityKey: 'GONGSEDONG', yearMonth: '2026-03', apiCourtId: 11717, courtNumber: '1' },
	{ facilityKey: 'GONGSEDONG', yearMonth: '2026-02', apiCourtId: 11140, courtNumber: '1' },

	// ── 기흥 ────────────────────────────────────────────────────────────────────
	{ facilityKey: 'GIHEUNG', yearMonth: '2026-03', apiCourtId: 11716, courtNumber: 'A' },
	{ facilityKey: 'GIHEUNG', yearMonth: '2026-03', apiCourtId: 11715, courtNumber: 'B' },
	{ facilityKey: 'GIHEUNG', yearMonth: '2026-03', apiCourtId: 11714, courtNumber: 'D' },
	{ facilityKey: 'GIHEUNG', yearMonth: '2026-02', apiCourtId: 11139, courtNumber: 'A' },
	{ facilityKey: 'GIHEUNG', yearMonth: '2026-02', apiCourtId: 11138, courtNumber: 'B' },
	{ facilityKey: 'GIHEUNG', yearMonth: '2026-02', apiCourtId: 11137, courtNumber: 'D' },

	// ── 남사 ────────────────────────────────────────────────────────────────────
	{ facilityKey: 'NAMSA', yearMonth: '2026-03', apiCourtId: 11419, courtNumber: '1' },
	{ facilityKey: 'NAMSA', yearMonth: '2026-02', apiCourtId: 11214, courtNumber: '1' },

	// ── 동백산오름 ───────────────────────────────────────────────────────────────
	{ facilityKey: 'DONGBAEK', yearMonth: '2026-03', apiCourtId: 11707, courtNumber: '1' },
	{ facilityKey: 'DONGBAEK', yearMonth: '2026-03', apiCourtId: 11706, courtNumber: '2' },
	{ facilityKey: 'DONGBAEK', yearMonth: '2026-03', apiCourtId: 11705, courtNumber: '3' },
	{ facilityKey: 'DONGBAEK', yearMonth: '2026-03', apiCourtId: 11704, courtNumber: '4' },
	{ facilityKey: 'DONGBAEK', yearMonth: '2026-03', apiCourtId: 11703, courtNumber: '5' },
	{ facilityKey: 'DONGBAEK', yearMonth: '2026-02', apiCourtId: 11130, courtNumber: '1' },
	{ facilityKey: 'DONGBAEK', yearMonth: '2026-02', apiCourtId: 11129, courtNumber: '2' },
	{ facilityKey: 'DONGBAEK', yearMonth: '2026-02', apiCourtId: 11128, courtNumber: '3' },
	{ facilityKey: 'DONGBAEK', yearMonth: '2026-02', apiCourtId: 11127, courtNumber: '4' },
	{ facilityKey: 'DONGBAEK', yearMonth: '2026-02', apiCourtId: 11126, courtNumber: '5' },

	// ── 둔전 ────────────────────────────────────────────────────────────────────
	{ facilityKey: 'DUNJEON', yearMonth: '2026-03', apiCourtId: 11420, courtNumber: 'A' },
	{ facilityKey: 'DUNJEON', yearMonth: '2026-03', apiCourtId: 11421, courtNumber: 'B' },
	{ facilityKey: 'DUNJEON', yearMonth: '2026-02', apiCourtId: 11215, courtNumber: 'A' },
	{ facilityKey: 'DUNJEON', yearMonth: '2026-02', apiCourtId: 11216, courtNumber: 'B' },

	// ── 모현레스피아 ─────────────────────────────────────────────────────────────
	{ facilityKey: 'MOHYUN', yearMonth: '2026-03', apiCourtId: 11422, courtNumber: '1' },
	{ facilityKey: 'MOHYUN', yearMonth: '2026-02', apiCourtId: 11217, courtNumber: '1' },

	// ── 백암 ────────────────────────────────────────────────────────────────────
	{ facilityKey: 'BAEGAM', yearMonth: '2026-03', apiCourtId: 11423, courtNumber: '1' },
	{ facilityKey: 'BAEGAM', yearMonth: '2026-02', apiCourtId: 11218, courtNumber: '1' },

	// ── 성복배수지 ───────────────────────────────────────────────────────────────
	{ facilityKey: 'SEONGBOK', yearMonth: '2026-03', apiCourtId: 11300, courtNumber: '5' },
	{ facilityKey: 'SEONGBOK', yearMonth: '2026-02', apiCourtId: 10809, courtNumber: '5' },

	// ── 수지체육공원 ─────────────────────────────────────────────────────────────
	{ facilityKey: 'SUJI', yearMonth: '2026-03', apiCourtId: 11301, courtNumber: 'B' },
	{ facilityKey: 'SUJI', yearMonth: '2026-02', apiCourtId: 10810, courtNumber: 'B' },

	// ── 시립실외 ─────────────────────────────────────────────────────────────────
	{ facilityKey: 'SILIB', yearMonth: '2026-03', apiCourtId: 11424, courtNumber: '4' },
	{ facilityKey: 'SILIB', yearMonth: '2026-02', apiCourtId: 11219, courtNumber: '4' },

	// ── 신봉고가하부 ─────────────────────────────────────────────────────────────
	{ facilityKey: 'SINBONG', yearMonth: '2026-03', apiCourtId: 11302, courtNumber: '5' },
	{ facilityKey: 'SINBONG', yearMonth: '2026-02', apiCourtId: 10811, courtNumber: '5' },

	// ── 신역동 ──────────────────────────────────────────────────────────────────
	{ facilityKey: 'SINYEOK', yearMonth: '2026-03', apiCourtId: 11713, courtNumber: 'A' },
	{ facilityKey: 'SINYEOK', yearMonth: '2026-03', apiCourtId: 11712, courtNumber: 'B' },
	{ facilityKey: 'SINYEOK', yearMonth: '2026-03', apiCourtId: 11711, courtNumber: 'C' },
	{ facilityKey: 'SINYEOK', yearMonth: '2026-03', apiCourtId: 11710, courtNumber: 'D' },
	{ facilityKey: 'SINYEOK', yearMonth: '2026-02', apiCourtId: 11136, courtNumber: 'A' },
	{ facilityKey: 'SINYEOK', yearMonth: '2026-02', apiCourtId: 11135, courtNumber: 'B' },
	{ facilityKey: 'SINYEOK', yearMonth: '2026-02', apiCourtId: 11134, courtNumber: 'C' },
	{ facilityKey: 'SINYEOK', yearMonth: '2026-02', apiCourtId: 11133, courtNumber: 'D' },

	// ── 아르피아 ─────────────────────────────────────────────────────────────────
	{ facilityKey: 'ARPIA', yearMonth: '2026-03', apiCourtId: 11667, courtNumber: '1' },
	{ facilityKey: 'ARPIA', yearMonth: '2026-03', apiCourtId: 11668, courtNumber: '2' },
	{ facilityKey: 'ARPIA', yearMonth: '2026-03', apiCourtId: 11669, courtNumber: '3' },
	{ facilityKey: 'ARPIA', yearMonth: '2026-03', apiCourtId: 11670, courtNumber: '장애인' },
	{ facilityKey: 'ARPIA', yearMonth: '2026-02', apiCourtId: 10870, courtNumber: '1' },
	{ facilityKey: 'ARPIA', yearMonth: '2026-02', apiCourtId: 10871, courtNumber: '2' },
	{ facilityKey: 'ARPIA', yearMonth: '2026-02', apiCourtId: 10872, courtNumber: '3' },
	{ facilityKey: 'ARPIA', yearMonth: '2026-02', apiCourtId: 10873, courtNumber: '장애인' },

	// ── 양지근린공원 ─────────────────────────────────────────────────────────────
	{ facilityKey: 'YANGJI', yearMonth: '2026-03', apiCourtId: 11425, courtNumber: '1' },
	{ facilityKey: 'YANGJI', yearMonth: '2026-03', apiCourtId: 11426, courtNumber: '2' },
	{ facilityKey: 'YANGJI', yearMonth: '2026-03', apiCourtId: 11427, courtNumber: '3' },
	{ facilityKey: 'YANGJI', yearMonth: '2026-02', apiCourtId: 11220, courtNumber: '1' },
	{ facilityKey: 'YANGJI', yearMonth: '2026-02', apiCourtId: 11221, courtNumber: '2' },
	{ facilityKey: 'YANGJI', yearMonth: '2026-02', apiCourtId: 11222, courtNumber: '3' },

	// ── 원삼 ────────────────────────────────────────────────────────────────────
	{ facilityKey: 'WONSAN', yearMonth: '2026-03', apiCourtId: 11428, courtNumber: '1' },
	{ facilityKey: 'WONSAN', yearMonth: '2026-02', apiCourtId: 11223, courtNumber: '1' },

	// ── 원삼면 공공체육시설 ───────────────────────────────────────────────────────
	{ facilityKey: 'WONSAN_PUBLIC', yearMonth: '2026-03', apiCourtId: 11429, courtNumber: '1' },
	{ facilityKey: 'WONSAN_PUBLIC', yearMonth: '2026-03', apiCourtId: 11430, courtNumber: '2' },
	{ facilityKey: 'WONSAN_PUBLIC', yearMonth: '2026-03', apiCourtId: 11431, courtNumber: '3' },
	{ facilityKey: 'WONSAN_PUBLIC', yearMonth: '2026-02', apiCourtId: 11224, courtNumber: '1' },
	{ facilityKey: 'WONSAN_PUBLIC', yearMonth: '2026-02', apiCourtId: 11225, courtNumber: '2' },
	{ facilityKey: 'WONSAN_PUBLIC', yearMonth: '2026-02', apiCourtId: 11226, courtNumber: '3' },

	// ── 포곡 ────────────────────────────────────────────────────────────────────
	{ facilityKey: 'POGOK', yearMonth: '2026-03', apiCourtId: 11432, courtNumber: '1' },
	{ facilityKey: 'POGOK', yearMonth: '2026-02', apiCourtId: 11227, courtNumber: '1' },

	// ── 포곡대교하부 B존 ──────────────────────────────────────────────────────────
	{ facilityKey: 'POGOK_B', yearMonth: '2026-03', apiCourtId: 11433, courtNumber: '1' },
	{ facilityKey: 'POGOK_B', yearMonth: '2026-03', apiCourtId: 11434, courtNumber: '2' },
	{ facilityKey: 'POGOK_B', yearMonth: '2026-03', apiCourtId: 11435, courtNumber: '3' },
	{ facilityKey: 'POGOK_B', yearMonth: '2026-03', apiCourtId: 11436, courtNumber: '4' },
	{ facilityKey: 'POGOK_B', yearMonth: '2026-02', apiCourtId: 11228, courtNumber: '1' },
	{ facilityKey: 'POGOK_B', yearMonth: '2026-02', apiCourtId: 11229, courtNumber: '2' },
	{ facilityKey: 'POGOK_B', yearMonth: '2026-02', apiCourtId: 11230, courtNumber: '3' },
	{ facilityKey: 'POGOK_B', yearMonth: '2026-02', apiCourtId: 11231, courtNumber: '4' },

	// ── 포곡대교하부 D존 ──────────────────────────────────────────────────────────
	{ facilityKey: 'POGOK_D', yearMonth: '2026-03', apiCourtId: 11437, courtNumber: '5' },
	{ facilityKey: 'POGOK_D', yearMonth: '2026-03', apiCourtId: 11438, courtNumber: '6' },
	{ facilityKey: 'POGOK_D', yearMonth: '2026-02', apiCourtId: 11232, courtNumber: '5' },
	{ facilityKey: 'POGOK_D', yearMonth: '2026-02', apiCourtId: 11233, courtNumber: '6' },

	// ── 기존 시설 2026-03 매핑 (용인시립골드) ────────────────────────────────────
	{ facilityKey: 'YONGIN', yearMonth: '2026-03', apiCourtId: 11702, courtNumber: '1' },
	{ facilityKey: 'YONGIN', yearMonth: '2026-03', apiCourtId: 11701, courtNumber: '2' },
	{ facilityKey: 'YONGIN', yearMonth: '2026-03', apiCourtId: 11700, courtNumber: '3' },
	{ facilityKey: 'YONGIN', yearMonth: '2026-03', apiCourtId: 11699, courtNumber: '4' },
	{ facilityKey: 'YONGIN', yearMonth: '2026-03', apiCourtId: 11698, courtNumber: '5' },
	{ facilityKey: 'YONGIN', yearMonth: '2026-03', apiCourtId: 11697, courtNumber: '6' },

	// ── 기존 시설 2026-03 매핑 (남산근린공원) ────────────────────────────────────
	{ facilityKey: 'NAMSAN', yearMonth: '2026-03', apiCourtId: 11709, courtNumber: 'A' },
	{ facilityKey: 'NAMSAN', yearMonth: '2026-03', apiCourtId: 11708, courtNumber: 'B' },
];

async function main() {
	console.log('=== 용인 신규 테니스 코트 시드 시작 ===\n');

	// ── 1. 용인 regionId 조회 ─────────────────────────────────────────────────
	const [yonginRegion] = await db.select().from(regions).where(eq(regions.code, 'yongin'));
	if (!yonginRegion) {
		throw new Error('용인 region을 찾을 수 없습니다. seed-regions.ts를 먼저 실행하세요.');
	}
	const regionId = yonginRegion.id;
	console.log(`📍 용인 regionId: ${regionId}\n`);

	// ── 2. courts 업서트 ──────────────────────────────────────────────────────
	console.log('🎾 courts 테이블 업서트...');
	for (const court of NEW_COURTS) {
		await db
			.insert(courts)
			.values({
				regionId,
				name: court.name,
				rawName: court.name,
				slug: court.slug,
				facilityKey: court.facilityKey,
				courtSortMode: court.courtSortMode,
				isActive: true
			})
			.onConflictDoUpdate({
				target: courts.slug,
				set: {
					facilityKey: court.facilityKey,
					courtSortMode: court.courtSortMode,
					rawName: court.name,
					isActive: true
				}
			});
		console.log(`  ✅ ${court.slug} (${court.facilityKey})`);
	}

	// ── 3. court_api_mappings 삽입 ────────────────────────────────────────────
	console.log(`\n🗺️  court_api_mappings 삽입 (${MAPPINGS.length}개)...`);
	await db.insert(courtApiMappings).values(MAPPINGS).onConflictDoNothing();
	console.log('  ✅ 매핑 삽입 완료 (기존 데이터 보존)');

	console.log('\n✨ 시드 완료!');
	console.log('검증: npx tsx scripts/discover-yongin-tennis.ts --dry-run');
	process.exit(0);
}

main().catch((err) => {
	console.error('❌ 시드 실패:', err);
	process.exit(1);
});
