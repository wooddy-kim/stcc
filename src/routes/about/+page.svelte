<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	const totalCourts = data.regionCounts.reduce((sum, r) => sum + r.count, 0);

	const features = [
		{
			title: '시간 우선 보드',
			desc: '날짜와 시작 시간만 고르면 그 시간에 비어 있는 코트가 지역별로 바로 나옵니다.',
			icon: 'clock',
			href: '/'
		},
		{
			title: '관심 코트 ★',
			desc: '자주 가는 코트에 별을 달면 보드 맨 위에 모아 보여 줍니다. 로그인은 필요 없어요.',
			icon: 'star',
			href: '/'
		},
		{
			title: '코트별 시간표',
			desc: '코트 하나를 눌러 2주치 빈 시간을 날짜별로 확인하고, 예약 사이트로 바로 이동하세요.',
			icon: 'calendar',
			href: '/'
		},
		{
			title: '지도',
			desc: '내 주변 코트가 어디 있는지, 지금 빈자리가 있는지 지도 위에서 한눈에 봅니다.',
			icon: 'map',
			href: '/map'
		},
		{
			title: '예약 통계',
			desc: '요일·시간대별로 자리가 잘 나는 때를 보여 줘, 예약 전략을 세우는 데 도움을 줍니다.',
			icon: 'chart',
			href: '/stats'
		},
		{
			title: '날씨와 테니스 팁',
			desc: '칠 날의 날씨를 함께 확인하고, 테니스 팁·용어 사전으로 실력도 챙기세요.',
			icon: 'sun',
			href: '/content'
		}
	] as const;

	const steps = [
		{ title: '지역과 날짜 고르기', desc: '보드 위쪽에서 지역 탭과 날짜를 선택합니다.' },
		{ title: '시작 시간 누르기', desc: '시간 칩에 그 시간 빈 코트 수가 표시됩니다.' },
		{ title: '코트 눌러 예약하기', desc: '코트 상세에서 예약 사이트로 바로 넘어갑니다.' }
	];

	// 히어로 장식용 미리보기. 실제 데이터가 아니다.
	const previewHours = [
		{ h: 6, n: 4 },
		{ h: 8, n: 1 },
		{ h: 10, n: 0 },
		{ h: 18, n: 3 },
		{ h: 20, n: 6, active: true }
	];
</script>

<svelte:head>
	<title>소개 - CourtNow | 수도권 공공 테니스장 빈 코트 찾기</title>
	<meta
		name="description"
		content="CourtNow는 수도권 공공 테니스장의 빈 시간을 한 화면에 모아 15분마다 갱신합니다. 날짜와 시간만 고르면 비어 있는 코트를 바로 찾을 수 있어요."
	/>
	<link rel="canonical" href="https://courtnow.info/about" />

	<!-- Open Graph Tags -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="소개 - CourtNow | 수도권 공공 테니스장 빈 코트 찾기" />
	<meta
		property="og:description"
		content="예약 사이트를 하나씩 돌지 마세요. 수도권 공공 테니스장 빈 시간을 한 화면에서 확인하세요."
	/>
	<meta property="og:url" content="https://courtnow.info/about" />
	<meta property="og:site_name" content="CourtNow" />
	<meta property="og:locale" content="ko_KR" />
	<meta property="og:image" content="https://courtnow.info/og-image.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />

	<!-- Twitter Card Tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="소개 - CourtNow | 수도권 공공 테니스장 빈 코트 찾기" />
	<meta
		name="twitter:description"
		content="수도권 공공 테니스장 빈 시간을 한 화면에서 확인하세요"
	/>
	<meta name="twitter:image" content="https://courtnow.info/og-image.png" />

	<!-- JSON-LD Structured Data -->
	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "AboutPage",
			"mainEntity": {
				"@type": "Organization",
				"name": "CourtNow",
				"description": "수도권 공공 테니스장 빈 코트 찾기 서비스",
				"url": "https://courtnow.info",
				"areaServed": {
					"@type": "Place",
					"name": "수도권"
				},
				"offers": {
					"@type": "Offer",
					"price": "0",
					"priceCurrency": "KRW"
				}
			},
			"description": "CourtNow는 수도권 공공 테니스장의 빈 시간을 한 화면에 모아 15분마다 갱신합니다. 날짜와 시간만 고르면 비어 있는 코트를 바로 찾을 수 있습니다.",
			"url": "https://courtnow.info/about"
		}
	</script>

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
					"name": "소개",
					"item": "https://courtnow.info/about"
				}
			]
		}
	</script>
</svelte:head>

<div class="container">
	<!-- Hero -->
	<section class="hero">
		<div class="hero-copy">
			<span class="eyebrow">수도권 공공 테니스장 빈 코트 찾기</span>
			<h1>예약 사이트,<br />이제 하나씩 돌지 마세요</h1>
			<p class="lead">
				CourtNow는 여러 지자체 예약 사이트에 흩어진 테니스장 빈 시간을 한 화면에 모읍니다. 날짜와
				시간만 고르면, 그 시간에 칠 수 있는 코트가 바로 보여요.
			</p>
			<div class="hero-actions">
				<a href="/" class="btn btn-primary">빈 코트 찾기</a>
				<a href="/map" class="btn btn-ghost">지도로 보기</a>
			</div>
		</div>

		<div class="preview" aria-hidden="true">
			<div class="preview-dates">
				<span>오늘</span><span class="on">내일</span><span>모레</span>
			</div>
			<div class="preview-hours">
				{#each previewHours as p}
					<span class="chip" class:active={p.active} class:empty={p.n === 0}>
						<b>{p.h}시</b><small>{p.n}곳</small>
					</span>
				{/each}
			</div>
			<div class="preview-row fav"><span>★ 망포테니스장</span><em>2면</em></div>
			<div class="preview-row"><span>여울테니스장</span><em>1면</em></div>
		</div>
	</section>

	<!-- Numbers -->
	<dl class="numbers">
		{#if totalCourts > 0}
			<div>
				<dt>테니스장</dt>
				<dd>{totalCourts}<span>곳</span></dd>
			</div>
			<div>
				<dt>지역</dt>
				<dd>{data.regionCounts.length}<span>곳</span></dd>
			</div>
		{/if}
		<div>
			<dt>갱신 주기</dt>
			<dd>15<span>분</span></dd>
		</div>
		<div>
			<dt>조회 기간</dt>
			<dd>2<span>주</span></dd>
		</div>
	</dl>

	<!-- Features -->
	<section class="section">
		<h2 class="section-title">이런 걸 할 수 있어요</h2>
		<div class="feature-grid">
			{#each features as f}
				<a href={f.href} class="feature-card">
					<span class="feature-icon">
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							{#if f.icon === 'clock'}
								<circle cx="12" cy="12" r="9"></circle><polyline points="12 7 12 12 15 14"
								></polyline>
							{:else if f.icon === 'star'}
								<polygon
									points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
								></polygon>
							{:else if f.icon === 'calendar'}
								<rect x="3" y="4" width="18" height="18" rx="2"></rect>
								<line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line>
								<line x1="3" y1="10" x2="21" y2="10"></line>
							{:else if f.icon === 'map'}
								<polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
								<line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"
								></line>
							{:else if f.icon === 'chart'}
								<line x1="6" y1="20" x2="6" y2="14"></line><line x1="12" y1="20" x2="12" y2="4"
								></line>
								<line x1="18" y1="20" x2="18" y2="10"></line>
							{:else}
								<circle cx="12" cy="12" r="4"></circle>
								<path
									d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
								></path>
							{/if}
						</svg>
					</span>
					<h3>{f.title}</h3>
					<p>{f.desc}</p>
				</a>
			{/each}
		</div>
	</section>

	<!-- Steps -->
	<section class="section">
		<h2 class="section-title">세 번 누르면 끝</h2>
		<ol class="steps">
			{#each steps as s, i}
				<li class="step">
					<span class="step-number">{i + 1}</span>
					<div>
						<h3>{s.title}</h3>
						<p>{s.desc}</p>
					</div>
				</li>
			{/each}
		</ol>
	</section>

	<!-- Regions -->
	{#if data.regionCounts.length > 0}
		<section class="section">
			<h2 class="section-title">지금 보여 드리는 곳</h2>
			<ul class="regions">
				{#each data.regionCounts as r}
					<li><span>{r.name}</span><b>{r.count}</b></li>
				{/each}
			</ul>
			<p class="regions-note">
				지역은 계속 늘려 가고 있어요. 추가되었으면 하는 테니스장이 있다면
				<a href="/contact">알려 주세요</a>.
			</p>
		</section>
	{/if}

	<!-- Notice -->
	<aside class="notice">
		<h2>알아 두세요</h2>
		<ul>
			<li>CourtNow는 예약을 대신하지 않아요. 실제 예약은 각 기관의 예약 사이트에서 진행됩니다.</li>
			<li>
				빈 시간은 15분마다 갱신되므로, 그 사이 다른 사람이 먼저 예약했을 수 있어요. 예약 사이트에서
				최종 확인해 주세요.
			</li>
			<li>모든 기능은 무료이며, 관심 코트는 이 기기의 브라우저에만 저장됩니다.</li>
		</ul>
	</aside>

	<!-- CTA -->
	<section class="cta-section">
		<h2>홈 화면에 추가하고 앱처럼 쓰세요</h2>
		<p>설치 없이 홈 화면 아이콘 하나로, 빈 코트를 가장 빨리 확인할 수 있어요.</p>
		<div class="cta-buttons">
			<a href="/pwa-guide?tab=ios" class="cta-button">iOS 가이드</a>
			<a href="/pwa-guide?tab=android" class="cta-button">Android 가이드</a>
		</div>
	</section>
</div>

<style>
	.container {
		max-width: var(--container-max);
		margin: 0 auto;
		padding: var(--space-8) var(--space-4) var(--space-16);
	}

	/* Hero */
	.hero {
		display: grid;
		grid-template-columns: 1.15fr 1fr;
		gap: var(--space-10);
		align-items: center;
		padding: var(--space-12) var(--space-10);
		border-radius: var(--radius-2xl);
		background:
			radial-gradient(circle at 85% 15%, rgba(52, 211, 153, 0.35), transparent 45%),
			linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-700) 100%);
		color: white;
		overflow: hidden;
	}

	.eyebrow {
		display: inline-block;
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
		background: rgba(255, 255, 255, 0.12);
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		color: var(--color-primary-200);
	}

	.hero h1 {
		margin: var(--space-4) 0;
		font-size: var(--text-5xl);
		font-weight: var(--font-extrabold);
		line-height: var(--leading-tight);
		letter-spacing: -0.02em;
		word-break: keep-all;
	}

	.lead {
		margin: 0 0 var(--space-8);
		font-size: var(--text-lg);
		line-height: var(--leading-relaxed);
		color: rgba(255, 255, 255, 0.85);
		word-break: keep-all;
	}

	.hero-actions {
		display: flex;
		gap: var(--space-3);
		flex-wrap: wrap;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 48px;
		padding: 0 var(--space-6);
		border-radius: var(--radius-md);
		font-weight: var(--font-semibold);
		text-decoration: none;
		transition: all var(--transition-base);
	}

	.btn-primary {
		background: white;
		color: var(--color-primary-700);
	}

	.btn-ghost {
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.4);
	}

	.btn:hover {
		transform: var(--hover-lift);
	}

	/* Hero preview (장식) */
	.preview {
		padding: var(--space-5);
		border-radius: var(--radius-xl);
		background: white;
		color: var(--color-text-primary);
		box-shadow: 0 24px 48px rgba(0, 0, 0, 0.25);
		transform: rotate(-2deg);
	}

	.preview-dates {
		display: flex;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
		font-size: var(--text-sm);
	}

	.preview-dates span {
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
		background: var(--color-gray-100);
		color: var(--color-text-secondary);
	}

	.preview-dates .on {
		background: var(--color-gray-900);
		color: white;
	}

	.preview-hours {
		display: flex;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}

	.chip {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: var(--space-2) 0;
		border-radius: var(--radius-md);
		background: var(--color-primary-50);
		color: var(--color-primary-700);
		font-size: var(--text-sm);
	}

	.chip small {
		font-size: var(--text-xs);
	}

	.chip.empty {
		background: var(--color-gray-100);
		color: var(--color-gray-400);
	}

	.chip.active {
		background: var(--color-primary-500);
		color: white;
	}

	.preview-row {
		display: flex;
		justify-content: space-between;
		padding: var(--space-3) 0;
		border-top: 1px solid var(--color-gray-100);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
	}

	.preview-row em {
		font-style: normal;
		color: var(--color-primary-600);
		font-weight: var(--font-bold);
	}

	.preview-row.fav span {
		color: var(--color-primary-700);
	}

	/* Numbers */
	.numbers {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: var(--space-4);
		margin: var(--space-8) 0 var(--space-16);
	}

	.numbers div {
		padding: var(--space-5);
		border-radius: var(--radius-lg);
		background: var(--color-bg-primary);
		box-shadow: var(--shadow-sm);
		text-align: center;
	}

	.numbers dt {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	.numbers dd {
		margin: var(--space-1) 0 0;
		font-size: var(--text-3xl);
		font-weight: var(--font-extrabold);
		color: var(--color-primary-600);
	}

	.numbers dd span {
		margin-left: 2px;
		font-size: var(--text-base);
		font-weight: var(--font-semibold);
	}

	/* Sections */
	.section {
		margin-bottom: var(--space-16);
	}

	.section-title {
		margin: 0 0 var(--space-8);
		font-size: var(--text-2xl);
		font-weight: var(--font-bold);
		text-align: center;
		color: var(--color-text-primary);
	}

	.feature-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-5);
	}

	.feature-card {
		display: block;
		padding: var(--space-6);
		border-radius: var(--radius-lg);
		background: var(--color-bg-primary);
		box-shadow: var(--shadow-md);
		text-decoration: none;
		transition: all var(--transition-slow);
	}

	.feature-card:hover {
		transform: var(--hover-lift);
		box-shadow: var(--shadow-lg);
	}

	.feature-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		margin-bottom: var(--space-4);
		border-radius: var(--radius-md);
		background: var(--color-primary-50);
		color: var(--color-primary-600);
	}

	.feature-card h3 {
		margin: 0 0 var(--space-2);
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		color: var(--color-text-primary);
	}

	.feature-card p {
		margin: 0;
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--color-text-secondary);
		word-break: keep-all;
	}

	/* Steps */
	.steps {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-5);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.step {
		display: flex;
		gap: var(--space-4);
		align-items: flex-start;
	}

	.step-number {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: var(--radius-full);
		background: var(--gradient-primary);
		color: white;
		font-size: var(--text-lg);
		font-weight: var(--font-bold);
		box-shadow: var(--shadow-primary-md);
	}

	.step h3 {
		margin: var(--space-1) 0 var(--space-1);
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		color: var(--color-text-primary);
	}

	.step p {
		margin: 0;
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--color-text-secondary);
	}

	/* Regions */
	.regions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-3);
		margin: 0 0 var(--space-4);
		padding: 0;
		list-style: none;
	}

	.regions li {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-2) var(--space-2) var(--space-4);
		border-radius: var(--radius-full);
		border: 1px solid var(--color-primary-200);
		background: var(--color-primary-50);
		font-weight: var(--font-semibold);
		color: var(--color-primary-800);
	}

	.regions b {
		min-width: 28px;
		padding: 2px var(--space-2);
		border-radius: var(--radius-full);
		background: var(--color-primary-500);
		color: white;
		font-size: var(--text-sm);
		text-align: center;
	}

	.regions-note {
		margin: 0;
		text-align: center;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	.regions-note a {
		color: var(--color-primary-600);
		font-weight: var(--font-semibold);
	}

	/* Notice */
	.notice {
		margin-bottom: var(--space-16);
		padding: var(--space-6) var(--space-8);
		border-radius: var(--radius-lg);
		border-left: 4px solid var(--color-primary-500);
		background: var(--color-gray-50);
	}

	.notice h2 {
		margin: 0 0 var(--space-3);
		font-size: var(--text-lg);
		font-weight: var(--font-bold);
		color: var(--color-text-primary);
	}

	.notice ul {
		margin: 0;
		padding-left: var(--space-5);
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--color-text-secondary);
	}

	/* CTA */
	.cta-section {
		padding: var(--space-12) var(--space-8);
		border-radius: var(--radius-xl);
		background: var(--gradient-primary);
		box-shadow: var(--shadow-primary-lg);
		text-align: center;
		color: white;
	}

	.cta-section h2 {
		margin: 0 0 var(--space-3);
		font-size: var(--text-2xl);
		font-weight: var(--font-bold);
	}

	.cta-section p {
		margin: 0 0 var(--space-8);
		color: rgba(255, 255, 255, 0.9);
		line-height: var(--leading-relaxed);
	}

	.cta-buttons {
		display: flex;
		gap: var(--space-4);
		justify-content: center;
		flex-wrap: wrap;
	}

	.cta-button {
		display: inline-flex;
		align-items: center;
		padding: var(--space-4) var(--space-8);
		border-radius: var(--radius-md);
		background: white;
		color: var(--color-primary-600);
		font-weight: var(--font-semibold);
		text-decoration: none;
		box-shadow: var(--shadow-md);
		transition: all var(--transition-base);
	}

	.cta-button:hover {
		transform: var(--hover-lift);
		box-shadow: var(--shadow-lg);
	}

	/* Tablet */
	@media (max-width: 960px) {
		.hero {
			grid-template-columns: 1fr;
		}

		.preview {
			max-width: 420px;
			transform: none;
		}

		.feature-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	/* Mobile */
	@media (max-width: 640px) {
		.container {
			padding: var(--space-4) var(--space-4) var(--space-12);
		}

		.hero {
			padding: var(--space-8) var(--space-5);
			gap: var(--space-8);
		}

		.hero h1 {
			font-size: var(--text-3xl);
		}

		.lead {
			font-size: var(--text-base);
		}

		.btn {
			flex: 1;
		}

		.numbers {
			grid-template-columns: repeat(2, 1fr);
			margin-bottom: var(--space-12);
		}

		.section {
			margin-bottom: var(--space-12);
		}

		.section-title {
			font-size: var(--text-xl);
			margin-bottom: var(--space-6);
		}

		.feature-grid,
		.steps {
			grid-template-columns: 1fr;
		}

		.notice {
			padding: var(--space-5);
		}

		.cta-section {
			padding: var(--space-8) var(--space-5);
		}

		.cta-section h2 {
			font-size: var(--text-xl);
		}

		.cta-button {
			width: 100%;
			justify-content: center;
		}
	}
</style>
