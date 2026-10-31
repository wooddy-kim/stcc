<script lang="ts">
	/**
	 * Button - 통합 버튼 컴포넌트
	 *
	 * @param variant - 버튼 스타일 ('primary' | 'secondary' | 'ghost')
	 * @param size - 버튼 크기 ('sm' | 'md' | 'lg')
	 * @param href - 링크 URL (a 태그로 렌더링)
	 * @param fullWidth - 전체 너비 사용
	 * @param disabled - 비활성화 상태
	 */
	export let variant: 'primary' | 'secondary' | 'ghost' = 'primary';
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let href: string | undefined = undefined;
	export let fullWidth: boolean = false;
	export let disabled: boolean = false;
	export let type: 'button' | 'submit' | 'reset' = 'button';
</script>

{#if href}
	<a
		{href}
		class="button"
		class:primary={variant === 'primary'}
		class:secondary={variant === 'secondary'}
		class:ghost={variant === 'ghost'}
		class:size-sm={size === 'sm'}
		class:size-md={size === 'md'}
		class:size-lg={size === 'lg'}
		class:full-width={fullWidth}
		class:disabled
	>
		<slot />
	</a>
{:else}
	<button
		{type}
		{disabled}
		class="button"
		class:primary={variant === 'primary'}
		class:secondary={variant === 'secondary'}
		class:ghost={variant === 'ghost'}
		class:size-sm={size === 'sm'}
		class:size-md={size === 'md'}
		class:size-lg={size === 'lg'}
		class:full-width={fullWidth}
		on:click
	>
		<slot />
	</button>
{/if}

<style>
	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		border: none;
		border-radius: var(--radius-md);
		font-weight: var(--font-semibold);
		cursor: pointer;
		text-decoration: none;
		transition: all var(--transition-base);
	}

	/* Sizes */
	.size-sm {
		padding: var(--space-2) var(--space-4);
		font-size: var(--text-sm);
	}

	.size-md {
		padding: var(--space-3) var(--space-6);
		font-size: var(--text-base);
	}

	.size-lg {
		padding: var(--space-4) var(--space-8);
		font-size: var(--text-lg);
	}

	/* Primary Variant */
	.primary {
		background: var(--gradient-primary);
		color: white;
		box-shadow: var(--shadow-primary-sm);
	}

	.primary:hover:not(.disabled) {
		transform: var(--hover-lift);
		box-shadow: var(--shadow-primary-md);
	}

	.primary:active:not(.disabled) {
		transform: var(--active-scale);
	}

	/* Secondary Variant */
	.secondary {
		background: var(--color-bg-primary);
		color: var(--color-primary-600);
		border: 2px solid var(--color-primary-500);
	}

	.secondary:hover:not(.disabled) {
		background: var(--color-primary-50);
		border-color: var(--color-primary-600);
	}

	.secondary:active:not(.disabled) {
		transform: var(--active-scale);
	}

	/* Ghost Variant */
	.ghost {
		background: transparent;
		color: var(--color-primary-600);
	}

	.ghost:hover:not(.disabled) {
		background: var(--color-primary-50);
		color: var(--color-primary-700);
	}

	/* Full Width */
	.full-width {
		width: 100%;
	}

	/* Disabled */
	.disabled {
		opacity: 0.5;
		cursor: not-allowed;
		pointer-events: none;
	}

	/* Focus */
	.button:focus-visible {
		outline: 2px solid var(--color-primary-500);
		outline-offset: 2px;
	}
</style>
