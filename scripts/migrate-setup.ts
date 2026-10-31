/**
 * 새 Supabase 프로젝트 전체 마스터 데이터 셋업 스크립트
 *
 * 실행 순서:
 *   1. .env 파일에 새 DATABASE_URL 설정
 *   2. npm run db:push       (스키마 생성)
 *   3. npm run migrate       (마스터 데이터 삽입)
 *   4. npm run geocode       (카카오 API로 좌표 복구)
 */
import 'dotenv/config';
import { db } from '../src/lib/server/db/client.js';
import { regions, courts, courtApiMappings } from '../src/lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

const YONGIN_API_URL =
	'https://publicsports.yongin.go.kr/publicsports/sports/selectRegistTimeByChosenDateFcltyRceptResveApply.do';
const HWASEONG_API_URL = 'https://yeyak.hscity.go.kr/stadium/stadiumReserveUseList.do';

async function upsertRegion(
	code: string,
	name: string,
	crawlerType: string,
	apiUrl: string | null,
	monthsToFetch: number,
	batchSize: number
) {
	await db
		.insert(regions)
		.values({ code, name, crawlerType, apiUrl, monthsToFetch, batchSize })
		.onConflictDoUpdate({
			target: regions.code,
			set: { name, crawlerType, apiUrl, monthsToFetch, batchSize }
		});
}

async function main() {
	console.log('=== 새 Supabase 프로젝트 마스터 데이터 셋업 ===\n');

	// ─── 1. Regions ───────────────────────────────────────────────────────────
	console.log('📍 regions 테이블 삽입...');

	await upsertRegion('suwon', '수원시', 'PLAYWRIGHT', null, 2, 10);
	console.log('  ✅ suwon → PLAYWRIGHT');

	await upsertRegion('yongin', '용인시', 'YONGIN_API', YONGIN_API_URL, 2, 10);
	console.log('  ✅ yongin → YONGIN_API');

	await upsertRegion('hwaseong', '화성시', 'HWASEONG_API', HWASEONG_API_URL, 2, 10);
	console.log('  ✅ hwaseong → HWASEONG_API');

	const allRegions = await db.select().from(regions);
	const suwonId = allRegions.find((r) => r.code === 'suwon')!.id;
	const yonginId = allRegions.find((r) => r.code === 'yongin')!.id;
	const hwaseongId = allRegions.find((r) => r.code === 'hwaseong')!.id;

	// ─── 2. Courts (8개 전체) ─────────────────────────────────────────────────
	console.log('\n🎾 courts 테이블 삽입 (8개 코트)...');

	const courtData = [
		// 수원시 (PLAYWRIGHT)
		{
			slug: 'suwon-mangpo',
			regionId: suwonId,
			name: '수원시립 망포 테니스장',
			rawName: '수원 망포체육복합센터',
			facilityKey: 'MANGPO',
			courtSortMode: 'numeric',
			address: '경기도 수원시 영통구 망포동 327',
			totalCourts: 3,
			isActive: true,
			reservationUrl: 'https://www.sports.suwon.go.kr/',
			surfaceType: '하드코트'
		},
		// 용인시 (YONGIN_API)
		{
			slug: 'yongin-gold',
			regionId: yonginId,
			name: '용인시립골드테니스장',
			rawName: '용인시립골드테니스장',
			facilityKey: 'YONGIN',
			courtSortMode: 'numeric',
			address: '경기도 용인시 기흥구 보정동 1189-3',
			totalCourts: 6,
			isActive: true,
			reservationUrl: 'https://publicsports.yongin.go.kr/',
			surfaceType: '하드코트'
		},
		{
			slug: 'yongin-namsan',
			regionId: yonginId,
			name: '용인 남산근린공원 테니스장',
			rawName: '남산근린공원 테니스장',
			facilityKey: 'NAMSAN',
			courtSortMode: 'alpha',
			address: '경기도 용인시 처인구 남사읍',
			totalCourts: 2,
			isActive: true,
			reservationUrl: 'https://publicsports.yongin.go.kr/',
			surfaceType: '하드코트'
		},
		// 화성시 (HWASEONG_API)
		{
			slug: 'hwaseong-yeoul',
			regionId: hwaseongId,
			name: '화성 여울공원 테니스장',
			rawName: '여울공원 테니스장',
			facilityKey: 'YEOUL',
			courtSortMode: 'numeric',
			address: '경기도 화성시 동탄순환대로 879',
			totalCourts: 3,
			isActive: true,
			reservationUrl: 'https://yeyak.hscity.go.kr/',
			surfaceType: '하드코트'
		},
		{
			slug: 'hwaseong-wangbaesan',
			regionId: hwaseongId,
			name: '화성 왕배산체육공원 테니스장',
			rawName: '왕배산체육공원 테니스장',
			facilityKey: 'WANGBAESAN',
			courtSortMode: 'numeric',
			address: '경기도 화성시 향남읍 행정리 산37',
			totalCourts: 8,
			isActive: true,
			reservationUrl: 'https://yeyak.hscity.go.kr/',
			surfaceType: '하드코트'
		},
		{
			slug: 'hwaseong-geumban',
			regionId: hwaseongId,
			name: '화성 금반저류지 테니스장',
			rawName: '금반저류지 테니스장',
			facilityKey: 'GEUMBAN',
			courtSortMode: 'numeric',
			address: '경기도 화성시 동탄면 금곡리',
			totalCourts: 2,
			isActive: true,
			reservationUrl: 'https://yeyak.hscity.go.kr/',
			surfaceType: '하드코트'
		},
		{
			slug: 'hwaseong-bibong',
			regionId: hwaseongId,
			name: '화성 비봉체육공원 테니스장',
			rawName: '비봉체육공원 테니스장',
			facilityKey: 'BIBONG',
			courtSortMode: 'numeric',
			address: '경기도 화성시 비봉면 쌍학리',
			totalCourts: 3,
			isActive: true,
			reservationUrl: 'https://yeyak.hscity.go.kr/',
			surfaceType: '하드코트'
		},
		{
			slug: 'hwaseong-dolmoru',
			regionId: hwaseongId,
			name: '화성 돌모루 근린공원 테니스장',
			rawName: '돌모루 근린공원 테니스장',
			facilityKey: 'DOLMORU',
			courtSortMode: 'numeric',
			address: '경기도 화성시 동탄면 석우리',
			totalCourts: 1,
			isActive: true,
			reservationUrl: 'https://yeyak.hscity.go.kr/',
			surfaceType: '하드코트'
		}
	];

	for (const c of courtData) {
		await db
			.insert(courts)
			.values(c)
			.onConflictDoUpdate({
				target: courts.slug,
				set: {
					regionId: c.regionId,
					name: c.name,
					rawName: c.rawName,
					facilityKey: c.facilityKey,
					courtSortMode: c.courtSortMode,
					address: c.address,
					totalCourts: c.totalCourts,
					isActive: c.isActive,
					reservationUrl: c.reservationUrl,
					surfaceType: c.surfaceType
				}
			});
		console.log(`  ✅ ${c.slug} (${c.name})`);
	}

	// ─── 3. court_api_mappings ────────────────────────────────────────────────
	console.log('\n🗺️  court_api_mappings 테이블 삽입...');

	const mappingRows: {
		facilityKey: string;
		yearMonth: string;
		apiCourtId: number;
		courtNumber: string;
	}[] = [
		// 용인 골드 - 2026-01
		{ facilityKey: 'YONGIN', yearMonth: '2026-01', apiCourtId: 10737, courtNumber: '1' },
		{ facilityKey: 'YONGIN', yearMonth: '2026-01', apiCourtId: 10736, courtNumber: '2' },
		{ facilityKey: 'YONGIN', yearMonth: '2026-01', apiCourtId: 10735, courtNumber: '3' },
		{ facilityKey: 'YONGIN', yearMonth: '2026-01', apiCourtId: 10734, courtNumber: '7' },
		{ facilityKey: 'YONGIN', yearMonth: '2026-01', apiCourtId: 10733, courtNumber: '8' },
		{ facilityKey: 'YONGIN', yearMonth: '2026-01', apiCourtId: 10732, courtNumber: '9' },
		// 용인 골드 - 2026-02
		{ facilityKey: 'YONGIN', yearMonth: '2026-02', apiCourtId: 11125, courtNumber: '1' },
		{ facilityKey: 'YONGIN', yearMonth: '2026-02', apiCourtId: 11124, courtNumber: '2' },
		{ facilityKey: 'YONGIN', yearMonth: '2026-02', apiCourtId: 11123, courtNumber: '3' },
		{ facilityKey: 'YONGIN', yearMonth: '2026-02', apiCourtId: 11122, courtNumber: '7' },
		{ facilityKey: 'YONGIN', yearMonth: '2026-02', apiCourtId: 11121, courtNumber: '8' },
		{ facilityKey: 'YONGIN', yearMonth: '2026-02', apiCourtId: 11120, courtNumber: '9' },
		// 용인 남산 - 2026-01
		{ facilityKey: 'NAMSAN', yearMonth: '2026-01', apiCourtId: 10744, courtNumber: 'A' },
		{ facilityKey: 'NAMSAN', yearMonth: '2026-01', apiCourtId: 10743, courtNumber: 'B' },
		// 용인 남산 - 2026-02
		{ facilityKey: 'NAMSAN', yearMonth: '2026-02', apiCourtId: 11132, courtNumber: 'A' },
		{ facilityKey: 'NAMSAN', yearMonth: '2026-02', apiCourtId: 11131, courtNumber: 'B' },
		// 화성 여울 (STATIC)
		{ facilityKey: 'YEOUL', yearMonth: 'STATIC', apiCourtId: 193, courtNumber: '1' },
		{ facilityKey: 'YEOUL', yearMonth: 'STATIC', apiCourtId: 195, courtNumber: '2' },
		{ facilityKey: 'YEOUL', yearMonth: 'STATIC', apiCourtId: 196, courtNumber: '3' },
		// 화성 왕배산 (STATIC)
		{ facilityKey: 'WANGBAESAN', yearMonth: 'STATIC', apiCourtId: 230, courtNumber: '1' },
		{ facilityKey: 'WANGBAESAN', yearMonth: 'STATIC', apiCourtId: 231, courtNumber: '2' },
		{ facilityKey: 'WANGBAESAN', yearMonth: 'STATIC', apiCourtId: 232, courtNumber: '3' },
		{ facilityKey: 'WANGBAESAN', yearMonth: 'STATIC', apiCourtId: 233, courtNumber: '4' },
		{ facilityKey: 'WANGBAESAN', yearMonth: 'STATIC', apiCourtId: 235, courtNumber: '5' },
		{ facilityKey: 'WANGBAESAN', yearMonth: 'STATIC', apiCourtId: 236, courtNumber: '6' },
		{ facilityKey: 'WANGBAESAN', yearMonth: 'STATIC', apiCourtId: 237, courtNumber: '7' },
		{ facilityKey: 'WANGBAESAN', yearMonth: 'STATIC', apiCourtId: 238, courtNumber: '8' },
		// 화성 금반저류지 (STATIC)
		{ facilityKey: 'GEUMBAN', yearMonth: 'STATIC', apiCourtId: 212, courtNumber: '1' },
		{ facilityKey: 'GEUMBAN', yearMonth: 'STATIC', apiCourtId: 243, courtNumber: '2' },
		// 화성 비봉 (STATIC)
		{ facilityKey: 'BIBONG', yearMonth: 'STATIC', apiCourtId: 207, courtNumber: '1' },
		{ facilityKey: 'BIBONG', yearMonth: 'STATIC', apiCourtId: 208, courtNumber: '2' },
		{ facilityKey: 'BIBONG', yearMonth: 'STATIC', apiCourtId: 242, courtNumber: '3' },
		// 화성 돌모루 (STATIC)
		{ facilityKey: 'DOLMORU', yearMonth: 'STATIC', apiCourtId: 213, courtNumber: '8' }
	];

	await db.insert(courtApiMappings).values(mappingRows).onConflictDoNothing();
	console.log(`  ✅ ${mappingRows.length}개 매핑 행 삽입 완료`);

	// ─── 요약 ─────────────────────────────────────────────────────────────────
	const regionCount = (await db.select().from(regions)).length;
	const courtCount = (await db.select().from(courts)).length;
	const mappingCount = (await db.select().from(courtApiMappings)).length;

	console.log('\n✨ 셋업 완료!');
	console.log(`   📍 regions: ${regionCount}개`);
	console.log(`   🎾 courts: ${courtCount}개`);
	console.log(`   🗺️  court_api_mappings: ${mappingCount}개`);
	console.log('\n⚠️  다음 단계:');
	console.log('   npm run geocode      (카카오 API로 좌표 복구)');
	process.exit(0);
}

main().catch((err) => {
	console.error('❌ 셋업 실패:', err);
	process.exit(1);
});
