<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { getCookie, setCookie } from '$lib/utils/cookies';

	// State variables
	let showInstallPrompt = false;
	let isIOS = false;
	let isAndroid = false;
	let isKakaoInAppBrowser = false;
	let deferredPrompt: any = null;

	// Check if we should show the install prompt
	onMount(() => {
		if (!browser) return;

		let handleBeforeInstallPrompt: (e: Event) => void;

		// Check if we're on the home page
		const unsubscribe = page.subscribe(($page) => {
			// Only show on home page
			if ($page.url.pathname !== '/') {
				showInstallPrompt = false;
				return;
			}

			// Check if user chose to hide the prompt for a week
			const hideUntil = getCookie('pwa_prompt_hide_until');
			if (hideUntil) {
				const hideUntilDate = new Date(hideUntil);
				if (hideUntilDate > new Date()) {
					// Still within the hiding period
					showInstallPrompt = false;
					return;
				}
			}

			// Check for iOS (mobile Safari)
			const userAgent = navigator.userAgent.toLowerCase();
			isIOS = /iphone|ipad|ipod/.test(userAgent) && !('MSStream' in window);

			// Check for Android
			isAndroid = /android/.test(userAgent);

			// Check for KakaoTalk in-app browser
			isKakaoInAppBrowser = /kakaotalk/.test(userAgent);

			// Don't show prompt in KakaoTalk in-app browser
			if (isKakaoInAppBrowser) {
				showInstallPrompt = false;
				return;
			}

			// Listen for beforeinstallprompt event (Android/Chrome)
			handleBeforeInstallPrompt = (e: Event) => {
				e.preventDefault();
				deferredPrompt = e;
				showInstallPrompt = true;
			};

			window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

			// Check if already installed
			const checkIfInstalled = () => {
				// If standalone mode (already installed PWA)
				if (window.matchMedia('(display-mode: standalone)').matches) {
					showInstallPrompt = false;
					return;
				}

				// For iOS, we show the guide regardless since there's no install event
				if (isIOS) {
					showInstallPrompt = true;
				}
			};

			checkIfInstalled();
		});

		// Clean up subscriptions and event listeners
		return () => {
			unsubscribe();
			if (handleBeforeInstallPrompt) {
				window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
			}
		};
	});

	// Handle install button click
	async function handleInstallClick() {
		if (isAndroid && deferredPrompt) {
			// Show the install prompt for Android
			deferredPrompt.prompt();

			// Wait for the user to respond to the prompt
			const { outcome } = await deferredPrompt.userChoice;

			// Hide the prompt regardless of user choice
			showInstallPrompt = false;
			deferredPrompt = null;
		} else if (isIOS) {
			// For iOS, show the installation guide
			showInstallPrompt = false;
			// We'll navigate to the unified guide page with iOS tab
			window.location.href = '/pwa-guide?tab=ios';
		}
	}

	// Close the prompt
	function closePrompt() {
		showInstallPrompt = false;
	}

	// Close the prompt and set cookie to hide it for a week
	function closePromptForWeek() {
		const oneWeekFromNow = new Date();
		oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
		setCookie('pwa_prompt_hide_until', oneWeekFromNow.toISOString(), 7);
		showInstallPrompt = false;
	}
</script>

{#if showInstallPrompt}
	<div class="pwa-install-prompt">
		<div class="prompt-content">
			<div class="prompt-header">
				<div class="header-icon-wrapper">
					<img src="/favicon.svg" alt="CourtNow Logo" class="header-icon" />
				</div>

				<div class="header-text">
					<h3>앱으로 더 빠르고 편하게 예약하세요</h3>
					<p class="header-subtitle">홈 화면에 바로가기를 추가하면 앱처럼 빠릅니다</p>
				</div>
				<button class="close-button" on:click={closePrompt} aria-label="닫기">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>

			{#if isIOS}
				<div class="prompt-body">
					<div class="ios-instructions">
						<div class="step">
							<span class="step-number">1</span>
							<span class="step-text">하단 공유 버튼 탭</span>
						</div>
						<div class="step">
							<span class="step-number">2</span>
							<span class="step-text">'홈 화면에 추가' 선택</span>
						</div>
					</div>
				</div>
			{/if}

			<div class="prompt-actions">
				<button class="install-button" on:click={handleInstallClick}>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
						<polyline points="7 10 12 15 17 10"></polyline>
						<line x1="12" y1="15" x2="12" y2="3"></line>
					</svg>
					<span>{isIOS ? '설치 가이드 보기' : '홈 화면에 추가'}</span>
				</button>
				<button class="dismiss-button" on:click={closePromptForWeek}>
					일주일간 보지 않기
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.pwa-install-prompt {
		position: fixed;
		bottom: 16px;
		right: 16px;
		z-index: 1000;
		max-width: 320px;
		animation: slideUp 0.3s ease-out;
	}

	.prompt-content {
		background: white;
		border-radius: 16px;
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
		overflow: hidden;
		border: 1px solid #e5e7eb;
	}

	.prompt-header {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px;
		border-bottom: 1px solid #f3f4f6;
	}

	.header-icon-wrapper {
		width: 48px;
		height: 48px;
		background: #f9fafb;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		padding: 8px;
	}

	.header-icon {
		width: 100%;
		height: 100%;
	}

	.header-text h3 {
		margin: 0 0 4px 0;
		font-size: 1.125rem;
		font-weight: 700;
		color: #1f2937;
		line-height: 1.4;
	}

	.header-subtitle {
		margin: 0;
		font-size: 0.875rem;
		color: #6b7280;
		line-height: 1.4;
	}

	.close-button {
		background: none;
		border: none;
		cursor: pointer;
		padding: 6px;
		color: #d1d5db;
		border-radius: 6px;
		transition: all 0.2s;
		margin-left: auto;
		flex-shrink: 0;
	}

	.close-button:hover {
		background-color: #f9fafb;
		color: #9ca3af;
	}

	.prompt-body {
		padding: 0 16px 16px 16px;
	}

	.ios-instructions {
		background: #f0f9ff;
		border-radius: 12px;
		padding: 12px;
	}

	.step {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
	}

	.step:last-child {
		margin-bottom: 0;
	}

	.step-number {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		background: #3b82f6;
		color: white;
		border-radius: 50%;
		font-size: 0.625rem;
		font-weight: 700;
		flex-shrink: 0;
	}

	.step-text {
		color: #374151;
		font-size: 0.8125rem;
		line-height: 1.4;
	}

	.prompt-actions {
		padding: 0 16px 16px 16px;
	}

	.install-button {
		width: 100%;
		height: 48px;
		padding: 0 16px;
		background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);
		color: white;
		border: none;
		border-radius: 12px;
		font-weight: 600;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.install-button:hover {
		background: linear-gradient(135deg, #059669 0%, #0f766e 100%);
		box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
		transform: translateY(-1px);
	}

	.dismiss-button {
		width: 100%;
		padding: 8px;
		background: transparent;
		color: #9ca3af;
		border: none;
		font-weight: 400;
		font-size: 0.8125rem;
		cursor: pointer;
		transition: all 0.2s;
		margin-top: 8px;
	}

	.dismiss-button:hover {
		color: #6b7280;
		text-decoration: underline;
	}

	@keyframes slideUp {
		from {
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	@media (max-width: 640px) {
		.pwa-install-prompt {
			bottom: 0;
			left: 0;
			right: 0;
			max-width: none;
		}

		.prompt-content {
			border-radius: 20px 20px 0 0;
			box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06);
		}

		.prompt-header {
			padding: 16px;
		}

		.prompt-body {
			padding: 0 16px 16px 16px;
		}

		.prompt-actions {
			padding: 0 16px 16px 16px;
		}
	}
</style>
