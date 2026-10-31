/**
 * 코트 상세 정보 일괄 업데이트 스크립트
 *
 * 사용법:
 *   npm run update-court-info                          # 빈 필드만 업데이트
 *   npm run update-court-info -- --dry-run             # 미리보기 (DB 변경 없음)
 *   npm run update-court-info -- --force               # 기존 값도 덮어쓰기
 *   npm run update-court-info -- --court suwon-mangpo  # 특정 시설만
 */
import { config } from 'dotenv';

interface CourtInfoData {
	operatingPolicy: string;
	pricingInfo: string;
	parkingInfo: string;
	transitInfo: string;
}

const YONGIN_NEW_TEMPLATE: CourtInfoData = {
	operatingPolicy: `### 운영 시간
- **매일**: 06:00 ~ 22:00

### 예약 규정
- **예약 단위**: 1회 2시간, 최대 4인
- **월 이용 제한**: 평일 5회, 주말 3회
- **예약 오픈**: 매월 15일(구민) / 17일(시민) / 18일(일반)
- 노쇼 3회 누적 시 30일 예약 불가

### 예약 방법
- [용인시 공공체육시설 예약](https://publicsports.yongin.go.kr)`,
	pricingInfo: `### 이용 요금
- **무료**`,
	parkingInfo: `### 주차 안내
- 시설 주변 주차 가능 (현장 확인 권장)`,
	transitInfo: `### 대중교통
- 카카오맵에서 시설명 검색 후 대중교통 길찾기를 이용해주세요`,
};

const COURT_INFO: Record<string, CourtInfoData> = {
	MANGPO: {
		operatingPolicy: `### 운영 시간
- **평일**: 06:00 ~ 22:00
- **주말**: 09:00 ~ 18:00

### 휴관일
- 매월 2, 4번째 일요일
- 법정공휴일

### 시설 규모
- 실내 코트 3면

### 예약 방법
- 수원시 통합예약시스템 또는 경기공유서비스
- 2025년 5월 신규 개관`,
		pricingInfo: `### 이용 요금
- 정확한 요금은 수원시 통합예약시스템에서 확인해주세요`,
		parkingInfo: `### 주차 안내
- **위치**: 망포복합체육센터 지하 주차장
- **주차면수**: 108면
- **요금**: 무료`,
		transitInfo: `### 대중교통
- 수원 망포공원 인근 버스 정류소 이용
- **주소**: 경기도 수원시 영통구 망포동 234-9`,
	},
	YONGIN: {
		operatingPolicy: `### 운영 시간
- **매일**: 06:00 ~ 22:00 (조명 포함)

### 시설 규모
- 인조잔디 4면 + 하드코트 6면 = 총 10면

### 예약 규정
- **예약 단위**: 1회 2시간, 최대 4인
- **월 이용 제한**: 평일 5회, 주말 3회
- **예약 오픈**: 매월 15일(구민) / 17일(시민) / 18일(일반)
- 노쇼 3회 누적 시 30일 예약 불가

### 예약 방법
- [용인시 공공체육시설 예약](https://publicsports.yongin.go.kr)`,
		pricingInfo: `### 이용 요금
- **무료**`,
		parkingInfo: `### 주차 안내
- 시설 내 주차 가능
- 테니스 예약자 주차 할인권 운영`,
		transitInfo: `### 대중교통
- **주소**: 경기도 용인시 기흥구 고매동 33-12`,
	},
	NAMSAN: {
		operatingPolicy: `### 운영 시간
- **매일**: 06:00 ~ 22:00

### 시설 규모
- 코트 2면 (A, B)

### 예약 규정
- **예약 단위**: 1회 2시간, 최대 4인
- **월 이용 제한**: 평일 5회, 주말 3회

### 예약 방법
- [용인시 공공체육시설 예약](https://publicsports.yongin.go.kr)`,
		pricingInfo: `### 이용 요금
- **1코트 2시간**: 2,000원`,
		parkingInfo: `### 주차 안내
- 남산근린공원 주차장 이용`,
		transitInfo: `### 대중교통
- **주소**: 경기도 용인시 기흥구 서천동 802, 남산근린공원 내`,
	},
	YEOUL: {
		operatingPolicy: `### 시설 규모
- 하드코트 3면

### 예약 방법
- [화성시 통합예약](https://yeyak.hscity.go.kr)
- **문의**: 031-355-1292`,
		pricingInfo: `### 이용 요금
- 화성시 공공체육시설 요금 기준 적용
- 예약 시스템에서 확인해주세요`,
		parkingInfo: `### 주차 안내
- 동탄여울공원 내 주차 가능`,
		transitInfo: `### 대중교통
- **반송삼거리, 동탄신도시입구 정류소**: 75, 116-1, 701번
- **동탄2신도시홍보관 정류소**: 58, 701, 701-1, 707번
- **주소**: 경기도 화성시 오산동 548-1, 동탄여울공원 내`,
	},
	WANGBAESAN: {
		operatingPolicy: `### 운영 시간
- **매일**: 06:00 ~ 22:00

### 시설 규모
- 하드코트 8면

### 예약 방법
- [화성시 통합예약](https://yeyak.hscity.go.kr)
- **문의**: 031-355-1292`,
		pricingInfo: `### 이용 요금
- 화성시 공공체육시설 요금 기준 적용
- 예약 시스템에서 확인해주세요`,
		parkingInfo: `### 주차 안내
- 시설 내 주차 가능`,
		transitInfo: `### 대중교통
- **주소**: 경기도 화성시 산척동 674-30, 왕배산체육공원 내`,
	},
	GEUMBAN: {
		operatingPolicy: `### 운영 시간
- **매일**: 14:00 ~ 22:00

> 다른 시설과 달리 오후부터 운영합니다.

### 시설 규모
- 코트 3면

### 예약 방법
- [화성시 통합예약](https://yeyak.hscity.go.kr)
- **문의**: 031-355-1292`,
		pricingInfo: `### 이용 요금
- 화성시 공공체육시설 요금 기준 적용
- 예약 시스템에서 확인해주세요`,
		parkingInfo: `### 주차 안내
- 금반저류지 인근 주차 가능`,
		transitInfo: `### 대중교통
- **주소**: 경기도 화성시 반송동 633-1, 금반저류지 인근`,
	},
	BIBONG: {
		operatingPolicy: `### 운영 시간
- **매일**: 12:00 ~ 22:00

### 시설 규모
- 코트 3면

### 예약 방법
- [화성시 통합예약](https://yeyak.hscity.go.kr)
- **문의**: 031-8059-3274`,
		pricingInfo: `### 이용 요금
- 화성시 공공체육시설 요금 기준 적용
- 예약 시스템에서 확인해주세요`,
		parkingInfo: `### 주차 안내
- 비봉체육공원 내 주차 가능`,
		transitInfo: `### 대중교통
- **주소**: 경기도 화성시 남이로 413, 비봉면`,
	},
	DOLMORU: {
		operatingPolicy: `### 운영 시간
- ~ 22:00까지 운영

### 예약 방법
- 현장 키오스크 예약
- [화성시 통합예약](https://yeyak.hscity.go.kr)
- **문의**: 031-355-1292`,
		pricingInfo: `### 이용 요금
- **1인 2시간**: 2,000원
- 최소 4인 이용`,
		parkingInfo: `### 주차 안내
- 돌모루 근린공원 주차 가능`,
		transitInfo: `### 대중교통
- **주소**: 경기도 화성시 석우동 4, 돌모루 근린공원 내`,
	},
	// 용인 신규 19개 — 공통 템플릿
	GONGSEDONG: YONGIN_NEW_TEMPLATE,
	GIHEUNG: YONGIN_NEW_TEMPLATE,
	NAMSA: YONGIN_NEW_TEMPLATE,
	DONGBAEK: YONGIN_NEW_TEMPLATE,
	DUNJEON: YONGIN_NEW_TEMPLATE,
	MOHYUN: YONGIN_NEW_TEMPLATE,
	BAEGAM: YONGIN_NEW_TEMPLATE,
	SEONGBOK: YONGIN_NEW_TEMPLATE,
	SUJI: YONGIN_NEW_TEMPLATE,
	SILIB: YONGIN_NEW_TEMPLATE,
	SINBONG: YONGIN_NEW_TEMPLATE,
	SINYEOK: YONGIN_NEW_TEMPLATE,
	ARPIA: YONGIN_NEW_TEMPLATE,
	YANGJI: YONGIN_NEW_TEMPLATE,
	WONSAN: YONGIN_NEW_TEMPLATE,
	WONSAN_PUBLIC: YONGIN_NEW_TEMPLATE,
	POGOK: YONGIN_NEW_TEMPLATE,
	POGOK_B: YONGIN_NEW_TEMPLATE,
	POGOK_D: YONGIN_NEW_TEMPLATE,
};

async function main() {
	config();

	const DRY_RUN = process.argv.includes('--dry-run');
	const FORCE = process.argv.includes('--force');
	const courtArgIdx = process.argv.indexOf('--court');
	const TARGET_SLUG = courtArgIdx !== -1 ? (process.argv[courtArgIdx + 1] ?? null) : null;

	console.log('=== 코트 상세 정보 업데이트 시작 ===');
	if (DRY_RUN) console.log('[DRY RUN 모드] DB 변경 없음');
	if (FORCE) console.log('[FORCE 모드] 기존 값 덮어쓰기');
	if (TARGET_SLUG) console.log(`[TARGET] ${TARGET_SLUG} 만 업데이트`);
	console.log();

	const { db } = await import('../src/lib/server/db/client.js');
	const { courts } = await import('../src/lib/server/db/schema.js');
	const { eq } = await import('drizzle-orm');

	let targetCourts = await db
		.select({
			id: courts.id,
			name: courts.name,
			slug: courts.slug,
			facilityKey: courts.facilityKey,
			operatingPolicy: courts.operatingPolicy,
			pricingInfo: courts.pricingInfo,
			parkingInfo: courts.parkingInfo,
			transitInfo: courts.transitInfo,
		})
		.from(courts);

	if (TARGET_SLUG) {
		targetCourts = targetCourts.filter((c) => c.slug === TARGET_SLUG);
		if (targetCourts.length === 0) {
			console.error(`❌ slug "${TARGET_SLUG}" 코트를 찾을 수 없습니다.`);
			process.exit(1);
		}
	}

	const fields = ['operatingPolicy', 'pricingInfo', 'parkingInfo', 'transitInfo'] as const;
	let successCount = 0;
	let skipCount = 0;
	let noDataCount = 0;

	for (const court of targetCourts) {
		const info = court.facilityKey ? COURT_INFO[court.facilityKey] : null;
		if (!info) {
			console.log(`  [NO DATA] ${court.name} (${court.facilityKey ?? 'null'})`);
			noDataCount++;
			continue;
		}

		const updateFields: Partial<CourtInfoData> = {};
		for (const field of fields) {
			if (FORCE || !court[field]) {
				updateFields[field] = info[field];
			}
		}

		if (Object.keys(updateFields).length === 0) {
			console.log(`  [SKIP] ${court.name} — 모든 필드 존재 (--force로 덮어쓰기 가능)`);
			skipCount++;
			continue;
		}

		if (DRY_RUN) {
			console.log(`  [DRY] ${court.name} (${court.facilityKey})`);
			for (const [field, value] of Object.entries(updateFields)) {
				console.log(`         ${field}: ${(value as string).split('\n')[0]}...`);
			}
		} else {
			await db.update(courts).set(updateFields).where(eq(courts.id, court.id));
			console.log(`  ✅ ${court.name} — ${Object.keys(updateFields).join(', ')} 업데이트`);
		}
		successCount++;
	}

	console.log(`\n=== 완료 ===`);
	console.log(`업데이트: ${successCount} / 스킵: ${skipCount} / 데이터없음: ${noDataCount}`);
	if (DRY_RUN) console.log('\n실제 업데이트: npm run update-court-info');

	process.exit(0);
}

main().catch((err) => {
	console.error('오류:', err);
	process.exit(1);
});
