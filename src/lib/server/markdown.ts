import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

/**
 * 허용 태그.
 *
 * 저장된 콘텐츠(발행 글 76개 + 코트 정보 필드)에서 실제로 쓰이는 태그를 조사해 도출한 뒤,
 * marked가 마크다운에서 생성할 수 있는 표준 태그를 더했다.
 *
 * 실측 사용 태그: p, li, td, strong, h2, h3, tr, ol, th, blockquote, ul,
 * div, iframe, table, thead, tbody, del
 */
const ALLOWED_TAGS = [
	'p',
	'br',
	'hr',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'ul',
	'ol',
	'li',
	'strong',
	'b',
	'em',
	'i',
	'del',
	's',
	'code',
	'pre',
	'blockquote',
	'table',
	'thead',
	'tbody',
	'tfoot',
	'tr',
	'th',
	'td',
	'a',
	'img',
	'div',
	'span',
	'iframe'
];

/**
 * 마크다운 또는 HTML 문자열을 sanitize된 HTML로 변환한다.
 *
 * 서버에서만 호출한다. 결과는 `SanitizedHtml` 컴포넌트에 넘겨 `{@html}`로 렌더한다.
 * 이 변환을 서버에서 하는 이유는 본문이 SSR HTML에 포함되어야
 * 검색 색인과 AdSense 문맥 광고 매칭이 동작하기 때문이다.
 *
 * `tips.htmlContent`는 이미 HTML이고 `courts.*Info`는 마크다운이다.
 * `marked`는 원시 HTML 블록을 통과시키므로 두 입력을 모두 처리한다.
 *
 * **sanitizer로 `isomorphic-dompurify`를 쓸 수 없다.** 그 패키지는 jsdom에 의존하고,
 * jsdom의 `html-encoding-sniffer`(CJS)가 `@exodus/bytes`(ESM)를 `require()`한다.
 * Vercel 서버리스 로더가 `require(ESM)`을 지원하지 않아 `ERR_REQUIRE_ESM`으로
 * 상세 페이지 107개가 전부 500이 났다(nodejs20.x·22.x 모두에서 재현).
 * 로컬 dev·preview·프로덕션 빌드는 전부 통과하므로 배포 전에는 잡히지 않는다.
 * `sanitize-html`은 htmlparser2 기반이라 DOM 구현이 필요 없다 —
 * 이 제약 때문에 선택했으니 되돌리지 말 것.
 */
export function renderMarkdown(input: string | null | undefined): string {
	if (!input) return '';
	return sanitizeRenderedHtml(marked(input) as string);
}

/**
 * 이미 HTML인 문자열을 위 허용 목록으로 sanitize한다.
 *
 * `renderMarkdown`이 내부적으로 쓰고, `scripts/seed-tips.ts`·`scripts/produce-content.ts`가
 * DB에 저장하기 전에 같은 규칙을 적용하려고 쓴다. 허용 목록이 두 벌로 갈라지지 않도록
 * 여기 한 곳에만 둔다.
 */
export function sanitizeRenderedHtml(html: string): string {
	return sanitizeHtml(html, {
		allowedTags: ALLOWED_TAGS,
		allowedAttributes: {
			// 목차(TOC)가 h2/h3의 id에 의존한다 — `content/[slug]/+page.svelte`의
			// extractToc는 id 없는 헤딩을 항목으로 만들지 않는다.
			// class는 본문 스타일(.video-container 등)에 쓰인다.
			'*': ['id', 'class'],
			a: ['href', 'title', 'target', 'rel'],
			img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
			iframe: [
				'src',
				'width',
				'height',
				'title',
				'allow',
				'allowfullscreen',
				'frameborder',
				'scrolling',
				'loading',
				'referrerpolicy'
			],
			th: ['colspan', 'rowspan', 'scope'],
			td: ['colspan', 'rowspan']
		},
		// 저장된 콘텐츠의 iframe은 전부 www.youtube.com이다(76건 전수 확인).
		// 호스트를 제한해 임의 출처 임베드를 막는다 — 이전 DOMPurify 설정에는 없던 방어다.
		allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com'],
		allowedSchemes: ['http', 'https', 'mailto'],
		// 새 탭 링크에 noopener를 강제한다.
		transformTags: {
			a: (tagName, attribs) => ({
				tagName,
				attribs:
					attribs.target === '_blank'
						? { ...attribs, rel: attribs.rel ?? 'noopener noreferrer' }
						: attribs
			})
		}
	});
}
