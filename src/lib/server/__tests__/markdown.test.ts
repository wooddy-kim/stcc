import { describe, it, expect } from 'vitest';
import { renderMarkdown } from '../markdown';

describe('renderMarkdown', () => {
	it('빈 입력은 빈 문자열을 반환한다', () => {
		expect(renderMarkdown(null)).toBe('');
		expect(renderMarkdown(undefined)).toBe('');
		expect(renderMarkdown('')).toBe('');
	});

	it('마크다운 제목을 HTML로 변환한다', () => {
		const out = renderMarkdown('## 서브 자세');
		expect(out).toContain('<h2');
		expect(out).toContain('서브 자세');
	});

	it('마크다운 목록을 HTML로 변환한다', () => {
		const out = renderMarkdown('- 첫째\n- 둘째');
		expect(out).toContain('<ul');
		expect(out).toContain('첫째');
		expect(out).toContain('둘째');
	});

	it('이미 HTML인 입력을 통과시킨다 (tips.htmlContent 경로)', () => {
		const out = renderMarkdown('<h2 id="toss">토스</h2><p>본문입니다</p>');
		expect(out).toContain('<h2');
		expect(out).toContain('토스');
		expect(out).toContain('본문입니다');
	});

	// 헤딩의 id가 살아남아야 한다. `content/[slug]/+page.svelte`의 extractToc가
	// id 없는 헤딩을 목차 항목으로 만들지 않으므로, id를 지우면 글 76개에서
	// 목차·사이드바 TOC·스크롤 하이라이트가 조용히 사라진다.
	it('헤딩의 id 속성을 보존한다 (목차가 여기에 의존)', () => {
		const out = renderMarkdown('<h2 id="serve-basic">서브 기본</h2><h3 id="grip">그립</h3>');
		expect(out).toContain('id="serve-basic"');
		expect(out).toContain('id="grip"');
	});

	it('실제 콘텐츠에서 쓰이는 태그를 보존한다', () => {
		const out = renderMarkdown(
			'<table><thead><tr><th>구분</th></tr></thead><tbody><tr><td>값</td></tr></tbody></table>' +
				'<blockquote><p>인용</p></blockquote><ol><li>하나</li></ol><del>취소</del>' +
				'<div class="video-container"></div>'
		);
		for (const tag of ['<table', '<thead', '<tbody', '<tr', '<th', '<td', '<blockquote', '<ol', '<li', '<del']) {
			expect(out).toContain(tag);
		}
		expect(out).toContain('class="video-container"');
	});

	it('YouTube iframe을 유지한다', () => {
		const out = renderMarkdown(
			'<iframe src="https://www.youtube.com/embed/abc123" allow="autoplay" allowfullscreen></iframe>'
		);
		expect(out).toContain('<iframe');
		expect(out).toContain('youtube.com/embed/abc123');
		expect(out).toContain('allowfullscreen');
	});

	it('YouTube 이외 호스트의 iframe은 제거한다', () => {
		const out = renderMarkdown('<iframe src="https://evil.example.com/x"></iframe>');
		expect(out).not.toContain('evil.example.com');
	});

	it('javascript: 스킴 링크를 제거한다', () => {
		const out = renderMarkdown('<a href="javascript:alert(1)">클릭</a>');
		expect(out).not.toContain('javascript:');
	});

	it('script 태그를 제거한다', () => {
		const out = renderMarkdown('<p>안전한 내용</p><script>alert(1)<\/script>');
		expect(out).toContain('안전한 내용');
		expect(out).not.toContain('<script');
	});

	it('이벤트 핸들러 속성을 제거한다', () => {
		const out = renderMarkdown('<img src="x" onerror="alert(1)">');
		expect(out).not.toContain('onerror');
	});
});
