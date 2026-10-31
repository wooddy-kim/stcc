<svelte:head>
	<title>소개 - CourtNow | 테니스장 예약 현황 조회 서비스</title>
	<meta name="description" content="CourtNow는 수도권 공공 테니스장 예약 현황을 한눈에 확인할 수 있는 서비스입니다. 요일별 예약 가능 시간을 빠르게 조회하세요." />
	<link rel="canonical" href="https://courtnow.info/about" />

	<!-- Open Graph Tags -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="소개 - CourtNow | 테니스장 예약 현황 조회 서비스" />
	<meta property="og:description" content="수도권 공공 테니스장 예약 현황을 한눈에! 요일별 조회, 실시간 현황 확인으로 편리하게 테니스를 즐기세요." />
	<meta property="og:url" content="https://courtnow.info/about" />
	<meta property="og:site_name" content="CourtNow" />
	<meta property="og:locale" content="ko_KR" />
	<meta property="og:image" content="https://courtnow.info/og-image.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />

	<!-- Twitter Card Tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="소개 - CourtNow | 테니스장 예약 현황 조회 서비스" />
	<meta name="twitter:description" content="수도권 공공 테니스장 예약 현황을 한눈에 확인하세요" />
	<meta name="twitter:image" content="https://courtnow.info/og-image.png" />

	<!-- JSON-LD Structured Data -->
	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "AboutPage",
			"mainEntity": {
				"@type": "Organization",
				"name": "CourtNow",
				"description": "수도권 공공 테니스장 예약 현황 조회 서비스",
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
			"description": "CourtNow는 공공 테니스장 예약 현황을 한눈에 확인할 수 있는 서비스입니다. 요일별 예약 가능 여부를 빠르게 조회하여 테니스를 즐기시는 분들의 편의를 돕습니다.",
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

<script lang="ts">
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
</script>

<div class="container">
	<!-- Hero Section -->
	<PageHeader
		title="코트 예약, 이제 더 쉽고 빠르게"
		description="CourtNow는 공공 테니스장 예약 현황을 한눈에 확인할 수 있는 서비스입니다. 각 테니스장의 예약 가능 여부를 빠르게 조회하여, 테니스를 즐기시는 분들의 편의를 돕습니다."
		gradient
		showDecoration
	/>

	<!-- Feature Cards -->
	<section class="features">
		<h2 class="section-title">주요 기능</h2>
		<div class="feature-grid">
			<div class="feature-card">
				<div class="icon-wrapper">
					<svg
						class="feature-icon"
						width="32"
						height="32"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
						<circle cx="12" cy="10" r="3"></circle>
					</svg>
				</div>
				<h3>테니스장 예약 현황</h3>
				<p>수도권 공공 테니스장의 실시간 예약 현황을 확인할 수 있습니다.</p>
			</div>

			<div class="feature-card">
				<div class="icon-wrapper">
					<svg
						class="feature-icon"
						width="32"
						height="32"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
						<line x1="16" y1="2" x2="16" y2="6"></line>
						<line x1="8" y1="2" x2="8" y2="6"></line>
						<line x1="3" y1="10" x2="21" y2="10"></line>
					</svg>
				</div>
				<h3>요일별 조회</h3>
				<p>원하는 요일을 선택하여 예약 가능한 시간대를 빠르게 찾아보세요.</p>
			</div>
		</div>
	</section>

	<!-- Steps Section -->
	<section class="steps-section">
		<h2 class="section-title">사용 방법</h2>
		<div class="steps">
			<div class="step">
				<div class="step-number">1</div>
				<div class="step-content">
					<h3>테니스장 선택</h3>
					<p>홈 페이지에서 예약 현황을 확인하고 싶은 테니스장을 선택합니다.</p>
				</div>
			</div>
			<div class="step-arrow">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="9 18 15 12 9 6"></polyline>
				</svg>
			</div>
			<div class="step">
				<div class="step-number">2</div>
				<div class="step-content">
					<h3>요일 선택</h3>
					<p>조회하고 싶은 요일을 클릭합니다. (여러 요일 선택 가능)</p>
				</div>
			</div>
			<div class="step-arrow">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="9 18 15 12 9 6"></polyline>
				</svg>
			</div>
			<div class="step">
				<div class="step-number">3</div>
				<div class="step-content">
					<h3>예약 현황 확인</h3>
					<p>선택한 조건에 맞는 예약 현황이 자동으로 표시됩니다.</p>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="cta-section">
		<div class="cta-content">
			<div class="cta-text">
				<h2>앱으로 더 편하게 사용하세요</h2>
				<p>홈 화면에 추가하여 앱처럼 빠르게 접근하고, 오프라인에서도 사용할 수 있습니다.</p>
			</div>
			<div class="cta-buttons">
				<a href="/pwa-ios-guide" class="cta-button">iOS 가이드</a>
				<a href="/pwa-android-guide" class="cta-button">Android 가이드</a>
			</div>
		</div>
	</section>
</div>

<style>
	.container {
		max-width: var(--container-max);
		margin: 0 auto;
		padding: var(--space-8) var(--space-4);
	}

	/* Section Title */
	.section-title {
		font-size: var(--text-2xl);
		font-weight: var(--font-bold);
		text-align: center;
		margin: 0 0 var(--space-10) 0;
		color: var(--color-text-primary);
	}

	/* Feature Cards */
	.features {
		margin-bottom: var(--space-16);
	}

	.feature-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--space-8);
	}

	.feature-card {
		padding: var(--space-8);
		background: var(--color-bg-primary);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
		text-align: center;
		transition: all var(--transition-slow);
	}

	.feature-card:hover {
		transform: var(--hover-lift);
		box-shadow: var(--shadow-lg);
	}

	.icon-wrapper {
		width: 64px;
		height: 64px;
		margin: 0 auto var(--space-6);
		background: var(--color-primary-50);
		border-radius: var(--radius-full);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.feature-icon {
		color: var(--color-primary-500);
	}

	.feature-card h3 {
		font-size: var(--text-xl);
		font-weight: var(--font-semibold);
		margin: 0 0 var(--space-3) 0;
		color: var(--color-text-primary);
	}

	.feature-card p {
		font-size: var(--text-base);
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		margin: 0;
	}

	/* Steps Section */
	.steps-section {
		margin-bottom: var(--space-16);
	}

	.steps {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-4);
		margin: 0 auto;
		max-width: 1000px;
	}

	.step {
		flex: 1;
		text-align: center;
		padding: var(--space-6);
	}

	.step-number {
		width: 60px;
		height: 60px;
		margin: 0 auto var(--space-4);
		background: var(--gradient-primary);
		color: white;
		border-radius: var(--radius-full);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-2xl);
		font-weight: var(--font-bold);
		box-shadow: var(--shadow-primary-md);
	}

	.step-content h3 {
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		margin: 0 0 var(--space-2) 0;
		color: var(--color-text-primary);
	}

	.step-content p {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		margin: 0;
	}

	.step-arrow {
		color: var(--color-gray-300);
		flex-shrink: 0;
	}

	/* CTA Section */
	.cta-section {
		background: var(--gradient-primary);
		border-radius: var(--radius-xl);
		padding: var(--space-12) var(--space-8);
		box-shadow: var(--shadow-primary-lg);
	}

	.cta-content {
		text-align: center;
		max-width: 700px;
		margin: 0 auto;
	}

	.cta-text h2 {
		font-size: var(--text-2xl);
		font-weight: var(--font-bold);
		color: white;
		margin: 0 0 var(--space-4) 0;
	}

	.cta-text p {
		font-size: var(--text-base);
		color: rgba(255, 255, 255, 0.9);
		line-height: var(--leading-relaxed);
		margin: 0 0 var(--space-8) 0;
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
		background: white;
		color: var(--color-primary-600);
		text-decoration: none;
		border-radius: var(--radius-md);
		font-size: var(--text-base);
		font-weight: var(--font-semibold);
		transition: all var(--transition-base);
		box-shadow: var(--shadow-md);
	}

	.cta-button:hover {
		transform: var(--hover-lift);
		box-shadow: var(--shadow-lg);
		background: var(--color-gray-50);
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.container {
			padding: var(--space-8) var(--space-4);
		}

		.section-title {
			font-size: var(--text-xl);
			margin-bottom: var(--space-8);
		}

		.feature-grid {
			grid-template-columns: 1fr;
			gap: var(--space-6);
		}

		.features,
		.steps-section {
			margin-bottom: var(--space-12);
		}

		/* Mobile Timeline Style */
		.steps {
			flex-direction: column;
			align-items: stretch;
			gap: var(--space-8);
			position: relative;
			padding-left: 5rem;
		}

		.steps::before {
			content: '';
			position: absolute;
			left: 30px;
			top: 30px;
			bottom: calc(80px + 2rem - 30px);
			width: 2px;
			background: linear-gradient(180deg, var(--color-primary-500) 0%, var(--color-gray-300) 100%);
			z-index: 0;
		}

		.step {
			text-align: left;
			padding: 0;
			position: relative;
			width: 100%;
			max-width: none;
			min-height: 80px;
		}

		.step-number {
			position: absolute;
			left: -5rem;
			top: 0;
			width: 60px;
			height: 60px;
			margin: 0;
			z-index: 1;
		}

		.step-content {
			width: 100%;
			padding-top: var(--space-2);
		}

		.step-content h3 {
			font-size: var(--text-lg);
		}

		.step-arrow {
			display: none;
		}

		.cta-section {
			padding: var(--space-8) var(--space-6);
		}

		.cta-text h2 {
			font-size: var(--text-xl);
		}

		.cta-text p {
			font-size: var(--text-base);
		}

		.cta-buttons {
			flex-direction: column;
		}

		.cta-button {
			width: 100%;
			justify-content: center;
		}
	}
</style>
