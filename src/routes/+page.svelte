<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import TimeFirstBoard from '$lib/components/TimeFirstBoard.svelte';
	import ContentGatewayMulti from '$lib/components/ContentGatewayMulti.svelte';
	import CourtIndex from '$lib/components/CourtIndex.svelte';
	import AdSenseBanner from '$lib/components/ads/AdSenseBanner.svelte';
	import { AD_SLOTS } from '$lib/config/ads';

	// SSR 데이터 (SEO용)
	export let data: PageData;
	// 코트 이름을 전부 이어붙이면 418자가 되어 검색 스니펫이 잘리고(구글 약 155자,
	// 네이버 권고 80자) "사이트가 무엇인지"를 전달하지 못한다. 코트명은 본문의
	// 코트 링크 섹션·JSON-LD ItemList·keywords 메타에 이미 들어 있어 색인에는 영향이 없다.
	const pageDescription = `수원·화성·용인 등 수도권 공공 테니스장 ${data.courts.length}개의 예약 가능 시간을 실시간으로 확인하세요.`;

	// 하단 광고는 데스크톱에서만 (모바일 광고 밀도 조정)
	let isMobile = false;
	onMount(() => {
		isMobile = window.innerWidth < 640;
	});
</script>

<svelte:head>
	<title>수도권 공공 테니스장 예약 현황 | CourtNow</title>
	<meta name="description" content={pageDescription} />

	<!-- Open Graph Tags -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="수도권 공공 테니스장 예약 현황 | CourtNow" />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:url" content="https://courtnow.info" />
	<meta property="og:site_name" content="CourtNow" />
	<meta property="og:locale" content="ko_KR" />
	<meta property="og:image" content="https://courtnow.info/og-image.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />

	<!-- Twitter Card Tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="수도권 공공 테니스장 예약 현황 | CourtNow" />
	<meta name="twitter:description" content={pageDescription} />
	<meta name="twitter:image" content="https://courtnow.info/og-image.png" />

	<!-- Canonical URL -->
	<link rel="canonical" href="https://courtnow.info" />

	<!-- Structured Data (JSON-LD) -->
	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "WebApplication",
			"name": "CourtNow - 수도권 공공 테니스장 예약 현황",
			"description": "수도권 공공 테니스장 예약 현황을 한눈에 확인하세요. 망포테니스장, 여울테니스장 등 실시간 예약 정보 제공",
			"url": "https://courtnow.info",
			"applicationCategory": "LifestyleApplication",
			"operatingSystem": "All",
			"offers": {
				"@type": "Offer",
				"price": "0",
				"priceCurrency": "KRW"
			},
			"aggregateRating": {
				"@type": "AggregateRating",
				"ratingValue": "5",
				"ratingCount": "1"
			},
			"areaServed": {
				"@type": "Place",
				"name": "수도권",
				"addressRegion": "경기도",
				"addressCountry": "KR"
			},
			"inLanguage": "ko-KR",
			"availableOnDevice": ["Desktop", "Mobile"]
		}
	</script>

	<!-- ItemList JSON-LD (코트 목록 구조화 데이터) -->
	{@html `<script type="application/ld+json">
		${JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'ItemList',
			name: '수도권 공공 테니스장 목록',
			itemListElement: data.courts
				.filter((c) => c.slug)
				.map((c, i) => ({
					'@type': 'ListItem',
					position: i + 1,
					name: c.name,
					url: `https://courtnow.info/courts/${c.slug}`
				}))
		})}
	<\/script>`}
</svelte:head>

<div class="container">
	<main>
		<!-- 1. TOP BANNER (즉시 로드) -->
		<AdSenseBanner
			adSlot={AD_SLOTS.home.top}
			mobileAdSlot={AD_SLOTS.home.topMobile}
			variant="display"
			minHeight="60px"
			breakpoint={768}
		/>

		<TimeFirstBoard
			courts={data.courts}
			regions={data.regions}
			lastDay={data.lastDay}
			initialRegion={$page.url.searchParams.get('region')}
		/>

		<!-- 지도 게이트웨이 -->
		<a href="/map" class="gateway">
			<div class="gateway-icon">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
					<line x1="9" y1="3" x2="9" y2="18"></line>
					<line x1="15" y1="6" x2="15" y2="21"></line>
				</svg>
			</div>
			<div class="gateway-text">
				<span class="gateway-title">지도에서 전체 코트 현황 보기</span>
				<span class="gateway-sub">위치 기반으로 가까운 코트를 한눈에 확인하세요</span>
			</div>
			<svg
				class="gateway-arrow"
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<polyline points="9 18 15 12 9 6"></polyline>
			</svg>
		</a>

		<!-- 목록 하단 광고 (In-feed, Lazy Load) -->
		<AdSenseBanner
			adSlot={AD_SLOTS.home.listBottom}
			variant="in-feed"
			lazyLoad={true}
			minHeight="100px"
		/>

		<!-- 하단 콘텐츠 게이트웨이 -->
		<ContentGatewayMulti tips={data.tips} />

		<CourtIndex courts={data.courts} />

		<!-- 3. FOOTER BANNER (데스크톱만, Lazy Load) -->
		{#if !isMobile}
			<AdSenseBanner
				adSlot={AD_SLOTS.home.footer}
				variant="display"
				lazyLoad={true}
				minHeight="90px"
			/>
		{/if}
	</main>
</div>

<style>
	.container {
		max-width: var(--container-max);
		margin: 0 auto;
		padding: var(--space-4);
	}

	main {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	/* 지도 게이트웨이 */
	.gateway {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-sm);
		padding: var(--space-3) var(--space-4);
		margin-bottom: var(--space-4);
		text-decoration: none;
		color: inherit;
		transition: all var(--transition-base);
	}
	.gateway:hover {
		border-color: var(--color-primary-300);
		background: var(--color-primary-50);
		box-shadow: var(--shadow-primary-sm);
		color: inherit;
	}
	.gateway-icon {
		width: 40px;
		height: 40px;
		flex-shrink: 0;
		background: var(--color-primary-100);
		color: var(--color-primary-600);
		border-radius: var(--radius-lg);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.gateway-text {
		flex: 1;
		min-width: 0;
	}
	.gateway-title {
		display: block;
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		color: var(--color-text-primary);
	}
	.gateway-sub {
		display: block;
		font-size: var(--text-xs);
		color: var(--color-text-tertiary);
		margin-top: 2px;
	}
	.gateway-arrow {
		color: var(--color-gray-400);
		flex-shrink: 0;
	}

	@media (max-width: 768px) {
		.container {
			padding: var(--space-2);
		}

		main {
			gap: 0;
		}
	}

	@media (max-width: 640px) {
		.container {
			padding: var(--space-2);
		}
	}
</style>
