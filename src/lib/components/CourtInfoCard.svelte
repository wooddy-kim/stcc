<script lang="ts">
	export let title: string;
	export let icon: string = '📋';
	export let variant: 'default' | 'highlight' = 'default';
</script>

<div class="info-card" class:highlight={variant === 'highlight'}>
	<div class="card-header">
		<span class="card-icon">{icon}</span>
		<h3 class="card-title">{title}</h3>
	</div>
	<div class="card-content">
		<slot />
	</div>
</div>

<style>
	.info-card {
		background: var(--color-bg-primary);
		border: 2px solid var(--color-border-light);
		border-radius: var(--radius-xl);
		padding: var(--space-6);
		transition: all var(--transition-base);
	}

	.info-card:hover {
		border-color: var(--color-border-default);
		box-shadow: var(--shadow-sm);
	}

	.info-card.highlight {
		background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-primary) 100%);
		border-color: var(--color-primary-500);
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
		padding-bottom: var(--space-3);
		border-bottom: 2px solid var(--color-bg-tertiary);
	}

	.card-icon {
		font-size: var(--text-2xl);
		line-height: 1;
	}

	.card-title {
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		color: var(--color-text-primary);
		margin: 0;
	}

	.card-content {
		color: var(--color-text-secondary);
		font-size: var(--text-base);
		line-height: 1.6;
	}

	.card-content :global(p) {
		margin: 0 0 var(--space-3) 0;
	}

	.card-content :global(p:last-child) {
		margin-bottom: 0;
	}

	.card-content :global(ul) {
		margin: 0;
		padding-left: var(--space-5);
	}

	.card-content :global(li) {
		margin-bottom: var(--space-2);
	}

	.card-content :global(li:last-child) {
		margin-bottom: 0;
	}

	.card-content :global(strong) {
		color: var(--color-text-primary);
		font-weight: var(--font-semibold);
	}

	@media (max-width: 640px) {
		.info-card {
			padding: var(--space-5);
		}

		.card-title {
			font-size: var(--text-base);
		}

		.card-content {
			font-size: var(--text-sm);
		}
	}
</style>
