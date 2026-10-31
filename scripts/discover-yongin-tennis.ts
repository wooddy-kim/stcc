/**
 * 용인 테니스장 시설 자동 탐색 + DB 등록 스크립트
 *
 * 용인 공공스포츠 포털의 테니스 예약 목록 페이지를 Playwright로 순회하여
 * 모든 카드를 파싱하고 court_api_mappings 테이블에 UPSERT합니다.
 *
 * 실행:
 *   npx tsx scripts/discover-yongin-tennis.ts --dry-run   # DB 변경 없이 탐색 결과만 출력
 *   npx tsx scripts/discover-yongin-tennis.ts             # 탐색 + DB 갱신
 *
 * 출력: scripts/output/yongin-tennis-discovery.json
 */
import { config } from 'dotenv';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { chromium } from 'playwright';
import type { Page } from 'playwright';
import { eq } from 'drizzle-orm';

const execFileAsync = promisify(execFile);

// ─── 설정 ────────────────────────────────────────────────────────────────────
const LIST_BASE_URL =
	'https://publicsports.yongin.go.kr/publicsports/sports/selectFcltyRceptResveListU.do';
const SITE_KEY = '4236';
const SPORT_FIELD = 'ITEM_01'; // 테니스
const PAGE_UNIT = 8;
// 테니스 겸용인데 종목이 '다목적'으로 분류돼 ITEM_01 목록에 안 나오는 시설. 제목 키워드로 따로 조회한다.
const EXTRA_KEYWORDS = ['배수지공원 다목적구장']; // 죽전배수지 (족구+테니스 겸용)
const OUTPUT_DIR = resolve('scripts/output');
const OUTPUT_FILE = resolve(OUTPUT_DIR, 'yongin-tennis-discovery.json');

/**
 * 페이지 번호로 직접 접근 가능한 GET URL 생성
 * (페이지네이션 링크가 모두 GET 방식임을 curl로 확인)
 */
function getPageUrl(pageIndex: number): string {
	return (
		`${LIST_BASE_URL}?key=${SITE_KEY}` +
		`&pageUnit=${PAGE_UNIT}&checkSearchMonthNow=false&searchFcltyFieldNm=${SPORT_FIELD}&pageIndex=${pageIndex}`
	);
}

function getKeywordUrl(keyword: string): string {
	return (
		`${LIST_BASE_URL}?key=${SITE_KEY}` +
		`&pageUnit=${PAGE_UNIT}&checkSearchMonthNow=false&searchKrwd=${encodeURIComponent(keyword)}&pageIndex=1`
	);
}

// ─── 타입 ────────────────────────────────────────────────────────────────────
interface RawCardItem {
	listTitle: string;
	facilityName: string;
	courtLabel: string;
	location: string;
	yearMonth: string;
	apiCourtId: number;
	isTeam: boolean; // 신청구분 '개인(팀)' 사전접수 카드
}

interface DiscoveredCourt {
	apiCourtId: number; // resveId 파라미터 값
	courtNumber: string; // "A", "B", "1", "2" 등
}

interface DiscoveredFacility {
	listTitle: string;
	facilityName: string;
	facilityKey: string | null;
	location: string;
	yearMonth: string;
	courts: DiscoveredCourt[];
	isNew: boolean;
}

// ─── 헬퍼 함수 ───────────────────────────────────────────────────────────────

/**
 * 시설명 → facilityKey 매칭 (DB courts 테이블 기준)
 * 1. 공백 정규화 후 완전 일치 우선
 * 2. 공백 정규화 후 포함 관계 매칭 (rawName이 비어있으면 제외)
 */
function matchFacilityKey(
	facilityName: string,
	courtRows: Array<{ name: string; rawName: string | null; facilityKey: string | null }>
): string | null {
	const norm = (s: string) => s.replace(/\s+/g, '');
	const normFacility = norm(facilityName);

	// 1단계: 정규화 완전 일치
	for (const row of courtRows) {
		const normName = norm(row.name);
		const normRaw = row.rawName ? norm(row.rawName) : '';
		if (normName === normFacility || (normRaw && normRaw === normFacility)) {
			return row.facilityKey;
		}
	}
	// 2단계: 정규화 포함 관계 (rawName이 빈 문자열이면 포함 검사 제외)
	for (const row of courtRows) {
		const normName = norm(row.name);
		const normRaw = row.rawName ? norm(row.rawName) : '';
		if (
			normName.includes(normFacility) ||
			normFacility.includes(normName) ||
			(normRaw && normRaw.includes(normFacility)) ||
			(normRaw && normFacility.includes(normRaw))
		) {
			return row.facilityKey;
		}
	}
	return null;
}

/**
 * 목록 페이지 HTML을 가져온다.
 *
 * 브라우저로 goto하지 않고 fetch로 문서만 받는 이유가 둘 있다.
 *
 * 1) 요청량. 목록은 완전히 서버 렌더링이라 JS가 필요 없는데, goto는 CSS·JS·이미지까지
 *    끌어와 페이지당 수십 요청이 나간다. 용인 origin은 초당 요청 수로 IP를 차단하므로
 *    (CLAUDE.md 참고) 페이지당 1건으로 줄인다.
 *
 * 2) Accept 헤더. 이 origin은 수 분 단위로 불안정해지는데, 그 구간에서 브라우저식
 *    Accept('text/html,application/xhtml+xml,...')를 붙인 요청만 502로 끊겼다
 *    (2026-09-01 측정: 15초 안에 해당 헤더 5회 전부 실패, 같은 시각 Accept 없는 요청은 전부 200).
 *    Chromium은 이 헤더를 항상 보내므로 goto로는 회피할 수 없다. 여기서는 보내지 않는다.
 *
 * 불안정 구간 자체는 헤더와 무관하게 존재하므로 백오프 재시도도 함께 건다.
 * 재시도 없이 첫 502에 종료하면 그 달 매핑이 통째로 비어 크롤이 전멸한다.
 *
 * 3) Node fetch 대신 curl. 2026-09-28 측정: 같은 헤더로 스크립트(Node fetch)는 4회 실행 모두
 *    전 시도 502, 같은 시각 curl은 4/4 200. 원인은 미확정(TLS 지문 기반 WAF 추정).
 */
async function fetchListHtml(url: string, tries = 6): Promise<string> {
	for (let attempt = 1; ; attempt++) {
		let status: number | string;
		try {
			const { stdout } = await execFileAsync(
				'curl',
				[
					'-sS',
					'--max-time', '30',
					'-A', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
					'-H', 'Accept-Language: ko-KR,ko;q=0.9,en-US;q=0.8',
					'-H', 'Accept: */*', // 위 주석 2) 참고 — 브라우저식 Accept는 이 origin에서 끊긴다
					'-w', '\n%{http_code}',
					url
				],
				{ maxBuffer: 10 * 1024 * 1024 }
			);
			const cut = stdout.lastIndexOf('\n');
			status = Number(stdout.slice(cut + 1));
			if (status >= 200 && status < 300) return stdout.slice(0, cut);
		} catch (e) {
			status = (e as Error).message.split('\n')[0];
		}

		if (attempt >= tries) {
			throw new Error(`목록 페이지 로드 실패 (${tries}회 시도, 마지막 ${status}): ${url}`);
		}
		const waitMs = 3000 * 2 ** (attempt - 1);
		console.log(`  ⚠️  ${status} — ${waitMs / 1000}초 후 재시도 (${attempt}/${tries - 1})`);
		await new Promise((r) => setTimeout(r, waitMs));
	}
}

/**
 * 현재 페이지의 카드 데이터를 DOM에서 추출
 *
 * 핵심:
 * - "상세보기" 링크의 href에서 resveId= 파라미터 = apiCourtId
 *   (key=4292는 페이지 컨텍스트 상수, resveId가 실제 시설 ID)
 * - 제목: .reserve_title 에서 .reserve_position 텍스트 제외
 * - 위치: .reserve_position 직접 참조
 * - 이용기간: ul.bu > li 에서 "이용기간" 항목
 */
async function extractCardsFromPage(page: Page): Promise<RawCardItem[]> {
	return await page.evaluate((extraKeywords) => {
		const results: Array<{
			listTitle: string;
			facilityName: string;
			courtLabel: string;
			location: string;
			yearMonth: string;
			apiCourtId: number;
			isTeam: boolean;
		}> = [];

		// resveId= 파라미터가 있는 "상세보기" 링크만 선택
		const detailLinks = Array.from(document.querySelectorAll('a[href*="resveId="]')).filter(
			(a) => (a.textContent?.trim() ?? '') === '상세보기'
		);

		for (const link of detailLinks) {
			const href = link.getAttribute('href') ?? '';

			// ★ resveId= 파라미터가 실제 apiCourtId (key=4292는 페이지 상수)
			const resveMatch = href.match(/[?&]resveId=(\d+)/);
			if (!resveMatch) continue;
			const apiCourtId = parseInt(resveMatch[1], 10);

			// 링크에서 LI 카드 컨테이너로 거슬러 올라가기
			let card: Element | null = link;
			while (card && card.tagName !== 'LI') {
				card = card.parentElement;
			}
			if (!card) continue;

			// 제목 추출: .reserve_title clone 후 .reserve_position 제거
			const titleEl = card.querySelector('.reserve_title');
			if (!titleEl) continue;

			const positionEl = titleEl.querySelector('.reserve_position');
			let listTitle: string;
			if (positionEl) {
				const clone = titleEl.cloneNode(true) as Element;
				const clonePos = clone.querySelector('.reserve_position');
				if (clonePos) clonePos.remove();
				listTitle = clone.textContent?.trim() ?? '';
			} else {
				listTitle = titleEl.textContent?.trim() ?? '';
			}

			if (!listTitle.includes('테니스') && !extraKeywords.some((k) => listTitle.includes(k))) continue;

			// 위치: .reserve_position 직접 참조
			const location = positionEl?.textContent?.trim() ?? '';

			// 제목 파싱: "[유료]기흥 테니스장(A코트)_02월" → facilityName + courtLabel
			const cleaned = listTitle
				.replace(/^\[.*?]/, '')
				.replace(/_\d{2}월$/, '')
				.trim();
			// (A코트) 형태 우선, 없으면 B코트·5코트처럼 괄호 없이 붙은 형태도 처리
			const courtMatch =
				cleaned.match(/\(([^)]+코트)\)$/) || cleaned.match(/([A-Za-z0-9]+코트)$/);
			const rawLabel = courtMatch ? courtMatch[1].replace('코트', '').trim() : '1';
			// 특수문자 제거 후 알파벳은 대문자로 정규화
			const courtLabel = rawLabel.replace(/[^A-Za-z0-9가-힣]/g, '').toUpperCase() || '1';
			const facilityName = cleaned
				.replace(/\s*\([^)]+코트\)$/, '')
				.replace(/[A-Za-z0-9]+코트$/, '')
				.trim();

			// 이용기간에서 연월 추출: "이용기간 : 2026-02-01 ~ 2026-02-28" → "2026-02"
			const buLis = Array.from(card.querySelectorAll('ul.bu > li, ul.bu li'));
			let yearMonth = '';
			for (const li of buLis) {
				const text = li.textContent ?? '';
				const m = text.match(/이용기간[^:：]*[:：]\s*(\d{4})-(\d{2})/);
				if (m) {
					yearMonth = `${m[1]}-${m[2]}`;
					break;
				}
			}
			if (!yearMonth) continue;

			const isTeam = buLis.some((li) => /신청구분[^:：]*[:：].*팀/.test(li.textContent ?? ''));

			results.push({ listTitle, facilityName, courtLabel, location, yearMonth, apiCourtId, isTeam });
		}

		return results;
	}, EXTRA_KEYWORDS);
}

// ─── 메인 ────────────────────────────────────────────────────────────────────
async function main() {
	config();

	const args = process.argv.slice(2);
	const isDryRun = args.includes('--dry-run');

	console.log('=== 용인 테니스장 시설 자동 탐색 ===');
	console.log(`모드: ${isDryRun ? 'dry-run (DB 변경 없음)' : '실제 실행 (DB UPSERT)'}`);
	console.log(`시작: ${new Date().toLocaleString('ko-KR')}\n`);

	// ─── DB 연결 및 기존 시설 로드 ──────────────────────────────────────────
	const { db } = await import('../src/lib/server/db/client.js');
	const { courts, courtApiMappings } = await import('../src/lib/server/db/schema.js');

	const courtRows = await db
		.select({ name: courts.name, rawName: courts.rawName, facilityKey: courts.facilityKey })
		.from(courts)
		.where(eq(courts.isActive, true));

	const yonginCourts = courtRows.filter((r) => r.facilityKey !== null);
	console.log(`DB 시설 (facilityKey 있음): ${yonginCourts.length}개`);
	yonginCourts.forEach((r) => console.log(`  - "${r.name}" [${r.facilityKey}]`));
	console.log('');

	// ─── Playwright 시작 ────────────────────────────────────────────────────
	const browser = await chromium.launch({
		headless: true,
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-blink-features=AutomationControlled',
			'--disable-dev-shm-usage',
			'--disable-gpu',
			'--no-zygote',
			'--single-process'
		]
	});

	const rawItems: RawCardItem[] = [];

	try {
		// 브라우저는 네트워크가 아니라 HTML 파서로만 쓴다 (fetchListHtml 주석 참고)
		const page = await browser.newPage();

		// 페이지 번호별 GET URL로 직접 순회 (페이지네이션 링크가 GET 방식)
		let pageNum = 1;
		const seenPageSignatures = new Set<string>(); // 반복 페이지 감지용

		while (true) {
			const url = getPageUrl(pageNum);
			console.log(`📄 페이지 ${pageNum} 로드 중...`);
			await page.setContent(await fetchListHtml(url));

			const items = await extractCardsFromPage(page);
			console.log(`  → ${items.length}개 카드 추출`);

			if (items.length === 0) {
				if (pageNum === 1) {
					// 첫 페이지에서 0개: 디버깅 정보 출력
					console.log('\n  ⚠️  카드를 찾지 못했습니다. 페이지 상태 확인:\n');
					const html = await page.content();
					console.log(`  - 'resveId=' 포함 여부: ${html.includes('resveId=')}`);
					console.log(`  - '테니스' 포함 여부: ${html.includes('테니스')}`);
					console.log(`  - '상세보기' 포함 여부: ${html.includes('상세보기')}`);
					if (!html.includes('resveId=')) {
						console.log('\n  HTML 앞 3000자:\n');
						console.log(html.slice(0, 3000));
					}
				}
				console.log(`  → 마지막 페이지 도달 (총 ${pageNum - 1}페이지 처리 완료)`);
				break;
			}

			// 동일한 페이지가 반복되면 마지막 페이지를 넘어선 것
			const signature = items.map((i) => i.apiCourtId).join(',');
			if (seenPageSignatures.has(signature)) {
				console.log(`  → 마지막 페이지 반복 감지, 종료`);
				break;
			}
			seenPageSignatures.add(signature);
			rawItems.push(...items);

			if (pageNum >= 30) {
				console.warn('  ⚠️  페이지 30 초과, 무한루프 방지로 종료');
				break;
			}

			pageNum++;
			await page.waitForTimeout(500); // 서버 부하 방지
		}

		// shortcut: 키워드당 1페이지(8카드)만 본다, 한 시설이 4코트를 넘으면 페이지 순회로 바꿀 것
		for (const keyword of EXTRA_KEYWORDS) {
			console.log(`🔎 키워드 '${keyword}' 조회 중...`);
			await page.setContent(await fetchListHtml(getKeywordUrl(keyword)));
			const items = (await extractCardsFromPage(page)).filter(
				(i) => !rawItems.some((r) => r.apiCourtId === i.apiCourtId)
			);
			console.log(`  → ${items.length}개 카드 추출`);
			rawItems.push(...items);
			await page.waitForTimeout(500);
		}
	} finally {
		await browser.close();
	}

	console.log(`\n총 ${rawItems.length}개 카드 추출 완료\n`);

	// 2026-11부터 같은 코트에 '개인(팀)' 사전접수 카드가 별도 resveId로 붙는다.
	// 둘 다 매핑하면 요청량이 2배라 용인 차단 위험 → 일반 카드가 있는 코트는 팀 카드를 버린다.
	// (아르피아처럼 팀 카드만 있는 코트는 그대로 쓴다)
	const courtKey = (i: RawCardItem) =>
		`${i.facilityName.replace(/\s+/g, '')}__${i.courtLabel}__${i.yearMonth}`;
	const hasGeneral = new Set(rawItems.filter((i) => !i.isTeam).map(courtKey));
	const selectedItems = rawItems.filter((i) => !i.isTeam || !hasGeneral.has(courtKey(i)));
	console.log(`팀 사전접수 카드 ${rawItems.length - selectedItems.length}개 제외\n`);

	// ─── 시설별 그룹화 ───────────────────────────────────────────────────────
	// facilityName + yearMonth 조합을 키로 그룹화
	const facilityMap = new Map<string, DiscoveredFacility>();

	for (const item of selectedItems) {
		const mapKey = `${item.facilityName}__${item.yearMonth}`;

		if (!facilityMap.has(mapKey)) {
			const facilityKey = matchFacilityKey(item.facilityName, yonginCourts);
			facilityMap.set(mapKey, {
				listTitle: item.listTitle,
				facilityName: item.facilityName,
				facilityKey,
				location: item.location,
				yearMonth: item.yearMonth,
				courts: [],
				isNew: facilityKey === null
			});
		}

		const facility = facilityMap.get(mapKey)!;
		// 중복 apiCourtId 방지
		if (!facility.courts.some((c) => c.apiCourtId === item.apiCourtId)) {
			facility.courts.push({ apiCourtId: item.apiCourtId, courtNumber: item.courtLabel });
		}
	}

	const facilities = Array.from(facilityMap.values());
	const knownFacilities = facilities.filter((f) => !f.isNew);
	const newFacilities = facilities.filter((f) => f.isNew);

	// ─── 결과 출력 ──────────────────────────────────────────────────────────
	console.log('=== 탐색 결과 ===\n');

	if (knownFacilities.length > 0) {
		console.log(`✅ 기존 시설 (DB 매칭 성공) ${knownFacilities.length}개:`);
		for (const f of knownFacilities) {
			console.log(`  [${f.facilityKey}] ${f.facilityName} (${f.yearMonth})`);
			for (const c of f.courts) {
				console.log(`    코트 ${c.courtNumber}: apiCourtId=${c.apiCourtId}`);
			}
		}
	}

	if (newFacilities.length > 0) {
		console.log(`\n⚠️  미등록 시설 (courts 테이블에 없음) ${newFacilities.length}개:`);
		for (const f of newFacilities) {
			console.log(`  ${f.facilityName} (${f.yearMonth}) @ ${f.location}`);
			for (const c of f.courts) {
				console.log(`    코트 ${c.courtNumber}: apiCourtId=${c.apiCourtId}`);
			}
		}
		console.log('\n  → courts 테이블에 시설 추가 후 스크립트 재실행하세요.');
	}

	// ─── JSON 저장 ──────────────────────────────────────────────────────────
	mkdirSync(OUTPUT_DIR, { recursive: true });
	writeFileSync(OUTPUT_FILE, JSON.stringify(facilities, null, 2), 'utf-8');
	console.log(`\n📄 결과 저장: ${OUTPUT_FILE}`);

	// ─── DB UPSERT (dry-run이 아닌 경우) ────────────────────────────────────
	if (!isDryRun) {
		if (knownFacilities.length === 0) {
			console.log('\n⚠️  DB에 등록할 매핑 없음 (매칭된 시설 0개)');
		} else {
			const mappingRows = knownFacilities.flatMap((f) =>
				f.courts.map((c) => ({
					facilityKey: f.facilityKey!,
					yearMonth: f.yearMonth,
					apiCourtId: c.apiCourtId,
					courtNumber: c.courtNumber
				}))
			);

			console.log(`\n💾 DB UPSERT: ${mappingRows.length}개 행 등록 중...`);
			await db.insert(courtApiMappings).values(mappingRows).onConflictDoNothing();
			console.log('✅ DB 갱신 완료');
			for (const row of mappingRows) {
				console.log(
					`  [${row.facilityKey}] ${row.yearMonth} 코트${row.courtNumber} = apiId:${row.apiCourtId}`
				);
			}
		}
	} else {
		const totalMappings = knownFacilities.reduce((sum, f) => sum + f.courts.length, 0);
		console.log(`\n[dry-run] DB 변경 생략 (등록 예정: ${totalMappings}개 매핑 행)`);
	}

	console.log('\n=== 완료 ===');
	console.log(
		`시설: ${facilities.length}개 | 매칭 성공: ${knownFacilities.length}개 | 미등록: ${newFacilities.length}개`
	);

	process.exit(0);
}

main().catch((err) => {
	console.error('오류:', err);
	process.exit(1);
});
