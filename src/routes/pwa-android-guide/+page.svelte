<script>
	import { onMount } from 'svelte';

	onMount(() => {
		// Redirect to unified guide with Android tab
		window.location.href = '/pwa-guide?tab=android';
	});
</script>

<svelte:head>
	<title>Android 설치 가이드 - CourtNow (리다이렉트 중...)</title>
	<meta name="description" content="Android 기기에서 CourtNow 앱을 홈 화면에 추가하는 방법" />
	<meta http-equiv="refresh" content="0; url=/pwa-guide?tab=android" />
	<link rel="canonical" href="https://courtnow.info/pwa-guide?tab=android" />
</svelte:head>

<div class="redirect-container">
	<div class="redirect-notice">
		<div class="spinner"></div>
		<h1>페이지 이동 중...</h1>
		<p>새로운 통합 설치 가이드 페이지로 이동합니다.</p>
		<p class="redirect-link">
			자동으로 이동되지 않으면 <a href="/pwa-guide?tab=android">여기를 클릭</a>하세요.
		</p>
	</div>
</div>

<style>
	.redirect-container {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background: var(--gradient-primary);
		padding: var(--space-8);
	}

	.redirect-notice {
		background: var(--color-bg-primary);
		border-radius: var(--radius-2xl);
		padding: var(--space-12) var(--space-8);
		text-align: center;
		box-shadow: var(--shadow-xl);
		max-width: 500px;
	}

	.spinner {
		width: 50px;
		height: 50px;
		margin: 0 auto var(--space-8);
		border: 4px solid var(--color-border-light);
		border-top-color: var(--color-primary-500);
		border-radius: var(--radius-full);
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.redirect-notice h1 {
		font-size: 1.75rem;
		margin: 0 0 var(--space-4) 0;
		color: var(--color-text-primary);
	}

	.redirect-notice p {
		font-size: var(--text-base);
		color: var(--color-text-secondary);
		margin: 0 0 var(--space-2) 0;
		line-height: 1.6;
	}

	.redirect-link {
		margin-top: var(--space-6);
		padding-top: var(--space-6);
		border-top: 1px solid var(--color-border-light);
	}

	.redirect-link a {
		color: var(--color-primary-600);
		font-weight: var(--font-semibold);
		text-decoration: none;
	}

	.redirect-link a:hover {
		text-decoration: underline;
	}
</style>
