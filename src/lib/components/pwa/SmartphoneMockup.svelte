<script lang="ts">
	export let device: 'ios' | 'android' = 'ios';
	export let sticky: boolean = true;

	// Status bar time (iOS tradition: 9:41 AM)
	const time = device === 'ios' ? '9:41' : '14:23';
</script>

<div class="phone-mockup" class:sticky class:ios={device === 'ios'} class:android={device === 'android'}>
	<div class="phone-frame">
		<!-- Device-specific notch/camera -->
		{#if device === 'ios'}
			<div class="notch">
				<div class="notch-speaker"></div>
				<div class="notch-camera"></div>
			</div>
		{:else}
			<div class="camera-hole"></div>
		{/if}

		<!-- Physical buttons -->
		{#if device === 'ios'}
			<div class="button volume-up"></div>
			<div class="button volume-down"></div>
			<div class="button power"></div>
		{:else}
			<div class="button power android"></div>
			<div class="button volume android"></div>
		{/if}

		<!-- Phone screen -->
		<div class="phone-screen">
			<!-- Status bar -->
			<div class="status-bar">
				<div class="status-left">
					<span class="time">{time}</span>
				</div>
				<div class="status-right">
					<div class="signal-icon">
						{#if device === 'ios'}
							<!-- iOS signal bars -->
							<svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
								<circle cx="2" cy="10" r="1.5" />
								<circle cx="6" cy="8" r="1.5" />
								<circle cx="10" cy="6" r="1.5" />
								<circle cx="14" cy="4" r="1.5" />
							</svg>
						{:else}
							<!-- Android signal bars -->
							<svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
								<rect x="0" y="9" width="2" height="3" />
								<rect x="4" y="6" width="2" height="6" />
								<rect x="8" y="3" width="2" height="9" />
								<rect x="12" y="0" width="2" height="12" />
							</svg>
						{/if}
					</div>
					<div class="wifi-icon">
						<svg width="18" height="14" viewBox="0 0 18 14" fill="currentColor">
							<path
								d="M9 14a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-3.5-3.5a5 5 0 0 1 7 0M2 7a9 9 0 0 1 14 0M0 4a12 12 0 0 1 18 0"
								stroke="currentColor"
								stroke-width="2"
								fill="none"
							/>
						</svg>
					</div>
					<div class="battery-icon">
						<svg width="24" height="12" viewBox="0 0 24 12" fill="none">
							<rect
								x="1"
								y="1"
								width="18"
								height="10"
								rx="2"
								stroke="currentColor"
								stroke-width="1.5"
							/>
							<rect x="3" y="3" width="14" height="6" rx="1" fill="currentColor" />
							<rect x="20" y="4" width="2" height="4" rx="1" fill="currentColor" />
						</svg>
					</div>
				</div>
			</div>

			<!-- Content area (step visual goes here) -->
			<div class="screen-content">
				<slot />
			</div>

			<!-- Home indicator (iOS) or Navigation bar (Android) -->
			{#if device === 'ios'}
				<div class="home-indicator"></div>
			{:else}
				<div class="nav-bar">
					<button class="nav-button" aria-label="뒤로">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
							<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
						</svg>
					</button>
					<button class="nav-button" aria-label="홈">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
							<circle cx="12" cy="12" r="8" />
						</svg>
					</button>
					<button class="nav-button" aria-label="최근 앱">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
							<rect x="6" y="6" width="12" height="12" rx="2" />
						</svg>
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.phone-mockup {
		width: fit-content;
		height: fit-content;
	}

	.phone-mockup.sticky {
		position: sticky;
		top: 2rem;
		align-self: flex-start;
	}

	.phone-frame {
		position: relative;
		border-radius: 40px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), inset 0 0 0 2px rgba(255, 255, 255, 0.1);
		transition: transform 0.3s ease;
	}

	/* iOS Frame */
	.phone-mockup.ios .phone-frame {
		width: 375px;
		height: 812px;
		background: #000;
		padding: 12px;
	}

	/* Android Frame */
	.phone-mockup.android .phone-frame {
		width: 360px;
		height: 800px;
		background: #2c2c2c;
		padding: 10px;
		border-radius: 30px;
	}

	/* Notch (iOS) */
	.notch {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 200px;
		height: 30px;
		background: #000;
		border-radius: 0 0 20px 20px;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.notch-speaker {
		width: 60px;
		height: 6px;
		background: #1c1c1e;
		border-radius: 3px;
	}

	.notch-camera {
		width: 12px;
		height: 12px;
		background: #0a0a0a;
		border-radius: 50%;
		border: 1px solid #1c1c1e;
	}

	/* Camera hole (Android) */
	.camera-hole {
		position: absolute;
		top: 15px;
		left: 50%;
		transform: translateX(-50%);
		width: 12px;
		height: 12px;
		background: #000;
		border-radius: 50%;
		box-shadow: 0 0 0 2px #2c2c2c;
		z-index: 10;
	}

	/* Physical buttons */
	.button {
		position: absolute;
		background: rgba(0, 0, 0, 0.8);
		border-radius: 2px;
	}

	/* iOS buttons */
	.phone-mockup.ios .button.volume-up {
		left: -3px;
		top: 120px;
		width: 3px;
		height: 40px;
	}

	.phone-mockup.ios .button.volume-down {
		left: -3px;
		top: 170px;
		width: 3px;
		height: 40px;
	}

	.phone-mockup.ios .button.power {
		right: -3px;
		top: 180px;
		width: 3px;
		height: 60px;
	}

	/* Android buttons */
	.phone-mockup.android .button.power {
		right: -3px;
		top: 160px;
		width: 3px;
		height: 50px;
	}

	.phone-mockup.android .button.volume {
		left: -3px;
		top: 140px;
		width: 3px;
		height: 80px;
	}

	/* Phone screen */
	.phone-screen {
		width: 100%;
		height: 100%;
		background: #fff;
		border-radius: 28px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		position: relative;
	}

	/* Status bar */
	.status-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 16px;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		height: 44px;
		flex-shrink: 0;
		z-index: 5;
	}

	.phone-mockup.android .status-bar {
		padding: 12px 16px;
	}

	.status-left,
	.status-right {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.time {
		font-size: 15px;
		font-weight: 600;
		color: #000;
		font-family: -apple-system, 'SF Pro Display', system-ui, sans-serif;
	}

	.phone-mockup.android .time {
		font-family: 'Roboto', system-ui, sans-serif;
		font-size: 14px;
	}

	.signal-icon,
	.wifi-icon,
	.battery-icon {
		display: flex;
		align-items: center;
		color: #000;
	}

	/* Content area */
	.screen-content {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		background: #fff;
	}

	/* Hide scrollbar but keep functionality */
	.screen-content::-webkit-scrollbar {
		display: none;
	}

	.screen-content {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	/* Home indicator (iOS) */
	.home-indicator {
		position: absolute;
		bottom: 8px;
		left: 50%;
		transform: translateX(-50%);
		width: 120px;
		height: 5px;
		background: rgba(0, 0, 0, 0.3);
		border-radius: 3px;
	}

	/* Navigation bar (Android) */
	.nav-bar {
		display: flex;
		justify-content: space-around;
		align-items: center;
		padding: 8px 16px;
		background: rgba(255, 255, 255, 0.95);
		height: 56px;
		flex-shrink: 0;
	}

	.nav-button {
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
	}

	.nav-button:hover {
		background: rgba(0, 0, 0, 0.05);
	}

	/* Responsive */
	@media (max-width: 1023px) {
		.phone-mockup.sticky {
			position: static;
		}

		.phone-frame {
			transform: scale(0.85);
		}
	}

	@media (max-width: 767px) {
		.phone-mockup {
			/* 모바일에서도 표시하되 크기 축소 */
			display: block;
		}

		.phone-mockup.sticky {
			position: static; /* sticky 해제 */
		}

		.phone-frame {
			transform: scale(0.65);
			transform-origin: top center;
		}

		/* iOS 프레임 모바일 크기 조정 */
		.phone-mockup.ios .phone-frame {
			width: 375px;
			height: 812px;
		}

		/* Android 프레임 모바일 크기 조정 */
		.phone-mockup.android .phone-frame {
			width: 360px;
			height: 800px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.phone-frame {
			transition: none;
		}
	}
</style>
