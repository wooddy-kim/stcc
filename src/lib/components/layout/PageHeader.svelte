<script lang="ts">
	/**
	 * PageHeader - 페이지 헤더 컴포넌트
	 *
	 * @param title - 페이지 제목
	 * @param description - 페이지 설명 (선택)
	 * @param centered - 중앙 정렬 여부 (기본: true)
	 * @param size - 제목 크기 ('lg' | 'md' | 'sm')
	 * @param gradient - 그라데이션 텍스트 효과 (기본: false)
	 * @param showDecoration - 장식 요소 표시 여부 (기본: false)
	 */
	export let title: string;
	export let description: string = '';
	export let centered: boolean = true;
	export let size: 'lg' | 'md' | 'sm' = 'lg';
	export let gradient: boolean = false;
	export let showDecoration: boolean = false;
</script>

<header
	class="page-header"
	class:centered
	class:size-lg={size === 'lg'}
	class:size-md={size === 'md'}
	class:size-sm={size === 'sm'}
>
	{#if showDecoration}
		<div class="decoration-line"></div>
	{/if}
	<h1 class="page-title" class:gradient-text={gradient}>{title}</h1>
	{#if description}
		<p class="page-description">{description}</p>
	{/if}
	<slot />
</header>

<style>
	.page-header {
		margin-bottom: var(--space-12);
		position: relative;
	}

	.centered {
		text-align: center;
	}

	/* 장식 라인 */
	.decoration-line {
		width: 60px;
		height: 4px;
		background: var(--gradient-primary);
		border-radius: var(--radius-full);
		margin-bottom: var(--space-6);
	}

	.centered .decoration-line {
		margin-left: auto;
		margin-right: auto;
	}

	/* 제목 스타일 */
	.page-title {
		font-weight: var(--font-extrabold);
		color: var(--color-text-primary);
		margin: 0 0 var(--space-5) 0;
		line-height: var(--leading-tight);
		letter-spacing: -0.025em;
		/* 마지막 한 글자만 다음 줄로 떨어지는 것을 막는다 (미지원 브라우저는 기존과 동일) */
		text-wrap: balance;
		/* 한글은 기본값이면 단어 한가운데서 끊긴다 ("예약" → "예" + "약") */
		word-break: keep-all;
		overflow-wrap: break-word;
	}

	/* 그라데이션 텍스트 효과 */
	.gradient-text {
		background: var(--gradient-primary);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	/* 크기별 스타일 - PC 기준 */
	.size-lg .page-title {
		font-size: var(--text-4xl);
	}

	.size-md .page-title {
		font-size: var(--text-3xl);
	}

	.size-sm .page-title {
		font-size: var(--text-2xl);
	}

	/* 설명 텍스트 */
	.page-description {
		font-size: var(--text-lg);
		color: var(--color-text-secondary);
		margin: 0;
		line-height: var(--leading-relaxed);
		text-wrap: balance;
		word-break: keep-all;
		overflow-wrap: break-word;
	}

	.centered .page-description {
		max-width: 700px;
		margin: 0 auto;
	}

	/* 태블릿 */
	@media (max-width: 768px) {
		.page-header {
			margin-bottom: var(--space-10);
		}

		.size-lg .page-title {
			font-size: var(--text-3xl);
		}

		.size-md .page-title {
			font-size: var(--text-2xl);
		}

		.size-sm .page-title {
			font-size: var(--text-xl);
		}

		.page-description {
			font-size: var(--text-base);
		}

		.decoration-line {
			width: 50px;
			height: 3px;
			margin-bottom: var(--space-5);
		}
	}

	/* 모바일 */
	@media (max-width: 640px) {
		.page-header {
			margin-bottom: var(--space-8);
		}

		.size-lg .page-title {
			font-size: var(--text-2xl);
		}

		.size-md .page-title {
			font-size: var(--text-xl);
		}

		.size-sm .page-title {
			font-size: var(--text-lg);
		}

		.decoration-line {
			width: 40px;
			margin-bottom: var(--space-4);
		}
	}
</style>
