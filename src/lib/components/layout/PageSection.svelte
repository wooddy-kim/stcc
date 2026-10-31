<script lang="ts">
	/**
	 * PageSection - 페이지 섹션 컴포넌트
	 *
	 * @param title - 섹션 제목 (선택)
	 * @param background - 배경 스타일 ('transparent' | 'white' | 'gray' | 'gradient')
	 * @param centered - 제목 중앙 정렬 여부 (기본: true)
	 * @param spacing - 섹션 간격 ('lg' | 'md' | 'sm')
	 */
	export let title: string = '';
	export let background: 'transparent' | 'white' | 'gray' | 'gradient' = 'transparent';
	export let centered: boolean = true;
	export let spacing: 'lg' | 'md' | 'sm' = 'md';
</script>

<section
	class="page-section"
	class:bg-white={background === 'white'}
	class:bg-gray={background === 'gray'}
	class:bg-gradient={background === 'gradient'}
	class:spacing-lg={spacing === 'lg'}
	class:spacing-md={spacing === 'md'}
	class:spacing-sm={spacing === 'sm'}
>
	{#if title}
		<h2 class="section-title" class:centered>{title}</h2>
	{/if}
	<div class="section-content">
		<slot />
	</div>
</section>

<style>
	.page-section {
		margin-bottom: var(--space-12);
	}

	.spacing-lg {
		margin-bottom: var(--space-16);
	}

	.spacing-md {
		margin-bottom: var(--space-12);
	}

	.spacing-sm {
		margin-bottom: var(--space-8);
	}

	.bg-white {
		background: var(--color-bg-primary);
		border-radius: var(--radius-xl);
		padding: var(--space-8);
		box-shadow: var(--shadow-sm);
	}

	.bg-gray {
		background: var(--color-bg-secondary);
		border-radius: var(--radius-xl);
		padding: var(--space-8);
	}

	.bg-gradient {
		background: var(--gradient-primary);
		border-radius: var(--radius-xl);
		padding: var(--space-10) var(--space-8);
		box-shadow: var(--shadow-primary-lg);
	}

	.section-title {
		font-size: var(--text-2xl);
		font-weight: var(--font-bold);
		color: var(--color-text-primary);
		margin: 0 0 var(--space-8) 0;
	}

	.section-title.centered {
		text-align: center;
	}

	.bg-gradient .section-title {
		color: white;
	}

	@media (max-width: 768px) {
		.page-section {
			margin-bottom: var(--space-8);
		}

		.spacing-lg {
			margin-bottom: var(--space-12);
		}

		.bg-white,
		.bg-gray {
			padding: var(--space-6);
		}

		.bg-gradient {
			padding: var(--space-8) var(--space-6);
		}

		.section-title {
			font-size: var(--text-xl);
			margin-bottom: var(--space-6);
		}
	}
</style>
