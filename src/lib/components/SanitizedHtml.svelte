<script lang="ts">
	/**
	 * 서버에서 sanitize된 HTML만 전달할 것.
	 * 원시 사용자 입력을 넘기면 XSS가 발생한다.
	 *
	 * 변환과 sanitize는 `$lib/server/markdown.ts`의 renderMarkdown()이 담당한다.
	 * 이 컴포넌트는 렌더만 한다 — 그래야 본문이 SSR HTML에 포함된다.
	 */
	export let html: string;
</script>

<div class="markdown-content">
	{@html html}
</div>

<style>
	.markdown-content :global(h2) {
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		margin-top: var(--space-4);
		margin-bottom: var(--space-2);
		color: var(--color-text-primary);
	}

	.markdown-content :global(h3) {
		font-size: var(--text-base);
		font-weight: var(--font-semibold);
		margin-top: var(--space-3);
		margin-bottom: var(--space-2);
		color: var(--color-text-primary);
	}

	.markdown-content :global(ul) {
		list-style-type: disc;
		margin-left: var(--space-6);
		margin-top: var(--space-2);
		margin-bottom: var(--space-2);
	}

	.markdown-content :global(li) {
		margin-bottom: var(--space-1);
		color: var(--color-text-secondary);
		line-height: 1.6;
	}

	.markdown-content :global(p) {
		margin-bottom: var(--space-2);
		color: var(--color-text-secondary);
		line-height: 1.6;
	}

	.markdown-content :global(strong) {
		font-weight: var(--font-semibold);
		color: var(--color-text-primary);
	}

	.markdown-content :global(a) {
		color: var(--color-primary-600);
		text-decoration: underline;
		transition: color var(--transition-base);
	}

	.markdown-content :global(a:hover) {
		color: var(--color-primary-700);
	}

	.markdown-content :global(blockquote) {
		border-left: 4px solid var(--color-primary-500);
		padding-left: var(--space-4);
		margin: var(--space-4) 0;
		color: var(--color-text-secondary);
		font-style: italic;
	}

	.markdown-content :global(.video-container) {
		position: relative;
		width: 100%;
		height: 0;
		padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
		margin: var(--space-4) 0;
	}

	.markdown-content :global(.video-container iframe) {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border-radius: var(--radius-lg);
	}
</style>
