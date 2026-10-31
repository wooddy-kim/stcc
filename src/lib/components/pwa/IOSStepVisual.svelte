<script lang="ts">
	export let step: number = 1;
</script>

<div class="ios-visual">
	{#if step === 1}
		<!-- Step 1: Safari browser with share button highlighted -->
		<div class="safari-browser">
			<div class="url-bar">
				<div class="url-content">
					<svg class="lock-icon" width="12" height="14" viewBox="0 0 12 14" fill="currentColor">
						<path
							d="M6 0a3.5 3.5 0 0 0-3.5 3.5V5H2a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-.5V3.5A3.5 3.5 0 0 0 6 0zm0 1.5a2 2 0 0 1 2 2V5H4V3.5a2 2 0 0 1 2-2z"
						/>
					</svg>
					<span class="url-text">courtnow.info</span>
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

			<div class="safari-toolbar">
				<button class="toolbar-button">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path d="M19 12H5M12 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" />
					</svg>
				</button>
				<button class="toolbar-button">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path d="M5 12h14M12 5l7 7-7 7" stroke-width="2" stroke-linecap="round" />
					</svg>
				</button>
				<button class="toolbar-button share-button pulse">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M16.5 3h-9A1.5 1.5 0 0 0 6 4.5v1A1.5 1.5 0 0 0 7.5 7h9A1.5 1.5 0 0 0 18 5.5v-1A1.5 1.5 0 0 0 16.5 3zM12 8v11M8 12l4-4 4 4"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							fill="none"
						/>
					</svg>
				</button>
				<button class="toolbar-button">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path
							d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"
							stroke-width="2"
							stroke-linecap="round"
						/>
					</svg>
				</button>
				<button class="toolbar-button">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<rect x="3" y="3" width="7" height="7" rx="1" stroke-width="2" />
						<rect x="14" y="3" width="7" height="7" rx="1" stroke-width="2" />
						<rect x="3" y="14" width="7" height="7" rx="1" stroke-width="2" />
						<rect x="14" y="14" width="7" height="7" rx="1" stroke-width="2" />
					</svg>
				</button>
			</div>
		</div>
	{:else if step === 2}
		<!-- Step 2: Share sheet with "Add to Home Screen" option -->
		<div class="share-sheet-container">
			<div class="share-sheet slide-up">
				<div class="sheet-handle"></div>
				<div class="sheet-content">
					<div class="share-actions">
						<div class="share-action">
							<div class="action-icon airdrop">
								<svg width="32" height="32" viewBox="0 0 32 32" fill="#007aff">
									<circle cx="16" cy="10" r="4" />
									<path d="M8 20a8 8 0 0 1 16 0" />
								</svg>
							</div>
							<span>AirDrop</span>
						</div>
						<div class="share-action">
							<div class="action-icon messages">
								<svg width="32" height="32" viewBox="0 0 32 32" fill="#00c853">
									<rect x="4" y="8" width="24" height="16" rx="4" />
									<path d="M4 12l12 8 12-8" stroke="white" fill="none" stroke-width="2" />
								</svg>
							</div>
							<span>메시지</span>
						</div>
						<div class="share-action">
							<div class="action-icon mail">
								<svg width="32" height="32" viewBox="0 0 32 32" fill="#007aff">
									<rect x="4" y="8" width="24" height="16" rx="2" />
									<path d="M4 10l12 8 12-8" stroke="white" fill="none" stroke-width="2" />
								</svg>
							</div>
							<span>메일</span>
						</div>
					</div>

					<div class="divider"></div>

					<div class="sheet-options">
						<div class="sheet-option highlighted">
							<div class="option-icon">
								<svg width="28" height="28" viewBox="0 0 28 28" fill="#007aff">
									<rect x="6" y="6" width="16" height="16" rx="4" stroke-width="2" fill="none" stroke="currentColor" />
									<path d="M14 10v8M10 14h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
								</svg>
							</div>
							<div class="option-text">
								<strong>홈 화면에 추가</strong>
							</div>
							<div class="arrow-indicator">→</div>
						</div>

						<div class="sheet-option">
							<div class="option-icon">
								<svg width="28" height="28" viewBox="0 0 28 28" fill="#007aff">
									<path d="M19 21l-7-5-7 5V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14z" stroke="currentColor" stroke-width="2" fill="none" />
								</svg>
							</div>
							<div class="option-text">
								<strong>북마크 추가</strong>
							</div>
						</div>

						<div class="sheet-option">
							<div class="option-icon">
								<svg width="28" height="28" viewBox="0 0 28 28" fill="#007aff">
									<circle cx="14" cy="14" r="9" stroke="currentColor" stroke-width="2" fill="none" />
									<path d="M14 10v4l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
								</svg>
							</div>
							<div class="option-text">
								<strong>읽기 목록에 추가</strong>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	{:else if step === 3}
		<!-- Step 3: Add to Home Screen confirmation dialog -->
		<div class="dialog-container">
			<div class="add-dialog fade-in">
				<div class="dialog-header">
					<h3>홈 화면에 추가</h3>
				</div>
				<div class="dialog-content">
					<div class="app-preview">
						<img src="/app-icon.svg" class="app-icon" alt="CourtNow" />
						<div class="app-info">
							<input type="text" value="CourtNow" class="app-name-input" readonly />
							<span class="app-url">courtnow.info</span>
						</div>
					</div>
				</div>
				<div class="dialog-actions">
					<button class="dialog-button cancel">취소</button>
					<button class="dialog-button confirm">추가</button>
				</div>
			</div>
		</div>
	{:else if step === 4}
		<!-- Step 4: Home screen with CourtNow app installed -->
		<div class="home-screen">
			<div class="wallpaper"></div>
			<div class="app-grid">
				<!-- Row 1 -->
				<div class="app-item placeholder"></div>
				<div class="app-item courtnow">
					<img src="/app-icon.svg" class="home-app-icon success-bounce" alt="CourtNow" />
					<span>CourtNow</span>
					<div class="success-badge">✓</div>
				</div>
				<div class="app-item placeholder"></div>
				<div class="app-item placeholder"></div>

				<!-- Row 2 -->
				<div class="app-item placeholder"></div>
				<div class="app-item placeholder"></div>
				<div class="app-item placeholder"></div>
				<div class="app-item placeholder"></div>

				<!-- Row 3 -->
				<div class="app-item placeholder"></div>
				<div class="app-item placeholder"></div>
				<div class="app-item placeholder"></div>
				<div class="app-item placeholder"></div>

				<!-- Row 4 -->
				<div class="app-item placeholder"></div>
				<div class="app-item placeholder"></div>
				<div class="app-item placeholder"></div>
				<div class="app-item placeholder"></div>
			</div>

			<div class="page-dots">
				<div class="dot active"></div>
				<div class="dot"></div>
				<div class="dot"></div>
			</div>

			<div class="dock">
				<div class="dock-app"></div>
				<div class="dock-app"></div>
				<div class="dock-app"></div>
				<div class="dock-app"></div>
			</div>
		</div>
	{/if}
</div>

<style>
	.ios-visual {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		background: #fff;
		position: relative;
	}

	/* Step 1: Safari Browser */
	.safari-browser {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.url-bar {
		padding: 8px 12px;
		background: #f6f6f6;
	}

	.url-content {
		display: flex;
		align-items: center;
		gap: 8px;
		background: white;
		padding: 8px 12px;
		border-radius: 10px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.lock-icon {
		color: #8e8e93;
	}

	.url-text {
		font-size: 14px;
		color: #1c1c1e;
	}

	.browser-content {
		flex: 1;
		overflow-y: auto;
		padding: 2rem 1rem;
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
		color: #1c1c1e;
	}

	.page-content p {
		font-size: 0.875rem;
		color: #8e8e93;
		margin: 0;
	}

	.safari-toolbar {
		display: flex;
		justify-content: space-around;
		align-items: center;
		padding: 8px 16px 12px;
		background: rgba(246, 246, 246, 0.98);
		backdrop-filter: blur(20px);
		border-top: 0.5px solid rgba(0, 0, 0, 0.1);
	}

	.toolbar-button {
		background: none;
		border: none;
		color: #007aff;
		cursor: pointer;
		padding: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		transition: background 0.2s;
	}

	.toolbar-button:hover {
		background: rgba(0, 122, 255, 0.1);
	}

	.share-button {
		position: relative;
	}

	.pulse {
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
			box-shadow: 0 0 0 0 rgba(0, 122, 255, 0.7);
		}
		50% {
			opacity: 0.8;
			transform: scale(1.1);
			box-shadow: 0 0 0 10px rgba(0, 122, 255, 0);
		}
	}

	/* Step 2: Share Sheet */
	.share-sheet-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
		position: relative;
	}

	.share-sheet {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: white;
		border-radius: 20px 20px 0 0;
		max-height: 90%;
		overflow: hidden;
		box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
	}

	.slide-up {
		animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}

	.sheet-handle {
		width: 36px;
		height: 5px;
		background: #d1d1d6;
		border-radius: 3px;
		margin: 8px auto;
	}

	.sheet-content {
		padding: 16px;
	}

	.share-actions {
		display: flex;
		gap: 16px;
		overflow-x: auto;
		padding-bottom: 16px;
	}

	.share-action {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		min-width: 70px;
	}

	.action-icon {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f2f2f7;
	}

	.share-action span {
		font-size: 12px;
		color: #1c1c1e;
		text-align: center;
	}

	.divider {
		height: 1px;
		background: #e5e5ea;
		margin: 8px 0;
	}

	.sheet-options {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.sheet-option {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px;
		border-radius: 10px;
		cursor: pointer;
		transition: background 0.2s;
	}

	.sheet-option:hover {
		background: #f2f2f7;
	}

	.sheet-option.highlighted {
		background: #e3f2fd;
		border: 2px solid #007aff;
		position: relative;
		animation: highlight-pulse 2s infinite;
	}

	@keyframes highlight-pulse {
		0%,
		100% {
			border-color: #007aff;
			background: #e3f2fd;
		}
		50% {
			border-color: #0051d5;
			background: #bbdefb;
		}
	}

	.option-icon {
		width: 28px;
		height: 28px;
		flex-shrink: 0;
	}

	.option-text {
		flex: 1;
		font-size: 15px;
		color: #1c1c1e;
	}

	.arrow-indicator {
		color: #007aff;
		font-size: 18px;
		font-weight: bold;
	}

	/* Step 3: Add Dialog */
	.dialog-container {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		background: rgba(0, 0, 0, 0.4);
	}

	.add-dialog {
		background: white;
		border-radius: 14px;
		width: 280px;
		overflow: hidden;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
	}

	.fade-in {
		animation: fadeIn 0.3s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: scale(0.9);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.dialog-header {
		padding: 16px;
		text-align: center;
		border-bottom: 0.5px solid #e5e5ea;
	}

	.dialog-header h3 {
		margin: 0;
		font-size: 17px;
		font-weight: 600;
		color: #1c1c1e;
	}

	.dialog-content {
		padding: 20px;
	}

	.app-preview {
		display: flex;
		gap: 12px;
		align-items: center;
	}

	.app-icon {
		width: 60px;
		height: 60px;
		border-radius: 13px;
		flex-shrink: 0;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.app-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.app-name-input {
		font-size: 15px;
		font-weight: 600;
		color: #1c1c1e;
		border: none;
		background: #f2f2f7;
		padding: 6px 8px;
		border-radius: 6px;
	}

	.app-url {
		font-size: 13px;
		color: #8e8e93;
	}

	.dialog-actions {
		display: flex;
		border-top: 0.5px solid #e5e5ea;
	}

	.dialog-button {
		flex: 1;
		padding: 12px;
		background: none;
		border: none;
		font-size: 17px;
		cursor: pointer;
		transition: background 0.2s;
	}

	.dialog-button:first-child {
		border-right: 0.5px solid #e5e5ea;
		color: #8e8e93;
	}

	.dialog-button:hover {
		background: #f2f2f7;
	}

	.dialog-button.confirm {
		color: #007aff;
		font-weight: 600;
	}

	/* Step 4: Home Screen */
	.home-screen {
		display: flex;
		flex-direction: column;
		height: 100%;
		position: relative;
		overflow: hidden;
	}

	.wallpaper {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		z-index: 0;
	}

	.app-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 20px;
		padding: 80px 24px 40px;
		z-index: 1;
		position: relative;
	}

	.app-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
	}

	.app-item.placeholder {
		width: 60px;
		height: 60px;
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(10px);
		border-radius: 13px;
		margin: 0 auto;
	}

	.app-item.courtnow {
		position: relative;
	}

	.home-app-icon {
		width: 60px;
		height: 60px;
		border-radius: 13px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	.success-bounce {
		animation: successBounce 0.6s ease;
	}

	@keyframes successBounce {
		0% {
			transform: scale(0);
			opacity: 0;
		}
		50% {
			transform: scale(1.2);
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.app-item span {
		font-size: 11px;
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
	}

	.success-badge {
		position: absolute;
		top: -4px;
		right: -4px;
		width: 24px;
		height: 24px;
		background: #34c759;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 14px;
		font-weight: bold;
		box-shadow: 0 2px 8px rgba(52, 199, 89, 0.5);
		animation: badgePop 0.4s ease 0.3s both;
	}

	@keyframes badgePop {
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

	.page-dots {
		display: flex;
		gap: 6px;
		justify-content: center;
		padding: 12px;
		z-index: 1;
		position: relative;
	}

	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.4);
		transition: all 0.3s;
	}

	.dot.active {
		width: 20px;
		border-radius: 3px;
		background: white;
	}

	.dock {
		position: absolute;
		bottom: 8px;
		left: 24px;
		right: 24px;
		display: flex;
		gap: 20px;
		justify-content: center;
		padding: 12px 16px;
		background: rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(30px);
		border-radius: 20px;
		z-index: 1;
	}

	.dock-app {
		width: 60px;
		height: 60px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 13px;
	}

	@media (prefers-reduced-motion: reduce) {
		.pulse,
		.slide-up,
		.fade-in,
		.success-bounce,
		.badgePop,
		.highlight-pulse {
			animation: none;
		}
	}
</style>
