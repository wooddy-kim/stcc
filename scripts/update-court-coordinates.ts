/**
 * 코트 주소 → 좌표 업데이트 스크립트
 * Kakao Maps Geocoding API를 사용하여 courts 테이블의 latitude/longitude 를 채웁니다.
 *
 * 사용법:
 *   npm run geocode              # 좌표 없는 코트만 업데이트 (기본)
 *   npm run geocode -- --dry-run # 변환 결과 미리보기 (DB 반영 안함)
 *   npm run geocode -- --force   # 좌표 있는 코트 포함 전체 재업데이트
 *
 * 필수 환경 변수:
 *   KAKAO_API_KEY — Kakao REST API 키
 */
import { config } from 'dotenv';

async function main() {
	// 환경 변수 먼저 로드
	config();

	const DRY_RUN = process.argv.includes('--dry-run');
	const FORCE = process.argv.includes('--force');

	console.log('=== 코트 좌표 업데이트 시작 ===');
	if (DRY_RUN) {
		console.log('🔍 [DRY RUN 모드] 실제 DB 업데이트 없이 변환 결과만 확인합니다.\n');
	}
	if (FORCE) {
		console.log('⚡ [FORCE 모드] 좌표가 있는 코트도 포함하여 전체 재업데이트합니다.\n');
	}
	console.log(`시작 시간: ${new Date().toLocaleString('ko-KR')}\n`);

	const KAKAO_API_KEY = process.env.KAKAO_API_KEY;
	if (!KAKAO_API_KEY) {
		console.error('❌ KAKAO_API_KEY 환경 변수가 설정되지 않았습니다.');
		console.error('   .env 파일에 KAKAO_API_KEY=<REST API 키> 를 추가하세요.');
		process.exit(1);
	}

	const startTime = Date.now();

	// 동적 import로 모듈 로드
	const { db } = await import('../src/lib/server/db/client.js');
	const { courts } = await import('../src/lib/server/db/schema.js');
	const { isNull, or, isNotNull, eq } = await import('drizzle-orm');

	// DB에서 코트 조회
	let targetCourts;
	if (FORCE) {
		// --force: 주소 있는 모든 코트
		targetCourts = await db
			.select({
				id: courts.id,
				name: courts.name,
				address: courts.address,
				latitude: courts.latitude,
				longitude: courts.longitude
			})
			.from(courts)
			.where(isNotNull(courts.address));
	} else {
		// 기본: 좌표 없는 코트만 (주소 있는 것 중)
		targetCourts = await db
			.select({
				id: courts.id,
				name: courts.name,
				address: courts.address,
				latitude: courts.latitude,
				longitude: courts.longitude
			})
			.from(courts)
			.where(
				or(
					isNull(courts.latitude),
					isNull(courts.longitude)
				)
			);

		// 주소 없는 코트 필터링
		targetCourts = targetCourts.filter((c) => c.address);
	}

	if (targetCourts.length === 0) {
		console.log('✅ 업데이트할 코트가 없습니다. 모든 코트에 좌표가 있습니다.');
		process.exit(0);
	}

	console.log(`📋 업데이트 대상 코트: ${targetCourts.length}개\n`);

	let successCount = 0;
	let failCount = 0;
	let skipCount = 0;

	for (const court of targetCourts) {
		if (!court.address) {
			console.log(`   ⏭️  [SKIP] ${court.name} — 주소 없음`);
			skipCount++;
			continue;
		}

		try {
			const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(court.address)}`;
			const response = await fetch(url, {
				headers: {
					Authorization: `KakaoAK ${KAKAO_API_KEY}`
				}
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data = (await response.json()) as {
				documents: Array<{ x: string; y: string; address_name: string }>;
			};

			if (!data.documents || data.documents.length === 0) {
				console.log(`   ❌ [FAIL] ${court.name} — 주소 검색 결과 없음 (${court.address})`);
				failCount++;
			} else {
				const longitude = parseFloat(data.documents[0].x); // x = 경도
				const latitude = parseFloat(data.documents[0].y); // y = 위도

				if (DRY_RUN) {
					console.log(`   🔍 [DRY] ${court.name}`);
					console.log(`          주소: ${court.address}`);
					console.log(`          좌표: lat=${latitude}, lng=${longitude}`);
				} else {
					await db
						.update(courts)
						.set({ latitude, longitude })
						.where(eq(courts.id, court.id));
					console.log(
						`   ✅ ${court.name} → lat=${latitude}, lng=${longitude}`
					);
				}
				successCount++;
			}
		} catch (error) {
			console.error(
				`   ❌ [ERROR] ${court.name} — ${error instanceof Error ? error.message : String(error)}`
			);
			failCount++;
		}

		// API rate limit 보호: 요청 사이 100ms 딜레이
		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	const duration = Date.now() - startTime;

	console.log('\n=== 코트 좌표 업데이트 완료 ===');
	console.log(`완료 시간: ${new Date().toLocaleString('ko-KR')}`);
	console.log(`소요 시간: ${(duration / 1000).toFixed(2)}초`);
	console.log(`성공: ${successCount}개`);
	console.log(`실패: ${failCount}개`);
	console.log(`스킵: ${skipCount}개`);

	if (DRY_RUN) {
		console.log('\n💡 실제 업데이트를 실행하려면: npm run geocode\n');
	}

	process.exit(0);
}

main();
