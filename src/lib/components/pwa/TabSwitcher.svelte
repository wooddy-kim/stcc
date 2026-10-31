<script lang="ts">
	export let activeTab: 'ios' | 'android' = 'ios';
	export let onTabChange: (tab: 'ios' | 'android') => void;

	function handleTabClick(tab: 'ios' | 'android') {
		onTabChange(tab);
	}

	function handleKeyDown(event: KeyboardEvent, tab: 'ios' | 'android') {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onTabChange(tab);
		} else if (event.key === 'ArrowLeft') {
			event.preventDefault();
			onTabChange('ios');
		} else if (event.key === 'ArrowRight') {
			event.preventDefault();
			onTabChange('android');
		}
	}
</script>

<div class="tab-switcher" role="tablist" aria-label="플랫폼 선택">
	<button
		role="tab"
		aria-selected={activeTab === 'ios'}
		aria-controls="ios-panel"
		tabindex={activeTab === 'ios' ? 0 : -1}
		class="tab-button"
		class:active={activeTab === 'ios'}
		on:click={() => handleTabClick('ios')}
		on:keydown={(e) => handleKeyDown(e, 'ios')}
	>
		<div class="tab-icon">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="currentColor"
			>
				<path
					d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
				/>
			</svg>
		</div>
		<span>iOS</span>
	</button>

	<button
		role="tab"
		aria-selected={activeTab === 'android'}
		aria-controls="android-panel"
		tabindex={activeTab === 'android' ? 0 : -1}
		class="tab-button"
		class:active={activeTab === 'android'}
		on:click={() => handleTabClick('android')}
		on:keydown={(e) => handleKeyDown(e, 'android')}
	>
		<div class="tab-icon">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="currentColor"
			>
				<path
					d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85a.637.637 0 0 0-.83.22l-1.88 3.24a11.43 11.43 0 0 0-8.94 0L5.65 5.67a.643.643 0 0 0-.87-.2c-.28.18-.37.54-.22.83L6.4 9.48A10.81 10.81 0 0 0 1 18h22a10.81 10.81 0 0 0-5.4-8.52zM7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z"
				/>
			</svg>
		</div>
		<span>Android</span>
	</button>

	<div class="tab-indicator" class:ios={activeTab === 'ios'} class:android={activeTab === 'android'} />
</div>

<style>
	.tab-switcher {
		position: relative;
		display: inline-flex;
		gap: 8px;
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 8px;
		margin: 2rem 0;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.tab-button {
		position: relative;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 24px;
		background: transparent;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 500;
		color: #64748b;
		cursor: pointer;
		transition: all 0.2s ease;
		z-index: 1;
	}

	.tab-button:hover {
		background: #f8fafc;
		color: #475569;
	}

	.tab-button:focus-visible {
		outline: 2px solid #007aff;
		outline-offset: 2px;
	}

	.tab-button.active {
		color: #1e293b;
		font-weight: 600;
	}

	.tab-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
	}

	.tab-button.active .tab-icon {
		color: #007aff;
	}

	.tab-button:nth-child(2).active .tab-icon {
		color: #4285f4;
	}

	.tab-indicator {
		position: absolute;
		bottom: 8px;
		left: 8px;
		height: 4px;
		background: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
		border-radius: 2px;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		z-index: 2;
	}

	.tab-indicator.ios {
		width: calc(50% - 12px);
		transform: translateX(0);
	}

	.tab-indicator.android {
		width: calc(50% - 12px);
		transform: translateX(calc(100% + 8px));
		background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);
	}

	@media (max-width: 640px) {
		.tab-switcher {
			display: flex;
			width: 100%;
			gap: 8px;
		}

		.tab-button {
			flex: 1;
			justify-content: center;
			padding: 10px 16px;
		}

		/* 모바일에서 인디케이터 정확한 위치 - transform 대신 left 직접 계산 */
		.tab-indicator {
			transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1),
				background 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		}

		.tab-indicator.ios {
			left: 8px;
			width: calc(50% - 12px);
			transform: none;
		}

		.tab-indicator.android {
			left: calc(50% + 4px);
			width: calc(50% - 12px);
			transform: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.tab-button,
		.tab-indicator {
			transition: none;
		}
	}
</style>
