<script lang="ts">
	export let step: number = 1;
</script>

<div class="android-visual">
	{#if step === 1}
		<!-- Step 1: Chrome browser with menu button highlighted -->
		<div class="chrome-browser">
			<div class="chrome-toolbar">
				<div class="toolbar-left">
					<button class="toolbar-icon">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
							<circle cx="12" cy="12" r="10" />
							<path d="M12 2a10 10 0 0 1 0 20" fill="white" />
							<circle cx="12" cy="12" r="5" fill="white" />
						</svg>
					</button>
				</div>
				<div class="url-box">
					<svg class="lock-icon" width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
						<path
							d="M7 0a3.5 3.5 0 0 0-3.5 3.5V5H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-.5V3.5A3.5 3.5 0 0 0 7 0z"
						/>
					</svg>
					<span class="url-text">courtnow.info</span>
				</div>
				<div class="toolbar-right">
					<button class="toolbar-icon tabs">
						<span class="tab-count">3</span>
					</button>
					<button class="toolbar-icon menu-button ripple">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
							<circle cx="12" cy="6" r="2" />
							<circle cx="12" cy="12" r="2" />
							<circle cx="12" cy="18" r="2" />
						</svg>
					</button>
				</div>
			</div>

			<div class="browser-content">
				<div class="page-content">
					<div class="logo-placeholder">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="60" height="60">
							<circle cx="50" cy="50" r="48" fill="#10b981" />
							<ellipse cx="50" cy="50" rx="25" ry="35" fill="none" stroke="#ffffff" stroke-width="2"/>
							<ellipse cx="50" cy="50" rx="15" ry="25" fill="none" stroke="#ffffff" stroke-width="1.5"/>
							<rect x="48" y="15" width="4" height="70" fill="#ffffff" rx="2"/>
							<circle cx="30" cy="30" r="8" fill="#c8ff00" />
						</svg>
					</div>
					<h2>CourtNow</h2>
					<p>공공 테니스장 예약 현황</p>
				</div>
			</div>
		</div>
	{:else if step === 2}
		<!-- Step 2: Chrome menu opened with "Add to Home Screen" option -->
		<div class="chrome-browser">
			<div class="chrome-toolbar">
				<div class="toolbar-left">
					<button class="toolbar-icon">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
							<circle cx="12" cy="12" r="10" />
							<path d="M12 2a10 10 0 0 1 0 20" fill="white" />
							<circle cx="12" cy="12" r="5" fill="white" />
						</svg>
					</button>
				</div>
				<div class="url-box">
					<svg class="lock-icon" width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
						<path
							d="M7 0a3.5 3.5 0 0 0-3.5 3.5V5H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-.5V3.5A3.5 3.5 0 0 0 7 0z"
						/>
					</svg>
					<span class="url-text">courtnow.info</span>
				</div>
				<div class="toolbar-right">
					<button class="toolbar-icon tabs">
						<span class="tab-count">3</span>
					</button>
					<button class="toolbar-icon menu-button">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
							<circle cx="12" cy="6" r="2" />
							<circle cx="12" cy="12" r="2" />
							<circle cx="12" cy="18" r="2" />
						</svg>
					</button>
				</div>
			</div>

			<div class="browser-content">
				<div class="page-content blurred">
					<div class="logo-placeholder">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="60" height="60">
							<circle cx="50" cy="50" r="48" fill="#10b981" />
						</svg>
					</div>
					<h2>CourtNow</h2>
				</div>
			</div>

			<!-- Chrome Menu Dropdown -->
			<div class="chrome-menu slide-in">
				<div class="menu-item">
					<svg class="menu-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
						<rect x="3" y="5" width="18" height="2" rx="1" />
						<rect x="3" y="11" width="18" height="2" rx="1" />
						<rect x="3" y="17" width="18" height="2" rx="1" />
					</svg>
					<span>새 탭</span>
				</div>

				<div class="menu-item">
					<svg class="menu-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
						<path d="M17 3H7c-1.1 0-2 .9-2 2v2h2V5h10v14H7v-2H5v2c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
					</svg>
					<span>시크릿 탭</span>
				</div>

				<div class="menu-divider"></div>

				<div class="menu-item highlighted">
					<svg class="menu-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
						<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
						<rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" fill="none" stroke-width="2" />
					</svg>
					<span><strong>홈 화면에 추가</strong></span>
					<div class="arrow-indicator">→</div>
				</div>

				<div class="menu-divider"></div>

				<div class="menu-item">
					<svg class="menu-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
						<path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
					</svg>
					<span>북마크</span>
				</div>

				<div class="menu-item">
					<svg class="menu-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"
						/>
					</svg>
					<span>새로고침</span>
				</div>
			</div>
		</div>
	{:else if step === 3}
		<!-- Step 3: Install prompt dialog -->
		<div class="dialog-container">
			<div class="install-sheet slide-up-bottom">
				<div class="sheet-header">
					<img src="/app-icon.svg" class="sheet-app-icon" alt="CourtNow" />
					<div class="sheet-app-info">
						<h3>CourtNow 설치</h3>
						<p>courtnow.info</p>
					</div>
				</div>
				<div class="sheet-description">
					<p>이 앱을 기기에 설치하시겠습니까?</p>
					<ul class="permission-list">
						<li>오프라인에서 사용 가능</li>
						<li>홈 화면에서 빠르게 실행</li>
					</ul>
				</div>
				<div class="sheet-actions">
					<button class="sheet-button cancel">취소</button>
					<button class="sheet-button install">설치</button>
				</div>
			</div>
		</div>
	{:else if step === 4}
		<!-- Step 4: Home screen with CourtNow app installed -->
		<div class="home-screen">
			<div class="wallpaper-android"></div>
			<div class="status-bar-android">
				<div class="status-left">
					<span class="time-android">14:23</span>
				</div>
				<div class="status-right">
					<svg width="16" height="12" viewBox="0 0 16 12" fill="white">
						<rect x="0" y="9" width="2" height="3" />
						<rect x="4" y="6" width="2" height="6" />
						<rect x="8" y="3" width="2" height="9" />
						<rect x="12" y="0" width="2" height="12" />
					</svg>
					<svg width="18" height="14" viewBox="0 0 18 14" fill="white">
						<path
							d="M9 14a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-3.5-3.5a5 5 0 0 1 7 0"
							stroke="white"
							stroke-width="2"
							fill="none"
						/>
					</svg>
					<span class="battery-percent">87%</span>
				</div>
			</div>

			<div class="app-grid-android">
				<!-- Row 1 -->
				<div class="app-item-android placeholder"></div>
				<div class="app-item-android placeholder"></div>
				<div class="app-item-android courtnow">
					<img src="/app-icon.svg" class="home-app-icon-android success-pop" alt="CourtNow" />
					<span>CourtNow</span>
					<div class="success-badge-android">✓</div>
				</div>
				<div class="app-item-android placeholder"></div>
				<div class="app-item-android placeholder"></div>

				<!-- Row 2 -->
				<div class="app-item-android placeholder"></div>
				<div class="app-item-android placeholder"></div>
				<div class="app-item-android placeholder"></div>
				<div class="app-item-android placeholder"></div>
				<div class="app-item-android placeholder"></div>

				<!-- Row 3 -->
				<div class="app-item-android placeholder"></div>
				<div class="app-item-android placeholder"></div>
				<div class="app-item-android placeholder"></div>
				<div class="app-item-android placeholder"></div>
				<div class="app-item-android placeholder"></div>

				<!-- Row 4 -->
				<div class="app-item-android placeholder"></div>
				<div class="app-item-android placeholder"></div>
				<div class="app-item-android placeholder"></div>
				<div class="app-item-android placeholder"></div>
				<div class="app-item-android placeholder"></div>
			</div>
		</div>
	{/if}
</div>

<style>
	.android-visual {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		background: #fff;
		position: relative;
		font-family: 'Roboto', system-ui, sans-serif;
	}

	/* Step 1 & 2: Chrome Browser */
	.chrome-browser {
		display: flex;
		flex-direction: column;
		height: 100%;
		position: relative;
	}

	.chrome-toolbar {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		background: #fff;
		border-bottom: 1px solid #dadce0;
	}

	.toolbar-left,
	.toolbar-right {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.toolbar-icon {
		background: none;
		border: none;
		color: #5f6368;
		cursor: pointer;
		padding: 8px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.2s;
		position: relative;
	}

	.toolbar-icon:hover {
		background: #f1f3f4;
	}

	.toolbar-icon.tabs {
		border: 1.5px solid #5f6368;
		border-radius: 4px;
		width: 32px;
		height: 32px;
		padding: 4px;
	}

	.tab-count {
		font-size: 12px;
		font-weight: 600;
		color: #5f6368;
	}

	.menu-button.ripple {
		animation: ripple-effect 2s infinite;
	}

	@keyframes ripple-effect {
		0%,
		100% {
			box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.7);
		}
		50% {
			box-shadow: 0 0 0 10px rgba(66, 133, 244, 0);
		}
	}

	.url-box {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 8px;
		background: #f1f3f4;
		padding: 10px 16px;
		border-radius: 24px;
	}

	.lock-icon {
		color: #5f6368;
	}

	.url-text {
		font-size: 14px;
		color: #202124;
	}

	.browser-content {
		flex: 1;
		overflow-y: auto;
		padding: 2rem 1rem;
		position: relative;
	}

	.browser-content.blurred {
		filter: brightness(0.7);
		pointer-events: none;
	}

	.page-content {
		text-align: center;
	}

	.logo-placeholder {
		margin: 0 auto 1rem;
		width: 60px;
		height: 60px;
	}

	.page-content h2 {
		font-size: 1.5rem;
		margin: 0 0 0.5rem 0;
		color: #202124;
	}

	.page-content p {
		font-size: 0.875rem;
		color: #5f6368;
		margin: 0;
	}

	/* Step 2: Chrome Menu */
	.chrome-menu {
		position: absolute;
		top: 56px;
		right: 8px;
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
		min-width: 240px;
		z-index: 10;
		overflow: hidden;
	}

	.slide-in {
		animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-10px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.menu-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		cursor: pointer;
		transition: background 0.2s;
	}

	.menu-item:hover {
		background: #f1f3f4;
	}

	.menu-item.highlighted {
		background: #e8f0fe;
		border-left: 4px solid #4285f4;
		padding-left: 12px;
		animation: highlight-pulse-android 2s infinite;
	}

	@keyframes highlight-pulse-android {
		0%,
		100% {
			background: #e8f0fe;
		}
		50% {
			background: #d2e3fc;
		}
	}

	.menu-icon {
		color: #5f6368;
		flex-shrink: 0;
	}

	.menu-item span {
		flex: 1;
		font-size: 14px;
		color: #202124;
	}

	.arrow-indicator {
		color: #4285f4;
		font-size: 18px;
		font-weight: bold;
	}

	.menu-divider {
		height: 1px;
		background: #e8eaed;
		margin: 4px 0;
	}

	/* Step 3: Install Sheet */
	.dialog-container {
		display: flex;
		align-items: flex-end;
		justify-content: center;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		padding-bottom: 0;
	}

	.install-sheet {
		background: white;
		border-radius: 28px 28px 0 0;
		width: 100%;
		padding: 24px;
		box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
	}

	.slide-up-bottom {
		animation: slideUpBottom 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	@keyframes slideUpBottom {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}

	.sheet-header {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 16px;
	}

	.sheet-app-icon {
		width: 72px;
		height: 72px;
		border-radius: 16px;
		flex-shrink: 0;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.sheet-app-info h3 {
		margin: 0 0 4px 0;
		font-size: 20px;
		font-weight: 500;
		color: #202124;
	}

	.sheet-app-info p {
		margin: 0;
		font-size: 14px;
		color: #5f6368;
	}

	.sheet-description {
		margin-bottom: 24px;
	}

	.sheet-description p {
		margin: 0 0 12px 0;
		font-size: 16px;
		color: #202124;
	}

	.permission-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.permission-list li {
		padding: 6px 0 6px 28px;
		font-size: 14px;
		color: #5f6368;
		position: relative;
	}

	.permission-list li::before {
		content: '✓';
		position: absolute;
		left: 0;
		color: #34a853;
		font-weight: bold;
	}

	.sheet-actions {
		display: flex;
		gap: 12px;
		justify-content: flex-end;
	}

	.sheet-button {
		padding: 10px 24px;
		border-radius: 20px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.sheet-button.cancel {
		background: none;
		border: 1px solid #dadce0;
		color: #5f6368;
	}

	.sheet-button.cancel:hover {
		background: #f1f3f4;
	}

	.sheet-button.install {
		background: #4285f4;
		border: none;
		color: white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	}

	.sheet-button.install:hover {
		background: #3367d6;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
	}

	/* Step 4: Home Screen */
	.home-screen {
		display: flex;
		flex-direction: column;
		height: 100%;
		position: relative;
		overflow: hidden;
	}

	.wallpaper-android {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, #00bfa5 0%, #6200ea 100%);
		z-index: 0;
	}

	.status-bar-android {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 16px;
		background: rgba(0, 0, 0, 0.3);
		backdrop-filter: blur(10px);
		z-index: 1;
	}

	.status-left,
	.status-right {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.time-android {
		font-size: 14px;
		font-weight: 500;
		color: white;
	}

	.battery-percent {
		font-size: 12px;
		color: white;
	}

	.app-grid-android {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 16px;
		padding: 60px 16px 40px;
		z-index: 1;
		position: relative;
		flex: 1;
	}

	.app-item-android {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
	}

	.app-item-android.placeholder {
		width: 56px;
		height: 56px;
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(10px);
		border-radius: 50%;
		margin: 0 auto;
	}

	.app-item-android.courtnow {
		position: relative;
	}

	.home-app-icon-android {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	.success-pop {
		animation: successPop 0.6s ease;
	}

	@keyframes successPop {
		0% {
			transform: scale(0);
			opacity: 0;
		}
		50% {
			transform: scale(1.3);
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.app-item-android span {
		font-size: 11px;
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
		text-align: center;
	}

	.success-badge-android {
		position: absolute;
		top: -4px;
		right: -4px;
		width: 24px;
		height: 24px;
		background: #34a853;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 14px;
		font-weight: bold;
		box-shadow: 0 2px 8px rgba(52, 168, 83, 0.5);
		animation: badgePopAndroid 0.4s ease 0.3s both;
	}

	@keyframes badgePopAndroid {
		0% {
			transform: scale(0);
		}
		50% {
			transform: scale(1.3);
		}
		100% {
			transform: scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.ripple-effect,
		.slide-in,
		.slide-up-bottom,
		.success-pop,
		.badgePopAndroid,
		.highlight-pulse-android {
			animation: none;
		}
	}
</style>
