/**
 * SSR HTML에 본문과 내부 링크가 들어 있는지 검증한다.
 *
 * 사용법:
 *   npx tsx scripts/verify-ssr.ts                              # localhost:5173
 *   npx tsx scripts/verify-ssr.ts --url=https://courtnow.info   # 프로덕션
 *
 * 컴포넌트 단위 테스트 인프라가 없으므로 이 스크립트가 SSR 회귀를 막는 유일한 자동 검증이다.
 */

const urlArg = process.argv.find((a) => a.startsWith('--url='));
const BASE = (urlArg ? urlArg.slice('--url='.length) : 'http://localhost:5173').replace(/\/$/, '');

type Check = { name: string; pass: boolean; detail: string };
const checks: Check[] = [];

function record(name: string, pass: boolean, detail: string): void {
	checks.push({ name, pass, detail });
}

async function get(path: string): Promise<string> {
	const res = await fetch(`${BASE}${path}`);
	if (!res.ok) throw new Error(`GET ${path} → HTTP ${res.status}`);
	return res.text();
}

async function tryGet(path: string): Promise<string | null> {
	try {
		return await get(path);
	} catch (err) {
		console.log(`  (경고) ${path} 가져오기 실패: ${err instanceof Error ? err.message : err}`);
		return null;
	}
}

/** `.markdown-content` 컨테이너의 총 개수를 센다. */
function countSanitizedBlocks(html: string): number {
	return (html.match(/class="markdown-content[^"]*">/g) ?? []).length;
}

/**
 * 내용이 Svelte 주석 마커와 공백뿐인 `.markdown-content` 컨테이너의 개수를 센다.
 *
 * 정규식으로 "빈 모양"을 직접 매칭하는 방식은 쓸 수 없다 — lazy 수량자가 백트래킹으로
 * 확장되어 실제 콘텐츠를 건너뛰고 문서 뒤쪽 주석에 걸린다. Svelte 5는 `{@html}` 앞뒤에
 * 항상 anchor 주석을 붙이므로 그 방식은 콘텐츠가 있어도 항상 empty로 오판했다.
 *
 * 대신 여는 태그 뒤에서 주석을 모두 지우고, 남는 첫 토큰이 닫는 `</div>`인지 본다.
 * 실제 콘텐츠가 있으면 그 콘텐츠가 먼저 나오므로 empty로 판정되지 않는다.
 */
function countEmptyBlocks(html: string): number {
	let count = 0;
	const openTag = /class="markdown-content[^"]*">/g;
	let m: RegExpExecArray | null;
	while ((m = openTag.exec(html)) !== null) {
		const after = html.slice(m.index + m[0].length);
		const withoutComments = after.replace(/<!--[\s\S]*?-->/g, '').trimStart();
		if (withoutComments.startsWith('</div>')) count++;
	}
	return count;
}

function countAnchors(html: string, prefix: string): number {
	const re = new RegExp(`href="${prefix}[a-z0-9-]+"`, 'g');
	return (html.match(re) ?? []).length;
}

async function slugsFromSitemap(kind: 'content' | 'courts'): Promise<string[]> {
	const xml = await get('/sitemap.xml');
	const re = new RegExp(`<loc>[^<]*/${kind}/([a-z0-9-]+)</loc>`, 'g');
	const out: string[] = [];
	let m: RegExpExecArray | null;
	while ((m = re.exec(xml)) !== null) out.push(m[1]);
	return out;
}

async function main(): Promise<void> {
	console.log(`검증 대상: ${BASE}\n`);

	const contentSlugs = await slugsFromSitemap('content');
	const courtSlugs = await slugsFromSitemap('courts');

	if (contentSlugs.length === 0) throw new Error('사이트맵에 /content/ 항목이 없습니다');
	if (courtSlugs.length === 0) throw new Error('사이트맵에 /courts/ 항목이 없습니다');

	// 1. 글 상세 본문이 SSR HTML에 있는가
	const contentSlug = contentSlugs[0];
	const article = await tryGet(`/content/${contentSlug}`);
	if (article === null) {
		record(`글 상세 본문 SSR (/content/${contentSlug})`, false, '페이지 가져오기 실패');
	} else {
		const articleTotal = countSanitizedBlocks(article);
		const articleEmpty = countEmptyBlocks(article);
		record(
			`글 상세 본문 SSR (/content/${contentSlug})`,
			articleTotal > 0 && articleEmpty === 0,
			`markdown-content 블록 ${articleTotal}개 중 빈 블록 ${articleEmpty}개`
		);

		// 참고 지표: 본문 소제목. 관련 글 헤딩 1개가 항상 있으므로 2개 이상이면 본문 소제목 존재
		const h2Count = (article.match(/<h2/g) ?? []).length;
		console.log(`  (참고) 글 상세 <h2> 개수: ${h2Count} — 2 이상이면 본문 소제목 SSR됨`);
	}

	// 2. 코트 상세 정보 블록이 SSR HTML에 있는가
	//    정보 필드가 비어 있는 코트가 있으므로 최대 5개를 시도해 하나라도 통과하면 성공
	let courtPass = false;
	let courtDetail = '시도한 코트 모두 빈 블록';
	for (const slug of courtSlugs.slice(0, 5)) {
		const html = await tryGet(`/courts/${slug}`);
		if (html === null) continue;
		const total = countSanitizedBlocks(html);
		const empty = countEmptyBlocks(html);
		if (total > 0 && total > empty) {
			courtPass = true;
			courtDetail = `/courts/${slug} — 블록 ${total}개 중 내용 있는 블록 ${total - empty}개`;
			break;
		}
	}
	record('코트 상세 정보 SSR', courtPass, courtDetail);

	// 3·4. 홈 SSR에 코트 상세와 글 상세 anchor가 있는가
	const home = await tryGet('/');
	if (home === null) {
		record('홈 → 코트 상세 anchor', false, '페이지 가져오기 실패');
		record('홈 → 글 상세 anchor', false, '페이지 가져오기 실패');
	} else {
		const courtLinks = countAnchors(home, '/courts/');
		record('홈 → 코트 상세 anchor', courtLinks >= 1, `${courtLinks}개`);

		const contentLinks = countAnchors(home, '/content/');
		record('홈 → 글 상세 anchor', contentLinks >= 1, `${contentLinks}개`);
	}

	// 5. 코트 상세에서 글로 나가는 anchor가 있는가
	const courtPage = await tryGet(`/courts/${courtSlugs[0]}`);
	if (courtPage === null) {
		record('코트 상세 → 글 anchor', false, '페이지 가져오기 실패');
	} else {
		const courtToContent = countAnchors(courtPage, '/content/');
		record('코트 상세 → 글 anchor', courtToContent >= 1, `${courtToContent}개`);
	}

	// 결과 출력
	console.log('');
	for (const c of checks) {
		console.log(`${c.pass ? '✅' : '❌'} ${c.name} — ${c.detail}`);
	}

	const failed = checks.filter((c) => !c.pass).length;
	console.log(`\n${checks.length - failed}/${checks.length} 통과`);
	if (failed > 0) process.exit(1);
}

main().catch((err) => {
	console.error('검증 실행 실패:', err instanceof Error ? err.message : err);
	process.exit(1);
});
