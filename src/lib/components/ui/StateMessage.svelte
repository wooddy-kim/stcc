<script lang="ts">
	/**
	 * StateMessage - 상태 표시 컴포넌트
	 *
	 * @param type - 상태 유형 ('loading' | 'error' | 'empty')
	 * @param message - 표시할 메시지
	 * @param hint - 추가 힌트 텍스트 (선택)
	 */
	export let type: 'loading' | 'error' | 'empty' = 'loading';
	export let message: string = '';
	export let hint: string = '';
</script>

<div class="state-message" class:loading={type === 'loading'} class:error={type === 'error'} class:empty={type === 'empty'}>
	{#if type === 'loading'}
		<div class="spinner"></div>
	{:else if type === 'error'}
		<div class="icon error-icon">!</div>
	{:else if type === 'empty'}
		<div class="icon empty-icon">
			<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
				<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
				<polyline points="14 2 14 8 20 8"></polyline>
				<line x1="12" y1="18" x2="12" y2="12"></line>
				<line x1="9" y1="15" x2="15" y2="15"></line>
			</svg>
		</div>
	{/if}

	{#if message}
		<p class="message">{message}</p>
	{/if}

	{#if hint}
		<p class="hint">{hint}</p>
	{/if}

	<slot />
</div>

<style>
	.state-message {
		text-align: center;
		padding: var(--space-16) var(--space-8);
		color: var(--color-text-secondary);
	}

	/* Spinner */
	.spinner {
		width: 3rem;
		height: 3rem;
		border: 4px solid var(--color-border-light);
		border-top-color: var(--color-primary-500);
		border-radius: var(--radius-full);
		animation: spin 1s linear infinite;
		margin: 0 auto var(--space-6);
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Icons */
	.icon {
		margin: 0 auto var(--space-6);
	}

	.error-icon {
		width: 3rem;
		height: 3rem;
		background: var(--color-error-100);
		color: var(--color-error-600);
		border-radius: var(--radius-full);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-2xl);
		font-weight: var(--font-bold);
	}

	.empty-icon {
		color: var(--color-text-disabled);
	}

	/* Message */
	.message {
		font-size: var(--text-base);
		color: var(--color-text-secondary);
		margin: 0 0 var(--space-2) 0;
	}

	.error .message {
		color: var(--color-error-600);
	}

	/* Hint */
	.hint {
		font-size: var(--text-sm);
		color: var(--color-text-disabled);
		margin: 0;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.state-message {
			padding: var(--space-12) var(--space-6);
		}

		.spinner {
			width: 2.5rem;
			height: 2.5rem;
		}
	}
</style>
