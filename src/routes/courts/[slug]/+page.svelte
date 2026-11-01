<script lang="ts">
	import type { PageData } from './$types';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import CourtHero from '$lib/components/CourtHero.svelte';
	import CourtTimetable from '$lib/components/CourtTimetable.svelte';
	import CourtInfoCard from '$lib/components/CourtInfoCard.svelte';
	import SanitizedHtml from '$lib/components/SanitizedHtml.svelte';
	import AdSenseBanner from '$lib/components/ads/AdSenseBanner.svelte';
	import { AD_SLOTS } from '$lib/config/ads';
	import { courtSeo } from '$lib/utils/court-seo';

	export let data: PageData;

	const { court, relatedTips } = data;

	// Breadcrumb items
	const breadcrumbItems = [
		{ label: '예약 현황', href: '/' },
		{ label: court.name }
	];

	// Parse facilities JSON if available
	let facilities: string[] = [];
	try {
		if (court.facilities) {
			facilities = JSON.parse(court.facilities);
		}
	} catch (e) {
		console.warn('Failed to parse facilities JSON:', e);
	}

	// SEO metadata
	const { title: pageTitle, description: pageDescription } = courtSeo(court);
	const canonicalUrl = `https://courtnow.info/courts/${court.slug}`;
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="article" />
	<meta property="og:title" content={court.name} />
	<meta property="og:description" content={pageDescription} />
	{#if court.imageUrl}
		<meta property="og:image" content={court.imageUrl} />
	{/if}
	<meta property="og:url" content={canonicalUrl} />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={court.name} />
	<meta name="twitter:description" content={pageDescription} />
	{#if court.imageUrl}
		<meta name="twitter:image" content={court.imageUrl} />
	{/if}

	<!-- Canonical URL -->
	<link rel="canonical" href={canonicalUrl} />

	<!-- JSON-LD Structured Data (SportsActivityLocation + LocalBusiness) -->
	{@html `<script type="application/ld+json">
		${JSON.stringify({
			'@context': 'https://schema.org',
			'@type': ['SportsActivityLocation', 'LocalBusiness'],
			name: court.name,
			image: court.imageUrl || undefined,
			description: pageDescription,
			address: court.address
				? {
						'@type': 'PostalAddress',
						addressLocality: court.regionName ||
									 court.address?.split(' ').find(part => part.endsWith('시')) ||
									 '경기도',
						addressRegion: '경기도',
						addressCountry: 'KR',
						streetAddress: court.address
					}
				: undefined,
			url: canonicalUrl
		})}
	<\/script>`}

	<!-- JSON-LD Structured Data (BreadcrumbList) -->
	{@html `<script type="application/ld+json">
		${JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [
				{
					'@type': 'ListItem',
					position: 1,
					name: '예약 현황',
					item: 'https://courtnow.info'
				},
				{
					'@type': 'ListItem',
					position: 2,
					name: court.name,
					item: canonicalUrl
				}
			]
		})}
	<\/script>`}
</svelte:head>

<div class="page-container">
	<Breadcrumb items={breadcrumbItems} />

	<CourtHero
		title={court.name}
		imageUrl={court.imageUrl}
		address={court.address}
		totalCourts={court.totalCourts}
		naverMapUrl={court.naverMapUrl}
		reservationUrl={court.reservationUrl}
		courtId={court.id}
	/>

	<CourtTimetable courtId={court.id} />

	<!-- 1. 히어로 아래 (Lazy Load) -->
	<AdSenseBanner adSlot={AD_SLOTS.courtDetail.afterHero} variant="in-article" minHeight="50px" lazyLoad={true} />

	<!-- Info Cards Grid -->
	<div class="info-grid">
		<CourtInfoCard title="기본 정보" icon="📍">
			<ul>
				{#if court.address}
					<li><strong>주소:</strong> {court.address}</li>
				{/if}
				{#if court.totalCourts}
					<li><strong>코트 수:</strong> {court.totalCourts}개</li>
				{/if}
				{#if court.surfaceType}
					<li><strong>코트 표면:</strong> {court.surfaceType}</li>
				{/if}
				{#if court.regionName}
					<li><strong>지역:</strong> {court.regionName}</li>
				{/if}
			</ul>
		</CourtInfoCard>

		{#if court.operatingPolicy}
			<CourtInfoCard title="운영 방침" icon="📋" >
				<SanitizedHtml html={court.operatingPolicy} />
			</CourtInfoCard>
		{/if}

		{#if court.pricingInfo}
			<CourtInfoCard title="요금 안내" icon="💳" variant="highlight">
				<SanitizedHtml html={court.pricingInfo} />
			</CourtInfoCard>
		{/if}

		{#if court.parkingInfo}
			<CourtInfoCard title="주차 안내" icon="🅿️">
				<SanitizedHtml html={court.parkingInfo} />
			</CourtInfoCard>
		{/if}

		{#if court.transitInfo}
			<CourtInfoCard title="교통 안내" icon="🚌">
				<SanitizedHtml html={court.transitInfo} />
			</CourtInfoCard>
		{/if}
	</div>

	<!-- 2. 정보 그리드 후 (Lazy Load) -->
	<AdSenseBanner
		adSlot={AD_SLOTS.courtDetail.afterInfo}
		variant="in-article"
		lazyLoad={true}
		minHeight="50px"
	/>

	{#if relatedTips.length > 0}
		<section class="court-tips" aria-labelledby="court-tips-title">
			<h2 id="court-tips-title" class="court-tips-title">테니스 팁</h2>
			<ul class="court-tips-list">
				{#each relatedTips as tip (tip.slug)}
					<li>
						<a href="/content/{tip.slug}" class="court-tips-link">
							<span class="court-tips-name">{tip.title}</span>
							<span class="court-tips-meta">{tip.category} · {tip.readingTime ?? 1}분</span>
						</a>
					</li>
				{/each}
			</ul>
			<a href="/content" class="court-tips-all">모든 테니스 팁 보기 →</a>
		</section>
	{/if}

	<!-- Back to Home Link -->
	<div class="back-link">
		<a href="/">← 다른 코트 빈 시간 보기</a>
	</div>
</div>

<style>
	.page-container {
		width: 100%;
		max-width: var(--container-max);
		margin: 0 auto;
		padding: var(--space-8) var(--space-4);
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--space-6);
		margin-bottom: var(--space-12);
	}

	.back-link {
		text-align: center;
		padding: var(--space-8) 0;
	}

	.back-link a {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--color-primary-600);
		text-decoration: none;
		font-weight: var(--font-medium);
		font-size: var(--text-base);
		transition: all var(--transition-base);
	}

	.back-link a:hover {
		color: var(--color-primary-700);
		transform: translateX(-4px);
	}

	@media (max-width: 768px) {
		.info-grid {
			grid-template-columns: 1fr;
			gap: var(--space-4);
			margin-bottom: var(--space-8);
		}

	}

	@media (max-width: 640px) {
		.page-container {
			padding: var(--space-4) var(--space-2);
		}
	}

	.court-tips {
		margin: var(--space-6, 1.5rem) 0;
		padding: var(--space-4, 1rem);
		background: var(--color-bg-secondary, #f9fafb);
		border: 1px solid var(--color-border-light, #e5e7eb);
		border-radius: var(--radius-md, 8px);
	}

	.court-tips-title {
		margin: 0 0 var(--space-3, 0.75rem);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text-primary, #111827);
	}

	.court-tips-list {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		margin: 0 0 var(--space-3, 0.75rem);
		padding: 0;
		list-style: none;
	}

	.court-tips-link {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		padding: 0.5rem 0.625rem;
		background: #ffffff;
		border: 1px solid var(--color-border-light, #e5e7eb);
		border-radius: var(--radius-sm, 4px);
		text-decoration: none;
	}

	.court-tips-link:hover {
		border-color: var(--color-primary-400, #34d399);
	}

	.court-tips-name {
		font-size: 0.8125rem;
		color: var(--color-text-primary, #111827);
	}

	.court-tips-meta {
		font-size: 0.6875rem;
		color: var(--color-text-tertiary, #9ca3af);
	}

	.court-tips-all {
		font-size: 0.75rem;
		color: var(--color-primary-600, #059669);
		text-decoration: none;
	}
</style>
