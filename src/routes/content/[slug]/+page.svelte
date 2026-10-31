<script lang="ts">
	import { browser } from '$app/environment';
	import SanitizedHtml from '$lib/components/SanitizedHtml.svelte';
	import PageWrapper from '$lib/components/layout/PageWrapper.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import AdSenseBanner from '$lib/components/ads/AdSenseBanner.svelte';
	import { AD_SLOTS } from '$lib/config/ads';
	import ArticleToc from '$lib/components/ArticleToc.svelte';

	interface TocItem {
		id: string;
		level: number;
		text: string;
	}

	let { data } = $props();
	let activeHeading = $state('');
	let scrollProgress = $state(0);

	const toc = $derived<TocItem[]>(extractToc(data.tip.content));

	$effect(() => {
		if (!browser) return;
		const observer = new IntersectionObserver(
			(entries) =>
				entries.forEach((e) => {
					if (e.isIntersecting) activeHeading = e.target.id;
				}),
			{ rootMargin: '-20% 0px -70% 0px' }
		);
		const elements = document.querySelectorAll('.article-body h2, .article-body h3');
		elements.forEach((el) => observer.observe(el));
		return () => observer.disconnect();
	});

	$effect(() => {
		if (!browser) return;
		function onScroll() {
			const total = document.body.scrollHeight - window.innerHeight;
			scrollProgress = total > 0 ? (window.scrollY / total) * 100 : 0;
		}
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	function extractToc(html: string): TocItem[] {
		const items: TocItem[] = [];
		const regex = /<h([23])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h\1>/gi;
		let match;
		while ((match = regex.exec(html)) !== null) {
			const text = match[3].replace(/<[^>]*>/g, '');
			items.push({ id: match[2], level: parseInt(match[1]), text });
		}
		return items;
	}

	function formatDate(d: string | null): string {
		if (!d) return '';
		const dt = new Date(d);
		return `${dt.getFullYear()}년 ${dt.getMonth() + 1}월 ${dt.getDate()}일`;
	}


</script>

<svelte:head>
	<title>{data.tip.title} - CourtNow 테니스 팁</title>
	<meta
		name="description"
		content={data.tip.excerpt
			? data.tip.excerpt
			: `${data.tip.title} - 프로 테니스 선수들의 기술과 전략을 배우세요.`}
	/>
	<link rel="canonical" href="https://courtnow.info/content/{data.tip.slug}" />

	<!-- Open Graph Tags -->
	<meta property="og:type" content="article" />
	<meta property="og:title" content="{data.tip.title} - CourtNow 테니스 팁" />
	<meta
		property="og:description"
		content={data.tip.excerpt
			? data.tip.excerpt
			: `${data.tip.title} - 프로 테니스 선수들의 기술과 전략을 배우세요.`}
	/>
	<meta property="og:url" content="https://courtnow.info/content/{data.tip.slug}" />
	<meta property="og:site_name" content="CourtNow" />
	<meta property="og:locale" content="ko_KR" />
	<meta property="og:image" content="https://courtnow.info/og-image.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	{#if data.tip.lastUpdated}
		<meta property="article:published_time" content={data.tip.lastUpdated} />
		<meta property="article:modified_time" content={data.tip.lastUpdated} />
	{/if}
	<meta property="article:section" content={data.tip.category} />

	<!-- Twitter Card Tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="{data.tip.title} - CourtNow 테니스 팁" />
	<meta
		name="twitter:description"
		content={data.tip.excerpt
			? data.tip.excerpt
			: `${data.tip.title} - 프로 테니스 선수들의 기술과 전략을 배우세요.`}
	/>
	<meta name="twitter:image" content="https://courtnow.info/og-image.png" />

	<!-- JSON-LD Structured Data -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<script type="application/ld+json">${JSON.stringify([
		{
			'@context': 'https://schema.org',
			'@type': 'Article',
			headline: data.tip.title,
			description: data.tip.excerpt
				? data.tip.excerpt
				: `${data.tip.title} - 프로 테니스 선수들의 기술과 전략을 배우세요.`,
			timeRequired: `PT${data.tip.readingTime ?? 1}M`,
			author: { '@type': 'Organization', name: 'CourtNow' },
			publisher: {
				'@type': 'Organization',
				name: 'CourtNow',
				logo: { '@type': 'ImageObject', url: 'https://courtnow.info/og-image.png' }
			},
			datePublished: data.tip.lastUpdated || '2024-01-01T00:00:00Z',
			dateModified: data.tip.lastUpdated || '2024-01-01T00:00:00Z',
			mainEntityOfPage: {
				'@type': 'WebPage',
				'@id': `https://courtnow.info/content/${data.tip.slug}`
			},
			image: 'https://courtnow.info/og-image.png',
			articleSection: data.tip.category,
			inLanguage: 'ko-KR',
			keywords: `테니스, ${data.tip.category}, ${data.tip.difficulty}, 테니스장, 테니스 팁`
		},
		{
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [
				{ '@type': 'ListItem', position: 1, name: '홈', item: 'https://courtnow.info' },
				{ '@type': 'ListItem', position: 2, name: '테니스 팁', item: 'https://courtnow.info/content' },
				{ '@type': 'ListItem', position: 3, name: data.tip.title, item: `https://courtnow.info/content/${data.tip.slug}` }
			]
		}
	])}</script>`}
</svelte:head>

<!-- Reading progress bar (position: fixed, outside PageWrapper is fine) -->
<div class="reading-progress" style="width: {scrollProgress}%"></div>

<PageWrapper>
	<article class="article-container">
		<div class="article-layout">
			<div class="article-main">
				<header class="article-header">
					<a href="/content" class="back-button">
						<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
						목록으로
					</a>
					<div class="article-badges">
						<Badge variant="category" color={data.tip.category} />
						<Badge variant="difficulty" color={data.tip.difficulty} />
					</div>
					<h1 class="article-title">{data.tip.title}</h1>
					<div class="article-meta">
						<span class="meta-item">CourtNow 편집팀</span>
						{#if data.tip.lastUpdated}
							<span class="meta-sep">·</span>
							<span class="meta-item">{formatDate(data.tip.lastUpdated)}</span>
						{/if}
						<span class="meta-sep">·</span>
						<span class="meta-item">{data.tip.readingTime ?? 1}분 읽기</span>
					</div>
					<div class="article-meta-divider"></div>
				</header>

				<!-- Mobile TOC -->
				<div class="toc-mobile-wrap">
					<ArticleToc toc={toc} activeId={activeHeading} />
				</div>

				<AdSenseBanner adSlot={AD_SLOTS.contentDetail.top} variant="in-article" minHeight="50px" />

				<div class="article-content-card">
					<div class="article-body">
						<SanitizedHtml html={data.tip.content} />
					</div>
				</div>

				<AdSenseBanner
					adSlot={AD_SLOTS.contentDetail.bottom}
					variant="in-article"
					lazyLoad={true}
					minHeight="50px"
				/>

				{#if data.relatedPosts.length > 0}
					<section class="related-posts">
						<h2 class="related-title">관련 글</h2>
						<div class="related-grid">
							{#each data.relatedPosts as post}
								<a href="/content/{post.slug}" class="related-card">
									<div class="related-badges">
										<Badge variant="category" color={post.category} size="sm" />
									</div>
									<h3 class="related-card-title">{post.title}</h3>
									<span class="related-meta">⏱ {post.readingTime ?? 1}분 읽기</span>
								</a>
							{/each}
						</div>
					</section>
				{/if}

				<footer class="article-footer">
					<p class="footer-cta">이 글이 도움이 되셨나요?</p>
					<a href="/content" class="all-tips-link">← 모든 테니스 팁 보기</a>
				</footer>
			</div>

			<aside class="article-toc">
				<ArticleToc toc={toc} activeId={activeHeading} />
			</aside>
		</div>
	</article>
</PageWrapper>


<style>
	/* ── Reading progress bar ─────────────────────────────── */
	.reading-progress {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 100;
		height: 3px;
		background: var(
			--gradient-primary,
			linear-gradient(90deg, var(--color-primary-400), var(--color-primary-600))
		);
		transition: width 0.1s linear;
		pointer-events: none;
	}

	/* ── Back button (inside article-header) ─────────────── */
	.back-button {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		color: var(--color-primary-600);
		font-weight: var(--font-medium);
		font-size: var(--text-xs);
		text-decoration: none;
		margin-bottom: var(--space-4);
		opacity: 0.75;
		transition: opacity var(--transition-base);
	}

	.back-button:hover {
		opacity: 1;
	}

	/* ── Article container ───────────────────────────────── */
	.article-container {
		max-width: 1040px;
		margin: 0 auto;
	}

	/* ── Article header ──────────────────────────────────── */
	.article-header {
		margin-bottom: var(--space-10);
		padding: var(--space-8) var(--space-8) var(--space-6) var(--space-6);
		border-left: 4px solid var(--color-primary-500);
		background: linear-gradient(135deg, var(--color-primary-50, #f0fdf4) 0%, transparent 65%);
		border-radius: 0 var(--radius-xl) var(--radius-xl) 0;
	}

	.article-badges {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-5);
	}

	.article-title {
		font-size: clamp(1.75rem, 4vw, 2.8rem);
		font-weight: 800;
		color: var(--color-text-primary);
		margin: 0 0 var(--space-5) 0;
		line-height: 1.2;
		letter-spacing: -0.025em;
	}

	.article-meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		align-items: center;
	}

	.meta-item {
		font-size: var(--text-sm);
		color: var(--color-text-disabled);
	}

	.meta-sep {
		font-size: var(--text-sm);
		color: var(--color-text-disabled);
		opacity: 0.4;
	}

	.article-meta-divider {
		margin-top: var(--space-6);
		border-top: 1px solid var(--color-border-light);
	}

	/* ── Mobile TOC wrapper ──────────────────────────────── */
	.toc-mobile-wrap {
		display: block;
		margin-bottom: var(--space-6);
	}

	/* ── Layout (desktop: two-column) ────────────────────── */
	.article-layout {
		display: flex;
		gap: 2.5rem;
		align-items: flex-start;
	}

	.article-main {
		flex: 1;
		min-width: 0;
	}

	.article-toc {
		width: 280px;
		flex-shrink: 0;
		display: none;
	}

	@media (min-width: 1024px) {
		.toc-mobile-wrap {
			display: none;
		}

		.article-toc {
			display: block;
			position: sticky;
			top: 2rem;
		}

		.article-title {
			font-size: clamp(1.75rem, 2.8vw, 2.25rem);
		}

		.article-container {
			padding: 0 var(--space-6);
		}
	}

	/* ── Article content card ────────────────────────────── */
	.article-content-card {
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border-light);
		border-top: 3px solid var(--color-primary-400);
		border-radius: var(--radius-2xl, 1.5rem);
		padding: var(--space-10) var(--space-10) var(--space-12);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04), 0 6px 20px rgba(0, 0, 0, 0.04);
		margin-bottom: var(--space-6);
	}

	/* ── Article body base ───────────────────────────────── */
	.article-body {
		color: var(--color-text-secondary);
		line-height: 1.85;
	}

	/* ── Headings — higher specificity beats SanitizedHtml ─ */
	.article-content-card .article-body :global(h2) {
		font-size: clamp(1.25rem, 2.5vw, 1.625rem);
		font-weight: var(--font-bold);
		margin-top: 3.5rem;
		margin-bottom: var(--space-4);
		padding-bottom: var(--space-3);
		border-bottom: 2px solid var(--color-primary-200, #a7f3d0);
		color: var(--color-text-primary);
		letter-spacing: -0.02em;
		line-height: 1.3;
		scroll-margin-top: 5.5rem;
	}

	.article-content-card .article-body :global(h2:first-child) {
		margin-top: 0;
	}

	.article-content-card .article-body :global(h3) {
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		margin-top: var(--space-10);
		margin-bottom: var(--space-3);
		color: var(--color-text-primary);
		position: relative;
		padding-left: var(--space-5);
		line-height: 1.35;
		scroll-margin-top: 5.5rem;
	}

	.article-content-card .article-body :global(h3::before) {
		content: '';
		position: absolute;
		left: 0;
		top: 0.18em;
		width: 3px;
		height: 1.1em;
		background: var(--color-primary-400);
		border-radius: 2px;
	}

	/* Magazine-style section label */
	.article-content-card .article-body :global(h4) {
		font-size: 0.7rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-primary-600);
		margin-top: var(--space-6);
		margin-bottom: var(--space-2);
	}

	/* ── Paragraphs ──────────────────────────────────────── */
	.article-content-card .article-body :global(p) {
		margin-bottom: var(--space-5);
		color: var(--color-text-secondary);
		line-height: 1.85;
		font-size: 1rem;
	}

	/* Lead paragraph */
	.article-content-card .article-body :global(p:first-of-type) {
		font-size: 1.1rem;
		color: var(--color-text-primary);
		line-height: 1.75;
		font-weight: var(--font-medium);
		padding-bottom: var(--space-6);
		border-bottom: 1px dashed var(--color-border-light);
		margin-bottom: var(--space-6);
	}

	/* Prevent blockquote p from inheriting lead style */
	.article-content-card .article-body :global(blockquote p:first-of-type) {
		font-size: inherit;
		font-weight: inherit;
		color: inherit;
		padding-bottom: 0;
		border-bottom: none;
		margin-bottom: 0;
	}

	/* ── Lists ───────────────────────────────────────────── */
	.article-content-card .article-body :global(ul) {
		list-style: none;
		margin: var(--space-3) 0 var(--space-6) 0;
		padding: 0;
	}

	.article-content-card .article-body :global(ul li) {
		position: relative;
		padding-left: var(--space-6);
		margin-bottom: var(--space-3);
		color: var(--color-text-secondary);
		line-height: 1.75;
	}

	.article-content-card .article-body :global(ul li::before) {
		content: '';
		position: absolute;
		left: var(--space-2);
		top: 0.65em;
		width: 5px;
		height: 5px;
		background: var(--color-primary-400);
		border-radius: 50%;
		flex-shrink: 0;
	}

	.article-content-card .article-body :global(ol) {
		margin: var(--space-3) 0 var(--space-6) var(--space-6);
		padding: 0;
	}

	.article-content-card .article-body :global(ol li) {
		padding-left: var(--space-2);
		margin-bottom: var(--space-3);
		color: var(--color-text-secondary);
		line-height: 1.75;
	}

	.article-content-card .article-body :global(ol li::before) {
		display: none;
	}

	/* ── Inline elements ─────────────────────────────────── */
	.article-content-card .article-body :global(strong) {
		font-weight: var(--font-semibold);
		color: var(--color-text-primary);
	}

	.article-content-card .article-body :global(em) {
		font-style: italic;
		color: var(--color-text-secondary);
	}

	.article-content-card .article-body :global(code) {
		font-size: 0.875em;
		background: var(--color-primary-50, #f0fdf4);
		color: var(--color-primary-700, #047857);
		padding: 0.1em 0.45em;
		border-radius: var(--radius-sm);
		font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace;
	}

	/* ── Blockquote ──────────────────────────────────────── */
	.article-content-card .article-body :global(blockquote) {
		margin: var(--space-8) 0;
		padding: var(--space-6) var(--space-6) var(--space-6) var(--space-8);
		background: var(--color-primary-50, #f0fdf4);
		border-left: 4px solid var(--color-primary-500);
		border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
		font-size: 1.075rem;
		font-style: italic;
		color: var(--color-primary-800, #065f46);
		line-height: 1.7;
	}

	/* ── Table ───────────────────────────────────────────── */
	.article-content-card .article-body :global(table) {
		width: 100%;
		border-collapse: collapse;
		margin: var(--space-6) 0;
		font-size: var(--text-sm);
		border-radius: var(--radius-lg);
		overflow: hidden;
		box-shadow: var(--shadow-sm);
	}

	.article-content-card .article-body :global(th) {
		background: var(--color-primary-600);
		color: #fff;
		font-weight: var(--font-semibold);
		padding: var(--space-3) var(--space-4);
		text-align: left;
	}

	.article-content-card .article-body :global(td) {
		padding: var(--space-3) var(--space-4);
		border-bottom: 1px solid var(--color-border-light);
		color: var(--color-text-secondary);
	}

	.article-content-card .article-body :global(tr:nth-child(even) td) {
		background: var(--color-bg-secondary);
	}

	.article-content-card .article-body :global(tr:last-child td) {
		border-bottom: none;
	}

	/* ── Horizontal rule ─────────────────────────────────── */
	.article-content-card .article-body :global(hr) {
		margin: var(--space-10) 0;
		border: none;
		border-top: 1px solid var(--color-border-light);
	}

	/* ── Related posts ───────────────────────────────────── */
	.related-posts {
		margin-top: var(--space-12);
		padding-top: var(--space-8);
		border-top: 1px solid var(--color-border-light);
	}

	.related-title {
		font-size: var(--text-xl);
		font-weight: var(--font-bold);
		color: var(--color-text-primary);
		margin: 0 0 var(--space-5) 0;
	}

	.related-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-4);
	}

	.related-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-4);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-xl);
		text-decoration: none;
		color: inherit;
		transition: all var(--transition-base);
		box-shadow: var(--shadow-xs);
	}

	.related-card:hover {
		transform: var(--hover-lift);
		box-shadow: var(--shadow-md);
		border-color: var(--color-primary-400);
	}

	.related-badges {
		display: flex;
		gap: var(--space-2);
	}

	.related-card-title {
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		color: var(--color-text-primary);
		margin: 0;
		line-height: var(--leading-snug);
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.related-meta {
		font-size: var(--text-xs);
		color: var(--color-text-disabled);
		margin-top: auto;
	}

	/* ── Article footer ──────────────────────────────────── */
	.article-footer {
		margin-top: var(--space-12);
		padding-top: var(--space-8);
		border-top: 1px solid var(--color-border-light);
		text-align: center;
	}

	.footer-cta {
		font-size: var(--text-base);
		color: var(--color-text-secondary);
		margin-bottom: var(--space-4);
	}

	.all-tips-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--color-primary-600);
		text-decoration: none;
		font-weight: var(--font-medium);
		font-size: var(--text-sm);
		transition: color var(--transition-base);
	}

	.all-tips-link:hover {
		color: var(--color-primary-700);
	}

	/* ── Responsive ──────────────────────────────────────── */
	@media (max-width: 1023px) {
		.related-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.article-content-card {
			padding: var(--space-6) var(--space-6) var(--space-8);
		}
	}

	@media (max-width: 768px) {
		.article-title {
			font-size: 1.75rem;
		}

		.article-header {
			padding: var(--space-5) var(--space-5) var(--space-4) var(--space-5);
		}

		.article-content-card .article-body :global(h2) {
			font-size: 1.375rem;
		}

		.article-content-card .article-body :global(h3) {
			font-size: var(--text-lg);
		}
	}

	@media (max-width: 640px) {
		.article-title {
			font-size: var(--text-2xl);
		}

		.article-header {
			padding-left: var(--space-4);
		}

		.article-meta {
			gap: var(--space-2);
		}

		.article-content-card .article-body :global(h2) {
			font-size: var(--text-xl);
		}

		.article-content-card .article-body :global(h3) {
			font-size: 1.05rem;
		}

		.article-content-card .article-body :global(p) {
			font-size: var(--text-sm);
		}

		.article-content-card .article-body :global(p:first-of-type) {
			font-size: var(--text-base);
		}

		.related-grid {
			grid-template-columns: 1fr;
		}

		.article-content-card {
			padding: var(--space-5) var(--space-4) var(--space-6);
			border-radius: var(--radius-xl);
		}
	}
</style>
