<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { markGuideAsShown } from '$lib/utils/guide-tracker';

	const dispatch = createEventDispatcher<{ close: void }>();

	let dontShowAgain = false;

	function handleClose() {
		if (dontShowAgain) {
			markGuideAsShown();
		}
		dispatch('close');
	}

	function handleStart() {
		markGuideAsShown();
		dispatch('close');
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			handleClose();
		}
	}

	const features = [
		{
			icon: '📊',
			title: '예약 통계',
			description: '시간대별/요일별 예약 패턴을 확인하고 빈 코트를 예측하세요.'
		},
		{
			icon: '☀️',
			title: '날씨 정보',
			description: '테니스 치기 좋은 날씨를 확인하고 계획을 세우세요.'
		}
	];
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="guide-overlay" on:click={handleBackdropClick} role="dialog" aria-modal="true" tabindex="-1">
	<div class="guide-panel">
		<header class="panel-header">
			<div class="header-title">
				<span class="icon">🎯</span>
				<h2>CourtNow 사용 가이드</h2>
			</div>
			<button class="close-btn" on:click={handleClose} aria-label="닫기">×</button>
		</header>

		<div class="panel-content">
			<p class="intro-text">
				CourtNow를 더 편리하게 이용할 수 있는 기능들을 소개합니다.
			</p>

			<div class="feature-list">
				{#each features as feature}
					<div class="feature-item">
						<span class="feature-icon">{feature.icon}</span>
						<div class="feature-content">
							<h3 class="feature-title">{feature.title}</h3>
							<p class="feature-description">{feature.description}</p>
						</div>
					</div>
				{/each}
			</div>

			<div class="tip-box">
				<span class="tip-icon">💡</span>
				<p>
					<strong>TIP:</strong> 상단의 <span class="highlight">통계</span> 버튼을 눌러 예약 패턴을 확인해보세요!
				</p>
			</div>
		</div>

		<footer class="panel-footer">
			<label class="checkbox-label">
				<input type="checkbox" bind:checked={dontShowAgain} />
				<span>다시 보지 않기</span>
			</label>
			<button class="start-btn" on:click={handleStart}>시작하기</button>
		</footer>
	</div>
</div>

<style>
	.guide-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--space-4);
	}

	.guide-panel {
		background: var(--color-bg-primary);
		border-radius: var(--radius-xl);
		width: 100%;
		max-width: 420px;
		max-height: 85vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		box-shadow: var(--shadow-xl);
		animation: slideUp 0.3s ease-out;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-4);
		border-bottom: 1px solid var(--color-border-light);
		background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%);
	}

	.header-title {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.header-title .icon {
		font-size: 1.5rem;
	}

	.header-title h2 {
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0;
	}

	.close-btn {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-full);
		font-size: 1.25rem;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all 0.2s;
	}

	.close-btn:hover {
		background: var(--color-bg-primary);
		border-color: var(--color-border);
	}

	.panel-content {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-4);
	}

	.intro-text {
		color: var(--color-text-secondary);
		font-size: 0.875rem;
		margin: 0 0 var(--space-4) 0;
		line-height: 1.5;
	}

	.feature-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.feature-item {
		display: flex;
		gap: var(--space-3);
		padding: var(--space-3);
		background: var(--color-bg-secondary);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border-light);
	}

	.feature-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-bg-primary);
		border-radius: var(--radius-md);
	}

	.feature-content {
		flex: 1;
		min-width: 0;
	}

	.feature-title {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0 0 var(--space-1) 0;
	}

	.feature-description {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		margin: 0;
		line-height: 1.4;
	}

	.tip-box {
		display: flex;
		gap: var(--space-2);
		margin-top: var(--space-4);
		padding: var(--space-3);
		background: rgba(245, 158, 11, 0.1);
		border: 1px solid rgba(245, 158, 11, 0.2);
		border-radius: var(--radius-md);
	}

	.tip-icon {
		font-size: 1.25rem;
		flex-shrink: 0;
	}

	.tip-box p {
		font-size: 0.8125rem;
		color: var(--color-text-primary);
		margin: 0;
		line-height: 1.5;
	}

	.highlight {
		color: var(--color-primary);
		font-weight: 600;
	}

	.panel-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-4);
		border-top: 1px solid var(--color-border-light);
		background: var(--color-bg-secondary);
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		cursor: pointer;
	}

	.checkbox-label input {
		width: 16px;
		height: 16px;
		accent-color: var(--color-primary);
		cursor: pointer;
	}

	.start-btn {
		padding: var(--space-2) var(--space-5);
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: var(--radius-md);
		font-size: 0.9375rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.start-btn:hover {
		background: var(--color-primary-hover);
		transform: translateY(-1px);
	}

	.start-btn:active {
		transform: translateY(0);
	}

	@media (max-width: 640px) {
		.guide-overlay {
			padding: 0;
			align-items: flex-end;
		}

		.guide-panel {
			max-width: 100%;
			max-height: 90vh;
			border-radius: var(--radius-xl) var(--radius-xl) 0 0;
		}

		@keyframes slideUp {
			from {
				opacity: 0;
				transform: translateY(100%);
			}
			to {
				opacity: 1;
				transform: translateY(0);
			}
		}
	}
</style>
