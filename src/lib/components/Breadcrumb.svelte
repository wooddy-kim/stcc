<script lang="ts">
	export let items: Array<{ label: string; href?: string }>;
</script>

<nav aria-label="breadcrumb" class="breadcrumb">
	<ol>
		{#each items as item, index}
			<li>
				{#if item.href}
					<a href={item.href}>{item.label}</a>
				{:else}
					<span aria-current="page">{item.label}</span>
				{/if}
				{#if index < items.length - 1}
					<span class="separator">/</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>

<style>
	.breadcrumb {
		margin-bottom: var(--space-6);
		padding: var(--space-3) var(--space-4);
		background-color: var(--color-bg-secondary);
		border-radius: var(--radius-lg);
	}

	ol {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
	}

	li {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	a {
		color: var(--color-primary-600);
		text-decoration: none;
		transition: color var(--transition-base);
	}

	a:hover {
		color: var(--color-primary-700);
		text-decoration: underline;
	}

	span[aria-current='page'] {
		color: var(--color-text-primary);
		font-weight: var(--font-medium);
	}

	.separator {
		color: var(--color-text-tertiary);
	}

	@media (max-width: 640px) {
		.breadcrumb {
			padding: var(--space-2) var(--space-3);
			margin-bottom: var(--space-4);
		}

		li {
			font-size: var(--text-xs);
		}
	}
</style>
