<script lang="ts">
	import { onMount, onDestroy, afterUpdate } from 'svelte';
	import { browser } from '$app/environment';
	import { PUBLIC_ADSENSE_CLIENT_ID } from '$env/static/public';

	// Props
	export let adSlot: string;
	export let mobileAdSlot: string | undefined = undefined; // 모바일 전용 슬롯
	export let variant: 'display' | 'in-feed' | 'in-article' | 'multiplex' = 'display';
	export let minHeight: string = '60px'; // Display 수평 배너 기본값
	export let lazyLoad: boolean = false;
	export let layoutKey: string | undefined = undefined; // 사용자 정의 layout key
	export let breakpoint: number = 768; // 모바일 감지 기준

	// State
	let adVisible = false;
	let adContainer: HTMLElement;
	let insElement: HTMLElement;
	let isInitialized = false;
	let isMobile = false;
	let actualAdSlot: string;

	// Format mapping for each variant (AdSense 스니펫 기준)
	const formatMap: Record<typeof variant, string> = {
		display: 'horizontal', // 수평형 디스플레이 광고 (보수적 크기)
		'in-feed': 'fluid', // 네이티브 In-feed
		'in-article': 'fluid', // 기사 내 광고
		multiplex: 'autorelaxed' // Multiplex 반복 광고
	};

	// Layout for in-article ads
	const adLayout = variant === 'in-article' ? 'in-article' : undefined;

	// Layout key (AdSense에서 생성한 실제 키)
	// Props로 받은 layoutKey가 있으면 우선 사용, 없으면 기본값 사용
	const finalLayoutKey = layoutKey || (variant === 'in-feed' ? '-fb+5w+4e-db+86' : undefined);

	// 모바일에서는 responsive를 false로 설정하여 고정 크기 유지
	$: mobileResponsive = (isMobile && mobileAdSlot) ? 'false' : 'true';

	// Initialize ad (중복 방지 포함)
	function initializeAd() {
		if (!browser || !PUBLIC_ADSENSE_CLIENT_ID || !insElement || isInitialized) {
			return;
		}

		// 이미 AdSense에서 초기화된 광고인지 체크
		const status = insElement.getAttribute('data-adsbygoogle-status');
		if (status === 'done' || status === 'filled') {
			console.log('[AdSense] Already initialized, skipping...');
			isInitialized = true;
			return;
		}

		try {
			((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
			isInitialized = true;
			console.log('[AdSense] Ad initialized successfully', { slot: adSlot, variant });
		} catch (error) {
			console.error('[AdSense] Initialization failed:', error);
		}
	}

	onMount(() => {
		// 초기 화면 크기 감지
		isMobile = window.innerWidth < breakpoint;
		actualAdSlot = (isMobile && mobileAdSlot) ? mobileAdSlot : adSlot;

		// 화면 회전 대응
		const handleResize = () => {
			const wasMobile = isMobile;
			isMobile = window.innerWidth < breakpoint;

			// 모바일 상태 변경 시 슬롯 업데이트 (광고 재로드 방지)
			if (wasMobile !== isMobile) {
				actualAdSlot = (isMobile && mobileAdSlot) ? mobileAdSlot : adSlot;
				// 참고: 이미 로드된 광고는 유지, 새로고침 시에만 새 슬롯 적용
			}
		};

		window.addEventListener('resize', handleResize);

		if (!lazyLoad) {
			// Immediate load for non-lazy ads
			adVisible = true;
		} else {
			// Lazy load with IntersectionObserver
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting && !adVisible) {
							adVisible = true;
							observer.disconnect();
						}
					});
				},
				{
					rootMargin: '200px' // Pre-load 200px before viewport
				}
			);

			if (adContainer) {
				observer.observe(adContainer);
			}

			return () => {
				window.removeEventListener('resize', handleResize);
				if (adContainer) {
					observer.unobserve(adContainer);
				}
			};
		}

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});

	// DOM 업데이트 후 광고 초기화 (중복 방지)
	afterUpdate(() => {
		if (adVisible && insElement && !isInitialized) {
			initializeAd();
		}
	});

	onDestroy(() => {
		isInitialized = false;
	});
</script>

{#if PUBLIC_ADSENSE_CLIENT_ID}
	<!-- ad-outer-clip: 모바일 카드 외형 담당 레이어. 가로 오버플로우 방지는 안쪽 .ad-clip이 한다.
	     광고 높이는 제한하지 않는다 — CSS로 자르면 viewability 기준(50% 이상 1초)을
	     못 넘고 채움률이 떨어진다. CLS는 minHeight prop과 .ad-placeholder로 예약한다. -->
	<div class="ad-outer-clip" data-variant={variant}>
		<!-- ad-clip: AdSense가 height:auto !important를 주입하는 레이어 -->
		<div class="ad-clip" data-variant={variant}>
			<div
				class="ad-wrapper"
				class:loaded={isInitialized}
				style:min-height={!isInitialized ? minHeight : 'auto'}
				bind:this={adContainer}
				aria-label="Advertisement"
			>
				<div class="ad-label">Advertisement</div>

				{#if !isInitialized}
					<div class="ad-placeholder"></div>
				{/if}

				{#if adVisible}
					<ins
						bind:this={insElement}
						class="adsbygoogle"
						style="display:block"
						data-ad-client={PUBLIC_ADSENSE_CLIENT_ID}
						data-ad-slot={actualAdSlot}
						data-ad-format={formatMap[variant]}
						data-ad-layout={adLayout}
						data-full-width-responsive={mobileResponsive}
						data-ad-layout-key={finalLayoutKey}
					></ins>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	/* ad-outer-clip: 모바일 카드 외형 담당 레이어. 가로 오버플로우 방지는 안쪽 .ad-clip이 한다.
	   광고 높이는 제한하지 않는다 — CSS로 자르면 viewability 기준(50% 이상 1초)을
	   못 넘고 채움률이 떨어진다. CLS는 minHeight prop과 .ad-placeholder로 예약한다. */
	.ad-outer-clip {
		width: 100%;
		max-width: 100%;
	}

	@media (max-width: 768px) {
		/* outer-clip이 카드 역할: border/radius가 항상 완전하게 보임 */
		.ad-outer-clip[data-variant='display'] {
			border-radius: var(--radius-md, 8px);
			border: 1px solid var(--color-border-light, #e5e7eb);
			background: var(--color-bg-secondary, #f9fafb);
		}

		/* 내부 ad-wrapper 카드 스타일 제거 (outer-clip이 대신 제공) */
		.ad-outer-clip[data-variant='display'] .ad-wrapper,
		.ad-outer-clip[data-variant='display'] .ad-wrapper.loaded {
			border: none;
			background: transparent;
			border-radius: 0;
			margin: 0;
			box-shadow: none;
		}
	}

	/* ad-clip: AdSense가 height:auto !important를 주입하는 레이어 */
	.ad-clip {
		width: 100%;
		max-width: 100%;
		overflow: hidden;
	}

	.ad-wrapper {
		margin: var(--space-6, 1.5rem) 0;
		padding: var(--space-2, 0.5rem);
		background: var(--color-bg-secondary, #f9fafb);
		border: 1px solid var(--color-border-light, #e5e7eb);
		border-radius: var(--radius-md, 8px);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1, 0.25rem);
		position: relative;
		overflow: hidden;
	}

	/* 광고가 로드된 후 최소 여백 */
	.ad-wrapper.loaded {
		min-height: 0 !important;
		padding: var(--space-1, 0.25rem);
	}

	.ad-label {
		font-size: 0.625rem;
		color: var(--color-text-tertiary, #9ca3af);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 500;
	}

	.ad-placeholder {
		width: 100%;
		height: 70px;
		background: linear-gradient(
			90deg,
			var(--color-bg-tertiary, #e5e7eb) 25%,
			var(--color-bg-secondary, #d1d5db) 50%,
			var(--color-bg-tertiary, #e5e7eb) 75%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
		border-radius: var(--radius-sm, 4px);
	}

	@keyframes shimmer {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}

	.adsbygoogle {
		width: 100%;
		max-width: 100%;
		margin: 0;
		padding: 0;
		line-height: 1;
	}

	/* Mobile optimization */
	@media (max-width: 768px) {
		.ad-wrapper {
			margin: var(--space-2, 0.5rem) 0;
			padding: var(--space-1, 0.25rem);
		}


		.ad-wrapper.loaded {
			margin: var(--space-2, 0.5rem) 0;
			padding: 0;
			min-height: 0 !important;
		}

		.ad-label {
			font-size: 0.5rem;
			margin: 0;
			padding: 0.125rem 0;
		}

		.ad-placeholder {
			height: 100px; /* 320x100 배너 높이 */
			margin: 0;
		}

		/* 광고 컨테이너 여백 최소화 */
		.ad-wrapper :global(.adsbygoogle) {
			margin: 0 !important;
			padding: 0 !important;
		}
	}

	/* 더 작은 모바일 (480px 이하) */
	@media (max-width: 480px) {
		.ad-placeholder {
			height: 60px; /* 320x50 배너 높이 */
		}
	}

	/* Accessibility */
	@media (prefers-reduced-motion: reduce) {
		.ad-placeholder {
			animation: none;
			background: var(--color-bg-tertiary, #e5e7eb);
		}
	}
</style>
