<script lang="ts">
	import { onMount } from 'svelte';
	import {
		GLOSSARY,
		CATEGORY_LABELS,
		searchTerms,
		getTermById,
		type GlossaryTerm
	} from '$lib/data/tennis-glossary';
	import SearchInput from '$lib/components/ui/SearchInput.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import PageWrapper from '$lib/components/layout/PageWrapper.svelte';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import AdSenseBanner from '$lib/components/ads/AdSenseBanner.svelte';
	import { AD_SLOTS } from '$lib/config/ads';

	let searchQuery = '';
	let selectedCategory: GlossaryTerm['category'] | 'all' = 'all';
	let filteredTerms: GlossaryTerm[] = GLOSSARY;
	let expandedTermId: string | null = null;

	const categories: { value: GlossaryTerm['category'] | 'all'; label: string }[] = [
		{ value: 'all', label: '전체' },
		{ value: 'stroke', label: CATEGORY_LABELS.stroke },
		{ value: 'scoring', label: CATEGORY_LABELS.scoring },
		{ value: 'court', label: CATEGORY_LABELS.court },
		{ value: 'equipment', label: CATEGORY_LABELS.equipment },
		{ value: 'rules', label: CATEGORY_LABELS.rules },
		{ value: 'general', label: CATEGORY_LABELS.general }
	];

	function filterTerms() {
		let results = searchTerms(searchQuery);

		if (selectedCategory !== 'all') {
			results = results.filter((t) => t.category === selectedCategory);
		}

		// 알파벳/가나다 순 정렬
		results.sort((a, b) => a.termKo.localeCompare(b.termKo, 'ko'));

		filteredTerms = results;
	}

	function toggleTerm(id: string) {
		expandedTermId = expandedTermId === id ? null : id;
	}

	function handleRelatedClick(id: string) {
		const term = getTermById(id);
		if (term) {
			expandedTermId = id;
			// 해당 용어로 스크롤
			const element = document.getElementById(`term-${id}`);
			if (element) {
				element.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		}
	}

	$: {
		searchQuery;
		selectedCategory;
		filterTerms();
	}

	onMount(() => {
		// URL 해시에서 용어 ID 확인
		const hash = window.location.hash.slice(1);
		if (hash) {
			const term = getTermById(hash);
			if (term) {
				expandedTermId = hash;
				setTimeout(() => {
					const element = document.getElementById(`term-${hash}`);
					if (element) {
						element.scrollIntoView({ behavior: 'smooth', block: 'center' });
					}
				}, 100);
			}
		}
	});
</script>

<svelte:head>
	<title>테니스 용어 사전 | CourtNow</title>
	<meta
		name="description"
		content="테니스 초보자를 위한 용어 사전입니다. 포핸드, 백핸드, 서브, 듀스 등 테니스 용어를 쉽게 찾아보세요."
	/>
	<link rel="canonical" href="https://courtnow.info/glossary" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="테니스 용어 사전 | CourtNow" />
	<meta property="og:description" content="테니스 초보자를 위한 용어 사전입니다. 포핸드, 백핸드, 서브, 듀스 등 테니스 용어를 쉽게 찾아보세요." />
	<meta property="og:url" content="https://courtnow.info/glossary" />
	<meta property="og:site_name" content="CourtNow" />
	<meta property="og:locale" content="ko_KR" />
	<meta property="og:image" content="https://courtnow.info/og-image.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="테니스 용어 사전 | CourtNow" />
	<meta name="twitter:description" content="테니스 초보자를 위한 용어 사전입니다. 포핸드, 백핸드, 서브, 듀스 등 테니스 용어를 쉽게 찾아보세요." />
	<meta name="twitter:image" content="https://courtnow.info/og-image.png" />


	<!-- Breadcrumb Schema -->
	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			"itemListElement": [
				{
					"@type": "ListItem",
					"position": 1,
					"name": "홈",
					"item": "https://courtnow.info"
				},
				{
					"@type": "ListItem",
					"position": 2,
					"name": "용어 사전",
					"item": "https://courtnow.info/glossary"
				}
			]
		}
	</script>
</svelte:head>

<PageWrapper>
	<Breadcrumb
		items={[
			{ label: '홈', href: '/' },
			{ label: '테니스 용어 사전', href: '/glossary' }
		]}
	/>

	<PageHeader title="테니스 용어 사전" description="테니스 입문자를 위한 필수 용어 가이드" />

	<!-- 검색 및 필터 -->
	<div class="search-filter-section">
		<div class="search-wrapper">
			<SearchInput bind:value={searchQuery} placeholder="용어 검색 (한글/영어)" />
		</div>

		<div class="category-filter">
			{#each categories as cat}
				<button
					class="category-chip"
					class:selected={selectedCategory === cat.value}
					on:click={() => (selectedCategory = cat.value)}
				>
					{cat.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- 결과 카운트 -->
	<div class="result-count">
		<span class="count">{filteredTerms.length}</span>개의 용어
	</div>

	<!-- 용어 목록 -->
	<div class="glossary-list">
		{#each filteredTerms as term, i (term.id)}
			<div
				id="term-{term.id}"
				class="glossary-item"
				class:expanded={expandedTermId === term.id}
			>
				<button class="term-header" on:click={() => toggleTerm(term.id)}>
					<div class="term-info">
						<span class="term-ko">{term.termKo}</span>
						<span class="term-en">{term.term}</span>
					</div>
					<div class="term-meta">
						<span class="category-badge">{CATEGORY_LABELS[term.category]}</span>
						<span class="expand-icon">{expandedTermId === term.id ? '−' : '+'}</span>
					</div>
				</button>

				{#if expandedTermId === term.id}
					<div class="term-content">
						<p class="definition">{term.definition}</p>

						{#if term.example}
							<div class="example">
								<span class="example-label">예시</span>
								<p>{term.example}</p>
							</div>
						{/if}

						{#if term.relatedTerms && term.relatedTerms.length > 0}
							<div class="related-terms">
								<span class="related-label">관련 용어</span>
								<div class="related-chips">
									{#each term.relatedTerms as relatedId}
										{@const relatedTerm = getTermById(relatedId)}
										{#if relatedTerm}
											<button
												class="related-chip"
												on:click={() => handleRelatedClick(relatedId)}
											>
												{relatedTerm.termKo}
											</button>
										{/if}
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>
			<!-- 광고 사이 간격을 20개 용어로 둔다. 필터로 목록이 짧아지면 자연히 줄어든다 -->
			{#if i === 9 && filteredTerms.length > 12}
				<AdSenseBanner adSlot={AD_SLOTS.glossary.inList} variant="in-article" lazyLoad={true} minHeight="50px" />
			{:else if i === 29 && filteredTerms.length > 32}
				<AdSenseBanner adSlot={AD_SLOTS.glossary.inListLower} variant="multiplex" lazyLoad={true} minHeight="50px" />
			{/if}
		{/each}

		{#if filteredTerms.length === 0}
			<div class="empty-state">
				<p>검색 결과가 없습니다.</p>
				<p class="hint">다른 검색어를 시도해보세요.</p>
			</div>
		{/if}
	</div>
</PageWrapper>

<style>
	.search-filter-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		margin-bottom: var(--space-4);
	}

	.search-wrapper {
		max-width: 400px;
	}

	.category-filter {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.category-chip {
		padding: var(--space-2) var(--space-3);
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-full);
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all 0.2s;
	}

	.category-chip:hover {
		border-color: var(--color-primary-500);
		color: var(--color-primary-500);
	}

	.category-chip.selected {
		background: var(--color-primary-500);
		border-color: var(--color-primary-500);
		color: white;
	}

	.result-count {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin-bottom: var(--space-4);
	}

	.result-count .count {
		font-weight: 600;
		color: var(--color-primary-500);
	}

	.glossary-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.glossary-item {
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-lg);
		overflow: hidden;
		transition: all 0.2s;
	}

	.glossary-item:hover {
		border-color: var(--color-border);
	}

	.glossary-item.expanded {
		border-color: var(--color-primary-500);
		box-shadow: var(--shadow-sm);
	}

	.term-header {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-4);
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
	}

	.term-info {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
	}

	.term-ko {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.term-en {
		font-size: 0.875rem;
		color: var(--color-text-tertiary);
	}

	.term-meta {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.category-badge {
		padding: var(--space-1) var(--space-2);
		background: var(--color-bg-secondary);
		border-radius: var(--radius-sm);
		font-size: 0.6875rem;
		color: var(--color-text-secondary);
	}

	.expand-icon {
		font-size: 1.25rem;
		color: var(--color-text-tertiary);
		line-height: 1;
	}

	.term-content {
		padding: 0 var(--space-4) var(--space-4);
		border-top: 1px solid var(--color-border-light);
	}

	.definition {
		margin: var(--space-3) 0 0;
		color: var(--color-text-secondary);
		line-height: 1.6;
	}

	.example {
		margin-top: var(--space-3);
		padding: var(--space-3);
		background: var(--color-bg-secondary);
		border-radius: var(--radius-md);
	}

	.example-label,
	.related-label {
		display: block;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-primary-500);
		margin-bottom: var(--space-1);
	}

	.example p {
		margin: 0;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		font-style: italic;
	}

	.related-terms {
		margin-top: var(--space-3);
	}

	.related-chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.related-chip {
		padding: var(--space-1) var(--space-2);
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-sm);
		font-size: 0.75rem;
		color: var(--color-primary-500);
		cursor: pointer;
		transition: all 0.2s;
	}

	.related-chip:hover {
		background: var(--color-primary-500);
		border-color: var(--color-primary-500);
		color: white;
	}

	.empty-state {
		text-align: center;
		padding: var(--space-8);
		color: var(--color-text-secondary);
	}

	.empty-state .hint {
		font-size: 0.875rem;
		color: var(--color-text-tertiary);
	}

	@media (max-width: 640px) {
		.term-header {
			padding: var(--space-3);
		}

		.term-info {
			flex-direction: column;
			gap: var(--space-1);
		}

		.term-ko {
			font-size: 0.9375rem;
		}

		.term-en {
			font-size: 0.8125rem;
		}

		.category-badge {
			display: none;
		}

		.term-content {
			padding: 0 var(--space-3) var(--space-3);
		}
	}
</style>
