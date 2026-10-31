<script lang="ts">
	import { page } from '$app/stores';

	let mobileMenuOpen = false;

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<nav class="navbar">
	<div class="nav-container">
		<a href="/" class="logo" data-sveltekit-reload on:click={closeMobileMenu}>
			<img src="/favicon.svg" alt="CourtNow Logo" class="logo-icon" />
			<div class="logo-content">
				<span class="logo-text">CourtNow</span>
				<span class="logo-description">수도권 공공 테니스장 예약 현황</span>
			</div>
		</a>

		<button class="mobile-menu-btn" on:click={toggleMobileMenu} aria-label="Toggle menu">
			{#if mobileMenuOpen}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<line x1="3" y1="12" x2="21" y2="12"></line>
					<line x1="3" y1="6" x2="21" y2="6"></line>
					<line x1="3" y1="18" x2="21" y2="18"></line>
				</svg>
			{/if}
		</button>

		<div class="nav-menu" class:open={mobileMenuOpen}>
			<!-- Desktop Navigation -->
			<div class="desktop-nav">
				<a
					href="/"
					class="nav-link"
					data-sveltekit-reload
					class:active={$page.url.pathname === '/'}
					on:click={closeMobileMenu}
				>
					<span class="nav-text">홈</span>
					{#if $page.url.pathname === '/'}
						<div class="active-indicator"></div>
					{/if}
				</a>

				<a
					href="/map"
					class="nav-link"
					class:active={$page.url.pathname === '/map'}
					on:click={closeMobileMenu}
				>
					<span class="nav-text">지도</span>
					{#if $page.url.pathname === '/map'}
						<div class="active-indicator"></div>
					{/if}
				</a>

				<a
					href="/about"
					class="nav-link"
					class:active={$page.url.pathname === '/about'}
					on:click={closeMobileMenu}
				>
					<span class="nav-text">소개</span>
					{#if $page.url.pathname === '/about'}
						<div class="active-indicator"></div>
					{/if}
				</a>

				<a
					href="/content"
					class="nav-link"
					class:active={$page.url.pathname === '/content'}
					on:click={closeMobileMenu}
				>
					<span class="nav-text">테니스 팁 & 전략</span>
					{#if $page.url.pathname === '/content'}
						<div class="active-indicator"></div>
					{/if}
				</a>

				<a
					href="https://match-point.courtnow.info/"
					class="nav-link"
					target="_blank"
					rel="noopener noreferrer"
					on:click={closeMobileMenu}
				>
					<span class="nav-text">매치포인트</span>
				</a>

				<a href="/pwa-guide" class="cta-button" on:click={closeMobileMenu}> 앱 설치 </a>
			</div>

			<!-- Mobile Navigation -->
			<div class="mobile-nav">
				<a
					href="/"
					class="nav-link"
					data-sveltekit-reload
					class:active={$page.url.pathname === '/'}
					on:click={closeMobileMenu}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
						<polyline points="9 22 9 12 15 12 15 22"></polyline>
					</svg>
					<span class="nav-text">홈</span>
					{#if $page.url.pathname === '/'}
						<div class="active-indicator"></div>
					{/if}
				</a>

				<a
					href="/map"
					class="nav-link"
					class:active={$page.url.pathname === '/map'}
					on:click={closeMobileMenu}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
						<line x1="8" y1="2" x2="8" y2="18"></line>
						<line x1="16" y1="6" x2="16" y2="22"></line>
					</svg>
					<span class="nav-text">지도</span>
					{#if $page.url.pathname === '/map'}
						<div class="active-indicator"></div>
					{/if}
				</a>

				<a
					href="/about"
					class="nav-link"
					class:active={$page.url.pathname === '/about'}
					on:click={closeMobileMenu}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="12" cy="12" r="10"></circle>
						<line x1="12" y1="16" x2="12" y2="12"></line>
						<line x1="12" y1="8" x2="12.01" y2="8"></line>
					</svg>
					<span class="nav-text">소개</span>
					{#if $page.url.pathname === '/about'}
						<div class="active-indicator"></div>
					{/if}
				</a>

				<a
					href="/content"
					class="nav-link"
					class:active={$page.url.pathname === '/content'}
					on:click={closeMobileMenu}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
						<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
					</svg>
					<span class="nav-text">테니스 팁 & 전략</span>
					{#if $page.url.pathname === '/content'}
						<div class="active-indicator"></div>
					{/if}
				</a>

				<a
					href="https://match-point.courtnow.info/"
					class="nav-link"
					target="_blank"
					rel="noopener noreferrer"
					on:click={closeMobileMenu}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
						<circle cx="9" cy="7" r="4"></circle>
						<path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
						<path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
					</svg>
					<span class="nav-text">매치포인트</span>
				</a>

				<a href="/pwa-guide" class="cta-button" on:click={closeMobileMenu}> 앱 설치 </a>
			</div>
		</div>
	</div>
</nav>

<style>
	.navbar {
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		position: sticky;
		top: 0;
		z-index: 100;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	}

	.nav-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 64px;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		font-weight: 700;
		font-size: 1.25rem;
		color: #1f2937;
		transition: color 0.2s;
	}

	.logo:hover {
		color: var(--color-primary-600);
	}

	.logo-icon {
		width: 1.5rem;
		height: 1.5rem;
	}

	.logo-content {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		justify-content: center;
	}

	.logo-text {
		font-size: 1.25rem;
		font-weight: 700;
		color: #1f2937;
		line-height: 1.2;
	}

	.logo-description {
		font-size: 0.75rem;
		font-weight: 400;
		color: #6b7280;
		line-height: 1.2;
	}

	.mobile-menu-btn {
		display: none;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
		color: #1f2937;
		z-index: 1001;
		position: relative;
	}

	.nav-menu {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.desktop-nav {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.mobile-nav {
		display: none;
	}

	.nav-link {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0.5rem 1rem;
		text-decoration: none;
		color: #6b7280;
		font-weight: 500;
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1rem;
		position: relative;
		transition: color 0.2s;
		border-radius: 6px;
		height: 64px;
	}

	.nav-link:hover {
		color: var(--color-primary-500);
		background: rgba(16, 185, 129, 0.1);
	}

	.nav-link.active {
		color: var(--color-primary-500);
		font-weight: 600;
	}

	.nav-text {
		margin-bottom: 2px;
	}

	.active-indicator {
		width: 6px;
		height: 6px;
		background-color: var(--color-primary-500);
		border-radius: 50%;
		margin-top: 2px;
	}

	.cta-button {
		background: var(--color-primary-500);
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 9999px;
		text-decoration: none;
		font-weight: 500;
		font-size: 0.875rem;
		transition: all 0.2s;
		border: none;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 36px;
		margin-left: 0.5rem;
		box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
	}

	.cta-button:hover {
		background: var(--color-primary-600);
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(16, 185, 129, 0.4);
	}

	@media (max-width: 768px) {
		.nav-container {
			padding: 0 1rem;
		}

		.logo {
			flex: 1;
			min-width: 0;
		}

		.logo-text {
			font-size: 1.125rem;
		}

		.logo-description {
			display: none;
		}

		.mobile-menu-btn {
			display: block;
			flex-shrink: 0;
		}

		.desktop-nav {
			display: none;
		}

		.mobile-nav {
			display: flex;
			flex-direction: column;
			align-items: stretch;
			gap: 0;
		}

		.nav-menu {
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100vh;
			background: white;
			flex-direction: column;
			align-items: stretch;
			gap: 0;
			padding: 4rem 1rem 1rem;
			transform: translateX(-100%);
			transition: transform 0.3s ease-in-out;
			pointer-events: none;
			z-index: 1000;
			overflow-y: auto;
		}

		.nav-menu.open {
			transform: translateX(0);
			pointer-events: auto;
		}

		.nav-link {
			width: 100%;
			flex-direction: row;
			justify-content: flex-start;
			height: auto;
			padding: 1rem;
			border-radius: 8px;
			font-size: 1.125rem;
			gap: 1rem;
		}

		.nav-link:hover {
			background: #f0f9ff;
		}

		.nav-text {
			margin-bottom: 0;
		}

		.active-indicator {
			margin-top: 0;
			margin-left: auto;
		}

		.cta-button {
			width: calc(100% - 2rem);
			margin: 1rem auto;
			height: 44px;
			font-size: 1rem;
			border-radius: 8px;
		}
	}
</style>
