<script lang="ts">
	/**
	 * PageWrapper - 페이지 컨테이너 래퍼 컴포넌트
	 *
	 * @param variant - 레이아웃 변형 ('wide' | 'narrow' | 'full')
	 *   - wide: max-width 1200px (기본값, 일반 페이지용)
	 *   - narrow: max-width 800px (문서/글 페이지용)
	 *   - full: max-width 없음 (전체 너비)
	 * @param noPadding - 패딩 제거 여부
	 */
	export let variant: 'wide' | 'narrow' | 'full' = 'wide';
	export let noPadding: boolean = false;
</script>

<div
	class="page-wrapper"
	class:wide={variant === 'wide'}
	class:narrow={variant === 'narrow'}
	class:full={variant === 'full'}
	class:no-padding={noPadding}
>
	<slot />
</div>

<style>
	.page-wrapper {
		width: 100%;
		margin: 0 auto;
		padding: var(--space-8) var(--space-4);
	}

	.wide {
		max-width: var(--container-max);
	}

	.narrow {
		max-width: 800px;
	}

	.full {
		max-width: none;
	}

	.no-padding {
		padding: 0;
	}

	@media (max-width: 768px) {
		.page-wrapper {
			padding: var(--space-6) var(--space-4);
		}

		.no-padding {
			padding: 0;
		}
	}

	@media (max-width: 640px) {
		.page-wrapper {
			padding: var(--space-4) var(--space-3);
		}

		.no-padding {
			padding: 0;
		}
	}
</style>
