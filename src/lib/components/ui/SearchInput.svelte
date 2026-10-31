<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	/**
	 * SearchInput - 검색 입력 컴포넌트
	 *
	 * @param value - 현재 입력 값
	 * @param placeholder - 플레이스홀더 텍스트
	 * @param showBorder - 하단 테두리 표시 여부
	 */
	export let value: string = '';
	export let placeholder: string = '검색어를 입력하세요...';
	export let showBorder: boolean = true;

	const dispatch = createEventDispatcher<{
		input: string;
		clear: void;
	}>();

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = target.value;
		dispatch('input', value);
	}

	function handleClear() {
		value = '';
		dispatch('input', '');
		dispatch('clear');
	}
</script>

<div class="search-bar" class:show-border={showBorder}>
	<div class="search-input-wrapper">
		<svg class="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
		</svg>
		<input
			type="text"
			class="search-input"
			{placeholder}
			bind:value
			on:input={handleInput}
		/>
		{#if value}
			<button class="clear-button" on:click={handleClear} type="button" aria-label="검색어 지우기">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		{/if}
	</div>
</div>

<style>
	.search-bar {
		margin-bottom: var(--space-8);
	}

	.show-border {
		padding-bottom: var(--space-6);
		border-bottom: 1px solid var(--color-border-light);
	}

	.search-input-wrapper {
		position: relative;
		max-width: 100%;
	}

	.search-icon {
		position: absolute;
		left: var(--space-5);
		top: 50%;
		transform: translateY(-50%);
		width: 1.25rem;
		height: 1.25rem;
		color: var(--color-text-disabled);
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: var(--space-4) var(--space-12) var(--space-4) 3.25rem;
		border: 2px solid var(--color-border-light);
		border-radius: var(--radius-lg);
		background: var(--color-bg-primary);
		font-size: var(--text-base);
		color: var(--color-text-primary);
		transition: all var(--transition-base);
		outline: none;
	}

	.search-input::placeholder {
		color: var(--color-text-disabled);
	}

	.search-input:focus {
		border-color: var(--color-primary-500);
		box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
	}

	.clear-button {
		position: absolute;
		right: var(--space-3);
		top: 50%;
		transform: translateY(-50%);
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		border-radius: var(--radius-full);
		background: transparent;
		color: var(--color-text-disabled);
		cursor: pointer;
		transition: all var(--transition-base);
	}

	.clear-button:hover {
		background: var(--color-bg-tertiary);
		color: var(--color-text-secondary);
	}

	.clear-button svg {
		width: 1.125rem;
		height: 1.125rem;
	}

	/* 태블릿 */
	@media (max-width: 768px) {
		.search-bar {
			margin-bottom: var(--space-6);
		}

		.search-input {
			padding: var(--space-3) 2.75rem var(--space-3) 3rem;
			font-size: var(--text-base);
		}
	}

	/* 모바일 */
	@media (max-width: 640px) {
		.search-bar {
			margin-bottom: var(--space-5);
		}

		.show-border {
			padding-bottom: var(--space-4);
		}

		.search-input {
			padding: var(--space-3) 2.5rem var(--space-3) 2.75rem;
			font-size: var(--text-sm);
			border-radius: var(--radius-md);
		}

		.search-icon {
			left: var(--space-4);
			width: 1.125rem;
			height: 1.125rem;
		}

		.clear-button {
			right: var(--space-2);
			width: 1.75rem;
			height: 1.75rem;
		}

		.clear-button svg {
			width: 1rem;
			height: 1rem;
		}
	}
</style>
