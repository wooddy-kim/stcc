<script lang="ts">
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import PageWrapper from '$lib/components/layout/PageWrapper.svelte';
	import StateMessage from '$lib/components/ui/StateMessage.svelte';
	import SearchInput from '$lib/components/ui/SearchInput.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import AdSenseBanner from '$lib/components/ads/AdSenseBanner.svelte';
	import { AD_SLOTS } from '$lib/config/ads';

	interface TipListItem {
		title: string;
		slug: string;
		category: string;
		difficulty: string;
		lastUpdated: string | null;
		excerpt: string | null;
		readingTime: number | null;
	}

	let { data } = $props();
	let selectedCategory = $state('all');
	let selectedDifficulty = $state('all');
	let searchQuery = $state('');

	const categories = [
		{ value: 'all', label: '전체' },
		{ value: 'strategy', label: '전술' },
		{ value: 'strokes', label: '스트로크' },
		{ value: 'serving', label: '서브' },
		{ value: 'movement', label: '발리/풋워크' },
		{ value: 'mental-game', label: '멘탈' },
		{ value: 'training', label: '훈련' },
		{ value: 'lifestyle', label: '라이프스타일' },
		{ value: 'equipment', label: '장비' }
	];

	const difficulties = [
		{ value: 'all', label: '전체' },
		{ value: 'beginner', label: '초급' },
		{ value: 'intermediate', label: '중급' },
		{ value: 'advanced', label: '고급' }
	];

	const filteredTips = $derived(
		(data.tips as TipListItem[]).filter((t) => {
			const catMatch = selectedCategory === 'all' || t.category === selectedCategory;
			const diffMatch = selectedDifficulty === 'all' || t.difficulty === selectedDifficulty;
			const q = searchQuery.toLowerCase();
			const qMatch =
				!q ||
				t.title.toLowerCase().includes(q) ||
				t.excerpt?.toLowerCase().includes(q) ||
				t.category.toLowerCase().includes(q);
			return catMatch && diffMatch && qMatch;
		})
	);

	const featured = $derived(filteredTips[0] ?? null);
	const rest = $derived(filteredTips.slice(1));

	const tipChunks = $derived(
		rest.reduce<TipListItem[][]>((chunks, tip, i) => {
			const idx = Math.floor(i / 6);
			if (!chunks[idx]) chunks[idx] = [];
			chunks[idx].push(tip);
			return chunks;
		}, [])
	);

	function formatDate(d: string | null): string {
		if (!d) return '';
		const dt = new Date(d);
		return `${dt.getFullYear()}년 ${dt.getMonth() + 1}월 ${dt.getDate()}일`;
	}
</script>

<svelte:head>
	<title>테니스 팁 & 전략 - CourtNow | 프로의 기술과 노하우</title>
	<meta name="description" content="프로 테니스 선수들의 기술과 전략을 배우세요. 서브, 스트로크, 발리, 멘탈 훈련까지 다양한 테니스 팁을 제공합니다." />
	<link rel="canonical" href="https://courtnow.info/content" />

	<!-- Open Graph Tags -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="테니스 팁 & 전략 - CourtNow | 프로의 기술과 노하우" />
	<meta property="og:description" content="서브, 스트로크, 발리, 멘탈 훈련까지 프로 테니스 선수들의 기술과 전략을 배우세요. 다양한 테니스 팁으로 실력을 향상시키세요!" />
	<meta property="og:url" content="https://courtnow.info/content" />
	<meta property="og:site_name" content="CourtNow" />
	<meta property="og:locale" content="ko_KR" />
	<meta property="og:image" content="https://courtnow.info/og-image.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />

	<!-- Twitter Card Tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="테니스 팁 & 전략 - CourtNow" />
	<meta name="twitter:description" content="프로의 기술과 전략을 배워보세요" />
	<meta name="twitter:image" content="https://courtnow.info/og-image.png" />

	<!-- JSON-LD Structured Data -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: '테니스 팁 & 전략',
		description: '프로 테니스 선수들의 기술과 전략을 배울 수 있는 테니스 팁 모음',
		url: 'https://courtnow.info/content',
		publisher: {
			'@type': 'Organization',
			name: 'CourtNow',
			url: 'https://courtnow.info'
		},
		mainEntity: {
			'@type': 'ItemList',
			name: '테니스 팁 목록',
			description: '서브, 스트로크, 발리, 멘탈 훈련 등 다양한 테니스 기술 가이드',
			itemListElement: (data.tips as TipListItem[]).map((tip, i) => ({
				'@type': 'ListItem',
				position: i + 1,
				url: `https://courtnow.info/content/${tip.slug}`,
				name: tip.title
			}))
		},
		inLanguage: 'ko-KR'
	})}</script>`}
</svelte:head>

<PageWrapper>
	<PageHeader
		title="테니스 팁 & 전략"
		description="프로 테니스 선수들의 기술과 전략을 배우세요"
		showDecoration
	/>

	<AdSenseBanner adSlot={AD_SLOTS.contentList.inArticle} variant="in-article" minHeight="50px" />

	{#if data.tips.length === 0}
		<StateMessage type="empty" message="등록된 테니스 팁이 없습니다." />
	{:else}
		<div class="filters">
			<SearchInput
				value={searchQuery}
				placeholder="제목, 카테고리, 키워드로 검색..."
				on:input={(e) => (searchQuery = e.detail)}
			/>
			<div class="filter-row">
				{#each categories as cat}
					<button
						class="filter-pill"
						class:active={selectedCategory === cat.value}
						onclick={() => (selectedCategory = cat.value)}
					>{cat.label}</button>
				{/each}
			</div>
			<div class="filter-row">
				{#each difficulties as diff}
					<button
						class="filter-pill"
						class:active={selectedDifficulty === diff.value}
						onclick={() => (selectedDifficulty = diff.value)}
					>{diff.label}</button>
				{/each}
			</div>
		</div>

		{#if filteredTips.length === 0}
			<StateMessage
				type="empty"
				message={searchQuery ? '검색 결과가 없습니다.' : '해당 카테고리의 팁이 없습니다.'}
			/>
		{:else}
			<!-- Featured Card -->
			{#if featured}
				<a href="/content/{featured.slug}" class="featured-card">
					<div class="featured-badges">
						<Badge variant="category" color={featured.category} size="sm" />
						<Badge variant="difficulty" color={featured.difficulty} size="sm" />
					</div>
					<h2 class="featured-title">{featured.title}</h2>
					{#if featured.excerpt}
						<p class="featured-excerpt">{featured.excerpt}</p>
					{/if}
					<div class="featured-meta">
						<span class="reading-time">⏱ {featured.readingTime ?? 1}분 읽기</span>
						{#if featured.lastUpdated}
							<span class="meta-date">{formatDate(featured.lastUpdated)}</span>
						{/if}
					</div>
				</a>
			{/if}

			<!-- Grid: 6개씩 청크로 나눠 광고를 그리드 바깥에 배치 -->
			{#if tipChunks.length > 0}
				{#each tipChunks as chunk, chunkIndex}
					<div class="tips-grid">
						{#each chunk as tip}
							<a href="/content/{tip.slug}" class="tip-card">
								<div class="card-badges">
									<Badge variant="category" color={tip.category} size="sm" />
									<Badge variant="difficulty" color={tip.difficulty} size="sm" />
								</div>
								<h3 class="card-title">{tip.title}</h3>
								{#if tip.excerpt}
									<p class="card-excerpt">{tip.excerpt}</p>
								{/if}
								<div class="card-meta">
									<span class="reading-time">⏱ {tip.readingTime ?? 1}분 읽기</span>
									{#if tip.lastUpdated}
										<span class="meta-date">{formatDate(tip.lastUpdated)}</span>
									{/if}
								</div>
							</a>
						{/each}
					</div>
					{#if chunkIndex < tipChunks.length - 1 && chunkIndex < 2}
						<AdSenseBanner
							adSlot={AD_SLOTS.contentList.inFeed}
							variant="multiplex"
							lazyLoad={true}
							minHeight="50px"
						/>
					{/if}
				{/each}
			{/if}
		{/if}
	{/if}
</PageWrapper>

<style>
	/* ── Filters ─────────────────────────────────────────── */
	.filters {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-bottom: var(--space-6);
	}

	.filter-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-1);
	}

	.filter-pill {
		padding: var(--space-1) var(--space-4);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-full);
		background: var(--color-bg-primary);
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		cursor: pointer;
		transition: all var(--transition-base);
		white-space: nowrap;
	}

	.filter-pill:hover {
		border-color: var(--color-primary-400);
		color: var(--color-primary-600);
		background: var(--color-primary-50);
	}

	.filter-pill.active {
		background: var(--color-primary-500);
		border-color: var(--color-primary-500);
		color: #fff;
	}

	/* ── Featured Card ───────────────────────────────────── */
	.featured-card {
		display: block;
		width: 100%;
		min-height: 220px;
		padding: var(--space-8);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-xs);
		text-decoration: none;
		color: inherit;
		transition: all var(--transition-base);
		margin-bottom: var(--space-6);
	}

	.featured-card:hover {
		transform: var(--hover-lift);
		box-shadow: var(--shadow-lg);
		border-color: var(--color-primary-500);
	}

	.featured-badges {
		display: flex;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}

	.featured-title {
		font-size: 1.6rem;
		font-weight: var(--font-bold);
		color: var(--color-text-primary);
		margin: 0 0 var(--space-3) 0;
		line-height: var(--leading-snug);
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
	}

	.featured-excerpt {
		margin: 0 0 var(--space-4) 0;
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
	}

	.featured-meta {
		display: flex;
		gap: var(--space-4);
		align-items: center;
	}

	/* ── Grid ────────────────────────────────────────────── */
	.tips-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-5);
	}

	.tip-card {
		display: flex;
		flex-direction: column;
		min-width: 0;
		padding: var(--space-5);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-xs);
		text-decoration: none;
		color: inherit;
		transition: all var(--transition-base);
	}

	.tip-card:hover {
		transform: var(--hover-lift);
		box-shadow: var(--shadow-lg);
		border-color: var(--color-primary-500);
	}

	.card-badges {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-2);
	}

	.card-title {
		font-size: 1.1rem;
		font-weight: var(--font-bold);
		color: var(--color-text-primary);
		margin: 0 0 var(--space-2) 0;
		line-height: var(--leading-snug);
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.card-excerpt {
		flex: 1;
		margin: 0 0 var(--space-2) 0;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.card-meta {
		display: flex;
		gap: var(--space-3);
		align-items: center;
	}

	/* ── Shared meta ─────────────────────────────────────── */
	.reading-time {
		font-size: var(--text-xs);
		color: var(--color-text-disabled);
	}

	.meta-date {
		font-size: var(--text-xs);
		color: var(--color-text-disabled);
	}

	/* ── Responsive ──────────────────────────────────────── */
	@media (max-width: 768px) {
		.featured-card {
			padding: var(--space-6);
			min-height: 180px;
		}

		.featured-title {
			font-size: 1.3rem;
		}
	}

	@media (max-width: 640px) {
		.tips-grid {
			grid-template-columns: 1fr;
		}

		.featured-card {
			padding: var(--space-5);
		}

		.featured-title {
			font-size: 1.15rem;
		}

		.filter-pill {
			font-size: var(--text-xs);
			padding: var(--space-1) var(--space-3);
		}
	}
</style>
