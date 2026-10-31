<script lang="ts">
	import { favorites } from '$lib/stores/favorites';

	export let courtId: number;
	export let size: 'sm' | 'md' = 'md';
	export let showLabel = false;

	$: active = $favorites.includes(courtId);

	function handleClick(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		favorites.toggle(courtId);
	}
</script>

<button
	type="button"
	class="fav-btn {size}"
	class:active
	on:click={handleClick}
	aria-pressed={active}
	aria-label={active ? '관심 코트에서 제거' : '관심 코트로 추가'}
>
	<svg
		class="star"
		viewBox="0 0 24 24"
		fill={active ? 'currentColor' : 'none'}
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<polygon
			points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
		></polygon>
	</svg>
	{#if showLabel}
		<span>{active ? '관심 코트' : '관심 등록'}</span>
	{/if}
</button>

<style>
	.fav-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		min-width: 44px;
		min-height: 44px;
		padding: var(--space-2);
		border: none;
		background: transparent;
		border-radius: var(--radius-full);
		color: var(--color-gray-400);
		cursor: pointer;
		transition:
			color var(--transition-fast),
			background var(--transition-fast),
			transform var(--transition-fast);
	}

	.fav-btn.active {
		color: var(--color-accent-500);
	}

	.fav-btn:active {
		transform: scale(0.9);
	}

	@media (hover: hover) {
		.fav-btn:hover {
			background: var(--color-gray-100);
			color: var(--color-accent-500);
		}
	}

	.star {
		width: 22px;
		height: 22px;
		flex-shrink: 0;
	}

	.fav-btn.sm .star {
		width: 18px;
		height: 18px;
	}

	/* 라벨이 있을 때는 알약형 버튼 */
	.fav-btn:has(span) {
		min-width: auto;
		padding: var(--space-2) var(--space-4);
		border: 1.5px solid var(--color-border-default);
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
	}

	.fav-btn.active:has(span) {
		border-color: var(--color-accent-300);
		background: var(--color-accent-50);
	}
</style>
