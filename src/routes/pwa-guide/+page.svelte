<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import TabSwitcher from '$lib/components/pwa/TabSwitcher.svelte';
	import SmartphoneMockup from '$lib/components/pwa/SmartphoneMockup.svelte';
	import IOSStepVisual from '$lib/components/pwa/IOSStepVisual.svelte';
	import AndroidStepVisual from '$lib/components/pwa/AndroidStepVisual.svelte';
	import { detectDevice, getDefaultTab } from '$lib/utils/device-detection';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';

	let activeTab: 'ios' | 'android' = 'ios';
	let currentStep = 1; // Tracks which step is in viewport (for desktop sync)
	let deviceInfo = { os: 'other', browser: 'other', isMobile: false, isStandalone: false };

	onMount(() => {
		// Detect device
		deviceInfo = detectDevice();

		// Auto-detect and set tab from URL or device
		const urlTab = $page.url.searchParams.get('tab');
		if (urlTab === 'ios' || urlTab === 'android') {
			activeTab = urlTab;
		} else {
			activeTab = getDefaultTab();
		}

		// Scroll spy: Detect which step is in viewport
		const stepElements = document.querySelectorAll('.step-section');
		if (stepElements.length > 0) {
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							const stepNum = parseInt(entry.target.getAttribute('data-step') || '1');
							currentStep = stepNum;
						}
					});
				},
				{ threshold: 0.5 }
			);

			stepElements.forEach((el) => observer.observe(el));

			// Cleanup
			return () => {
				stepElements.forEach((el) => observer.unobserve(el));
			};
		}
	});

	function handleTabChange(tab: 'ios' | 'android') {
		activeTab = tab;
		// Update URL without reload
		if (typeof window !== 'undefined') {
			const url = new URL(window.location.href);
			url.searchParams.set('tab', tab);
			window.history.replaceState({}, '', url);
		}
	}
</script>

<svelte:head>
	<title>앱 설치 가이드 - CourtNow | iOS & Android</title>
	<meta name="description" content="iOS와 Android에서 CourtNow 앱을 홈 화면에 추가하는 방법" />
	<link rel="canonical" href="https://courtnow.info/pwa-guide" />
</svelte:head>

<div class="guide-page">
	<PageHeader
		title="📱 앱 설치 가이드"
		description="CourtNow를 홈 화면에 추가하고 앱처럼 사용하세요"
		showDecoration
	/>

	{#if deviceInfo.isStandalone}
		<div class="notice success">
			<p>✅ 이미 CourtNow 앱이 설치되어 있습니다!</p>
		</div>
	{/if}

	<div class="tab-switcher-container">
		<TabSwitcher {activeTab} onTabChange={handleTabChange} />
	</div>

	<div class="guide-layout">
		<!-- Left: Text Instructions -->
		<div class="instructions-panel">
			<section class="benefits-section">
				<h2>왜 설치하나요?</h2>
				<div class="benefits">
					<div class="benefit-card">
						<div class="benefit-icon">⚡</div>
						<h3>빠른 실행</h3>
						<p>앱처럼 바로 실행할 수 있어 빠르고 편리합니다</p>
					</div>
					<div class="benefit-card">
						<div class="benefit-icon">📱</div>
						<h3>앱 경험</h3>
						<p>브라우저 주소창 없이 깨끗한 앱 환경을 제공합니다</p>
					</div>
					<div class="benefit-card">
						<div class="benefit-icon">🔔</div>
						<h3>알림 받기</h3>
						<p>예약 현황 업데이트를 푸시 알림으로 받을 수 있습니다</p>
					</div>
				</div>
			</section>

			<section class="steps-section">
				<h2>설치 방법</h2>
				{#if activeTab === 'ios'}
					<!-- iOS Steps -->
					<div class="step-section" data-step="1">
						<div class="step-header">
							<span class="step-number">1</span>
							<h3>공유 메뉴 열기</h3>
						</div>
						<div class="step-content">
							<p>
								Safari 브라우저 하단의 <strong>공유 버튼</strong>(상자에서 화살표가 나가는 아이콘)을
								탭하세요.
							</p>
						</div>
					</div>

					<div class="step-section" data-step="2">
						<div class="step-header">
							<span class="step-number">2</span>
							<h3>'홈 화면에 추가' 선택</h3>
						</div>
						<div class="step-content">
							<p>
								공유 메뉴를 아래로 스크롤하여 <strong>'홈 화면에 추가'</strong> 옵션을 찾아 선택하세요.
							</p>
						</div>
					</div>

					<div class="step-section" data-step="3">
						<div class="step-header">
							<span class="step-number">3</span>
							<h3>앱 이름 확인</h3>
						</div>
						<div class="step-content">
							<p>앱 이름을 확인하고 오른쪽 상단의 <strong>'추가'</strong> 버튼을 탭하세요.</p>
						</div>
					</div>

					<div class="step-section" data-step="4">
						<div class="step-header">
							<span class="step-number">4</span>
							<h3>완료! 🎉</h3>
						</div>
						<div class="step-content">
							<p>이제 홈 화면에서 CourtNow 앱을 실행할 수 있습니다!</p>
						</div>
					</div>
				{:else}
					<!-- Android Steps -->
					<div class="step-section" data-step="1">
						<div class="step-header">
							<span class="step-number">1</span>
							<h3>메뉴 열기</h3>
						</div>
						<div class="step-content">
							<p>
								Chrome 브라우저 오른쪽 상단의 <strong>메뉴 버튼</strong>(⋮)을 탭하세요.
							</p>
						</div>
					</div>

					<div class="step-section" data-step="2">
						<div class="step-header">
							<span class="step-number">2</span>
							<h3>'홈 화면에 추가' 선택</h3>
						</div>
						<div class="step-content">
							<p>
								메뉴에서 <strong>'홈 화면에 추가'</strong> 또는 <strong>'설치'</strong> 옵션을 찾아 선택하세요.
							</p>
						</div>
					</div>

					<div class="step-section" data-step="3">
						<div class="step-header">
							<span class="step-number">3</span>
							<h3>앱 정보 확인</h3>
						</div>
						<div class="step-content">
							<p>앱 이름과 아이콘을 확인하고 <strong>'추가'</strong> 또는 <strong>'설치'</strong> 버튼을 탭하세요.</p>
						</div>
					</div>

					<div class="step-section" data-step="4">
						<div class="step-header">
							<span class="step-number">4</span>
							<h3>완료! 🎉</h3>
						</div>
						<div class="step-content">
							<p>이제 홈 화면에서 CourtNow 앱을 실행할 수 있습니다!</p>
						</div>
					</div>
				{/if}
			</section>

			<section class="tips-section">
				<h2>💡 팁 & 주의사항</h2>
				<ul class="tips">
					{#if activeTab === 'ios'}
						<li>
							<strong>브라우저 선택:</strong> Safari 브라우저에서만 홈 화면 추가 기능이 제공됩니다
						</li>
						<li>
							<strong>업데이트:</strong> 웹 앱은 자동으로 최신 버전을 사용합니다
						</li>
						<li>
							<strong>삭제:</strong> 일반 앱과 동일하게 홈 화면에서 길게 눌러 삭제할 수 있습니다
						</li>
						<li>
							<strong>오프라인:</strong> 일부 기능은 오프라인에서도 사용 가능합니다
						</li>
					{:else}
						<li>
							<strong>브라우저 선택:</strong> Chrome 브라우저에서만 홈 화면 추가 기능이 제공됩니다
						</li>
						<li>
							<strong>업데이트:</strong> 웹 앱은 자동으로 최신 버전을 사용합니다
						</li>
						<li>
							<strong>삭제:</strong> 일반 앱과 동일하게 앱 서랍이나 설정에서 삭제할 수 있습니다
						</li>
						<li>
							<strong>오프라인:</strong> 일부 기능은 오프라인에서도 사용 가능합니다
						</li>
					{/if}
				</ul>
			</section>
		</div>

		<!-- Right: Sticky Mockup (Desktop) -->
		<div class="mockup-panel">
			<SmartphoneMockup device={activeTab} sticky={true}>
				{#if activeTab === 'ios'}
					<IOSStepVisual step={currentStep} />
				{:else}
					<AndroidStepVisual step={currentStep} />
				{/if}
			</SmartphoneMockup>
		</div>
	</div>
</div>

<style>
	.guide-page {
		max-width: var(--container-max);
		margin: 0 auto;
		padding: var(--space-8);
		background: var(--color-bg-primary);
		min-height: 100vh;
	}

	.notice {
		background: var(--color-success-50);
		border: 1px solid var(--color-success-300);
		border-radius: var(--radius-xl);
		padding: var(--space-4);
		margin-bottom: var(--space-8);
		text-align: center;
	}

	.notice.success p {
		margin: 0;
		color: var(--color-success-700);
		font-weight: var(--font-medium);
	}

	.tab-switcher-container {
		display: flex;
		justify-content: center;
		margin-bottom: var(--space-12);
	}

	.guide-layout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-16);
		margin-top: var(--space-12);
	}

	.instructions-panel {
		display: flex;
		flex-direction: column;
		gap: var(--space-12);
	}

	section h2 {
		font-size: 1.75rem;
		margin: 0 0 var(--space-6) 0;
		color: var(--color-text-primary);
		padding-bottom: var(--space-3);
		border-bottom: 2px solid var(--color-border-light);
	}

	.benefits {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--space-6);
	}

	.benefit-card {
		text-align: center;
		padding: var(--space-6);
		background: var(--color-bg-primary);
		border-radius: var(--radius-xl);
		border: 1px solid var(--color-border-light);
		box-shadow: var(--shadow-sm);
		transition: transform var(--transition-base), box-shadow var(--transition-base);
	}

	.benefit-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-md);
	}

	.benefit-icon {
		font-size: var(--text-4xl);
		margin-bottom: var(--space-4);
	}

	.benefit-card h3 {
		font-size: var(--text-lg);
		margin: 0 0 var(--space-2) 0;
		color: var(--color-text-primary);
	}

	.benefit-card p {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		margin: 0;
		line-height: 1.5;
	}

	.steps-section {
		background: var(--color-bg-primary);
		border-radius: var(--radius-xl);
		padding: var(--space-8);
		box-shadow: var(--shadow-sm);
	}

	.step-section {
		margin-bottom: var(--space-10);
		scroll-margin-top: 100px;
	}

	.step-section:last-child {
		margin-bottom: 0;
	}

	.step-header {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		margin-bottom: var(--space-4);
	}

	.step-number {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		background: var(--gradient-primary);
		color: white;
		border-radius: var(--radius-full);
		font-weight: var(--font-bold);
		font-size: var(--text-lg);
		flex-shrink: 0;
	}

	.step-header h3 {
		font-size: var(--text-xl);
		margin: 0;
		color: var(--color-text-primary);
	}

	.step-content p {
		margin: 0;
		color: var(--color-text-secondary);
		line-height: 1.7;
		font-size: var(--text-base);
	}

	.step-content strong {
		color: var(--color-text-primary);
		font-weight: var(--font-semibold);
	}

	.tips-section {
		background: var(--color-bg-primary);
		border-radius: var(--radius-xl);
		padding: var(--space-8);
		box-shadow: var(--shadow-sm);
	}

	.tips {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.tips li {
		padding: var(--space-3) var(--space-4);
		margin-bottom: var(--space-3);
		background: var(--color-bg-secondary);
		border-radius: var(--radius-lg);
		border-left: 4px solid var(--color-primary-500);
		line-height: 1.6;
		color: var(--color-text-secondary);
	}

	.tips li:last-child {
		margin-bottom: 0;
	}

	.tips strong {
		color: var(--color-text-primary);
	}

	.mockup-panel {
		display: flex;
		justify-content: center;
		height: fit-content;
	}

	/* Tablet */
	@media (max-width: 768px) {
		.guide-layout {
			grid-template-columns: 1fr;
			gap: var(--space-8);
		}

		.mockup-panel {
			position: static;
			order: 2;
		}

		.mockup-placeholder {
			transform: scale(0.8);
		}
	}

	/* Mobile */
	@media (max-width: 640px) {
		.guide-page {
			padding: var(--space-4);
		}

		.mockup-panel {
			/* 모바일에서도 목업 표시 (축소) */
			display: flex;
			justify-content: center;
			margin-top: var(--space-6);
			order: 1; /* 단계 설명 아래에 표시 */
		}

		.guide-layout {
			display: flex;
			flex-direction: column;
		}

		.instructions-panel {
			order: 0;
		}

		.benefits {
			grid-template-columns: 1fr;
		}

		.steps-section,
		.tips-section {
			padding: var(--space-6);
		}

		.step-number {
			width: 32px;
			height: 32px;
			font-size: var(--text-base);
		}

		.step-header h3 {
			font-size: var(--text-lg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.benefit-card {
			transition: none;
		}
	}
</style>
