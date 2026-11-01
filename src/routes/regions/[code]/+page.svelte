<script lang="ts">
	import type { PageData } from './$types';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import PageWrapper from '$lib/components/layout/PageWrapper.svelte';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import AdSenseBanner from '$lib/components/ads/AdSenseBanner.svelte';
	import { AD_SLOTS } from '$lib/config/ads';
	import { regionSeo } from '$lib/utils/court-seo';

	export let data: PageData;

	$: ({ region, courts, otherRegions } = data);
	$: seo = regionSeo(region.name, courts.length);
	$: canonicalUrl = `https://courtnow.info/regions/${region.code}`;
	$: jsonLd = JSON.stringify([
		{
			'@context': 'https://schema.org',
			'@type': 'ItemList',
			name: seo.heading,
			itemListElement: courts.map((c, i) => ({
				'@type': 'ListItem',
				position: i + 1,
				name: c.name,
				url: `https://courtnow.info/courts/${c.slug}`
			}))
		},
		{
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [
				{ '@type': 'ListItem', position: 1, name: '예약 현황', item: 'https://courtnow.info' },
				{ '@type': 'ListItem', position: 2, name: region.name, item: canonicalUrl }
			]
		}
	]).replace(/</g, '\\u003c');
</script>

<svelte:head>
	<title>{seo.title}</title>
	<meta name="description" content={seo.description} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={seo.title} />
	<meta property="og:description" content={seo.description} />
	<meta property="og:url" content={canonicalUrl} />
	<link rel="canonical" href={canonicalUrl} />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- 서버 데이터를 JSON.stringify하고 <를 이스케이프했다 -->
	{@html `<script type="application/ld+json">${jsonLd}</` + `script>`}
</svelte:head>

<PageWrapper variant="narrow">
	<Breadcrumb items={[{ label: '예약 현황', href: '/' }, { label: region.name }]} />

	<PageHeader title={seo.heading} description={seo.description} size="md" />

	<a href="/" class="region-cta">시간대별로 오늘 빈 코트 보기 →</a>

	<ul class="region-courts">
		{#each courts as court (court.id)}
			<li>
				<a href="/courts/{court.slug}" class="region-court">
					<span class="region-court-name">{court.name}</span>
					{#if court.freeToday > 0}
						<span class="region-court-free">오늘 빈 시간 {court.freeToday}개</span>
					{/if}
					{#if court.address || court.totalCourts}
						<span class="region-court-meta">
							{[court.address, court.totalCourts && `코트 ${court.totalCourts}면`]
								.filter(Boolean)
								.join(' · ')}
						</span>
					{/if}
				</a>
			</li>
		{/each}
	</ul>

	<AdSenseBanner
		adSlot={AD_SLOTS.region.afterList}
		variant="in-article"
		lazyLoad={true}
		minHeight="50px"
	/>

	{#if otherRegions.length > 0}
		<nav class="region-others" aria-label="다른 지역 테니스장">
			<h2>다른 지역 테니스장</h2>
			<ul>
				{#each otherRegions as r (r.code)}
					<li><a href="/regions/{r.code}">{r.name}</a></li>
				{/each}
			</ul>
		</nav>
	{/if}
</PageWrapper>

<style>
	.region-cta {
		display: block;
		margin: var(--space-4, 1rem) 0;
		padding: 0.75rem 1rem;
		border-radius: var(--radius-md, 8px);
		background: var(--color-primary-600, #059669);
		color: #ffffff;
		font-weight: 600;
		text-align: center;
		text-decoration: none;
	}

	.region-courts {
		display: grid;
		gap: 0.5rem;
		margin: 0 0 var(--space-6, 1.5rem);
		padding: 0;
		list-style: none;
	}

	.region-court {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.25rem 0.5rem;
		padding: 0.875rem 1rem;
		background: var(--color-bg-primary, #ffffff);
		border: 1px solid var(--color-border-light, #e5e7eb);
		border-radius: var(--radius-md, 8px);
		color: var(--color-text-primary, #111827);
		text-decoration: none;
	}

	.region-court:hover {
		border-color: var(--color-primary-400, #34d399);
	}

	.region-court-name {
		font-weight: 600;
	}

	.region-court-free {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-primary-700, #047857);
	}

	.region-court-meta {
		grid-column: 1 / -1;
		font-size: 0.8125rem;
		color: var(--color-text-secondary, #6b7280);
	}

	.region-others h2 {
		margin: 0 0 0.5rem;
		font-size: 0.9375rem;
	}

	.region-others ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.region-others a {
		display: inline-block;
		padding: 0.375rem 0.75rem;
		border: 1px solid var(--color-border-light, #e5e7eb);
		border-radius: 999px;
		color: var(--color-text-primary, #111827);
		font-size: 0.8125rem;
		text-decoration: none;
	}
</style>
