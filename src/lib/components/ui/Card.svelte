<script lang="ts">
	/**
	 * Card - 카드 컴포넌트
	 *
	 * @param variant - 카드 스타일 ('default' | 'highlight' | 'outline')
	 * @param padding - 패딩 크기 ('sm' | 'md' | 'lg')
	 * @param hoverable - 호버 효과 적용
	 * @param href - 링크 URL (링크 카드로 사용)
	 */
	export let variant: 'default' | 'highlight' | 'outline' = 'default';
	export let padding: 'sm' | 'md' | 'lg' = 'md';
	export let hoverable: boolean = false;
	export let href: string | undefined = undefined;
</script>

{#if href}
	<a
		{href}
		class="card"
		class:default={variant === 'default'}
		class:highlight={variant === 'highlight'}
		class:outline={variant === 'outline'}
		class:padding-sm={padding === 'sm'}
		class:padding-md={padding === 'md'}
		class:padding-lg={padding === 'lg'}
		class:hoverable
	>
		<slot />
	</a>
{:else}
	<div
		class="card"
		class:default={variant === 'default'}
		class:highlight={variant === 'highlight'}
		class:outline={variant === 'outline'}
		class:padding-sm={padding === 'sm'}
		class:padding-md={padding === 'md'}
		class:padding-lg={padding === 'lg'}
		class:hoverable
	>
		<slot />
	</div>
{/if}

<style>
	.card {
		background: var(--color-bg-primary);
		border-radius: var(--radius-lg);
		transition: all var(--transition-base);
		text-decoration: none;
		color: inherit;
		display: block;
	}

	/* Padding */
	.padding-sm {
		padding: var(--space-4);
	}

	.padding-md {
		padding: var(--space-6);
	}

	.padding-lg {
		padding: var(--space-8);
	}

	/* Default Variant */
	.default {
		box-shadow: var(--shadow-sm);
		border: 1px solid var(--color-border-light);
	}

	/* Highlight Variant */
	.highlight {
		background: var(--gradient-primary-soft);
		border: 2px solid var(--color-primary-500);
		box-shadow: var(--shadow-primary-sm);
	}

	/* Outline Variant */
	.outline {
		border: 2px solid var(--color-border-default);
		box-shadow: none;
	}

	/* Hoverable */
	.hoverable:hover {
		transform: var(--hover-lift);
		box-shadow: var(--shadow-md);
	}

	.hoverable.highlight:hover {
		box-shadow: var(--shadow-primary-md);
	}

	a.card.hoverable:hover {
		border-color: var(--color-primary-500);
	}
</style>
