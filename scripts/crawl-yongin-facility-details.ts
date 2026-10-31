/**
 * 용인 신규 테니스장 시설 상세 정보 크롤링 스크립트
 *
 * 용인 공공스포츠 포털 시설 상세 페이지에서
 * image_url, address, total_courts를 추출하여 courts 테이블에 업데이트합니다.
 *
 * 페이지 구조 (ul.bu > li):
 *   <li><span class="title">장소</span> <span>경기도 용인시 기흥구 공세동 308-19</span></li>
 *   <li><span class="title">시설규모</span> <span>1면</span></li>
 * 이미지: <img src="/publicsports/DATA/fcltyRcept/main/xxx.png;jsessionid=...">
 *
 * 실행:
 *   npx tsx scripts/crawl-yongin-facility-details.ts --dry-run   # DB 변경 없이 결과만 출력
 *   npx tsx scripts/crawl-yongin-facility-details.ts             # 실제 DB 업데이트
 */
import 'dotenv/config';
import { db } from '../src/lib/server/db/client.js';
import { courts } from '../src/lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

const SITE_BASE = 'https://publicsports.yongin.go.kr';
const DETAIL_BASE = `${SITE_BASE}/publicsports/sports/selectFcltyRceptResveViewU.do`;

// 시설별 대표 resveId (2026-03 기준 첫 번째 코트)
const FACILITIES: Array<{ facilityKey: string; slug: string; sampleResveId: number }> = [
	{ facilityKey: 'GONGSEDONG',   slug: 'yongin-gongsedong',    sampleResveId: 11717 },
	{ facilityKey: 'GIHEUNG',      slug: 'yongin-giheung',       sampleResveId: 11716 },
	{ facilityKey: 'NAMSA',        slug: 'yongin-namsa',         sampleResveId: 11419 },
	{ facilityKey: 'DONGBAEK',     slug: 'yongin-dongbaek',      sampleResveId: 11707 },
	{ facilityKey: 'DUNJEON',      slug: 'yongin-dunjeon',       sampleResveId: 11420 },
	{ facilityKey: 'MOHYUN',       slug: 'yongin-mohyun',        sampleResveId: 11422 },
	{ facilityKey: 'BAEGAM',       slug: 'yongin-baegam',        sampleResveId: 11423 },
	{ facilityKey: 'SEONGBOK',     slug: 'yongin-seongbok',      sampleResveId: 11300 },
	{ facilityKey: 'SUJI',         slug: 'yongin-suji',          sampleResveId: 11301 },
	{ facilityKey: 'SILIB',        slug: 'yongin-silib',         sampleResveId: 11424 },
	{ facilityKey: 'SINBONG',      slug: 'yongin-sinbong',       sampleResveId: 11302 },
	{ facilityKey: 'SINYEOK',      slug: 'yongin-sinyeok',       sampleResveId: 11713 },
	{ facilityKey: 'ARPIA',        slug: 'yongin-arpia',         sampleResveId: 11667 },
	{ facilityKey: 'YANGJI',       slug: 'yongin-yangji',        sampleResveId: 11425 },
	{ facilityKey: 'WONSAN',       slug: 'yongin-wonsan',        sampleResveId: 11428 },
	{ facilityKey: 'WONSAN_PUBLIC', slug: 'yongin-wonsan-public', sampleResveId: 11429 },
	{ facilityKey: 'POGOK',        slug: 'yongin-pogok',         sampleResveId: 11432 },
	{ facilityKey: 'POGOK_B',      slug: 'yongin-pogok-b',       sampleResveId: 11433 },
	{ facilityKey: 'POGOK_D',      slug: 'yongin-pogok-d',       sampleResveId: 11437 },
];

const FETCH_HEADERS = {
	'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
	'Accept-Language': 'ko-KR,ko;q=0.9',
};

interface FacilityDetails {
	imageUrl: string | null;
	address: string | null;
	totalCourts: number | null;
}

/**
 * HTML에서 ul.bu li 구조 파싱
 * <li><span class="title">라벨</span> <span>값</span></li>
 */
function parseBuList(html: string): Map<string, string> {
	const map = new Map<string, string>();
	// ul.bu 영역 추출
	const buMatch = html.match(/<ul[^>]+class="bu"[^>]*>([\s\S]*?)<\/ul>/i);
	if (!buMatch) return map;
	const buHtml = buMatch[1];
	// 각 li에서 title/value 추출
	const liMatches = [...buHtml.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
	for (const li of liMatches) {
		const liContent = li[1];
		const titleMatch = liContent.match(/<span[^>]*class="title"[^>]*>([\s\S]*?)<\/span>/i);
		const spans = [...liContent.matchAll(/<span[^>]*>([\s\S]*?)<\/span>/gi)];
		if (titleMatch && spans.length >= 2) {
			const label = titleMatch[1].replace(/<[^>]+>/g, '').trim();
			// 두 번째 span이 value (첫 번째는 title)
			const valueSpan = spans.find((s) => !s[0].includes('class="title"'));
			if (valueSpan) {
				const value = valueSpan[1].replace(/<[^>]+>/g, '').trim();
				map.set(label, value);
			}
		}
	}
	return map;
}

/**
 * 상세 페이지 HTML에서 시설 정보 추출
 */
function extractFromHtml(html: string): FacilityDetails {
	// ── 이미지 URL ──────────────────────────────────────────────────────────────
	const imgMatch = html.match(/src="(\/publicsports\/DATA\/[^"]+\.(?:png|jpg|jpeg|gif))[;"]?/i);
	let imageUrl: string | null = null;
	if (imgMatch) {
		// jsessionid 제거 후 절대 URL로 변환
		const path = imgMatch[1].split(';')[0];
		imageUrl = `${SITE_BASE}${path}`;
	}

	// ── ul.bu 파싱 ──────────────────────────────────────────────────────────────
	const buData = parseBuList(html);

	// ── 주소 ────────────────────────────────────────────────────────────────────
	const rawAddress = buData.get('장소') ?? buData.get('주소') ?? buData.get('소재지') ?? null;
	// 우편번호 "[ 17019]" 형태 제거, 괄호 표기 정리
	let address: string | null = rawAddress
		? rawAddress.replace(/^\[\s*\d+\]\s*/, '').replace(/（/g, '(').replace(/）/g, ')').trim()
		: null;
	// 용인시청 주소(`중부대로 1199`)는 실제 시설 주소가 아니므로 null 처리
	if (address && address.includes('중부대로 1199')) address = null;

	// ── 코트 수 ────────────────────────────────────────────────────────────────
	// 패턴 1: ul.bu의 시설규모 항목
	const sizeRaw = buData.get('시설규모') ?? buData.get('코트규모') ?? buData.get('규모') ?? null;
	let totalCourts: number | null = null;
	if (sizeRaw) {
		const m = sizeRaw.match(/(\d+)/);
		if (m) totalCourts = parseInt(m[1], 10);
	}
	// 패턴 2: "시설현황 : 테니스장 X면" 또는 "시설현황 : 테니스코트 X면"
	if (!totalCourts) {
		const siteMatch = html.match(/시설현황\s*:\s*\S+\s+(\d+)면/);
		if (siteMatch) totalCourts = parseInt(siteMatch[1], 10);
	}

	return { imageUrl, address, totalCourts };
}

async function fetchDetail(resveId: number): Promise<FacilityDetails> {
	const url = `${DETAIL_BASE}?key=4236&resveId=${resveId}&pageUnit=8&pageIndex=1&checkSearchMonthNow=false&searchFcltyFieldNm=ITEM_01`;
	const res = await fetch(url, { headers: FETCH_HEADERS });
	if (!res.ok) throw new Error(`HTTP ${res.status} for resveId=${resveId}`);
	const html = await res.text();
	return extractFromHtml(html);
}

async function main() {
	const isDryRun = process.argv.includes('--dry-run');

	console.log('=== 용인 테니스장 상세 정보 크롤링 ===');
	console.log(`모드: ${isDryRun ? 'dry-run (DB 변경 없음)' : '실제 실행 (DB UPDATE)'}\n`);

	let successCount = 0;
	let failCount = 0;

	for (const facility of FACILITIES) {
		console.log(`\n🔍 [${facility.facilityKey}] ${facility.slug}`);
		try {
			const details = await fetchDetail(facility.sampleResveId);

			console.log(`  🖼️  imageUrl   : ${details.imageUrl ?? '(없음)'}`);
			console.log(`  📍 address    : ${details.address ?? '(없음)'}`);
			console.log(`  🎾 totalCourts: ${details.totalCourts ?? '(없음)'}`);

			if (!isDryRun) {
				const updateData: Partial<typeof courts.$inferInsert> = {};
				if (details.imageUrl) updateData.imageUrl = details.imageUrl;
				if (details.address) updateData.address = details.address;
				if (details.totalCourts) updateData.totalCourts = details.totalCourts;

				if (Object.keys(updateData).length > 0) {
					await db.update(courts).set(updateData).where(eq(courts.slug, facility.slug));
					console.log(`  ✅ DB 업데이트 (${Object.keys(updateData).join(', ')})`);
				} else {
					console.log(`  ⚠️  업데이트할 데이터 없음`);
				}
			}

			successCount++;
		} catch (err) {
			console.error(`  ❌ 오류: ${err instanceof Error ? err.message : String(err)}`);
			failCount++;
		}

		// 서버 부하 방지
		await new Promise((r) => setTimeout(r, 300));
	}

	console.log('\n=== 크롤링 완료 ===');
	console.log(`성공: ${successCount}개 / 실패: ${failCount}개`);
	if (isDryRun) {
		console.log('\n💡 실제 DB 업데이트: npx tsx scripts/crawl-yongin-facility-details.ts');
	}
	process.exit(0);
}

main().catch((err) => {
	console.error('❌ 실패:', err);
	process.exit(1);
});
