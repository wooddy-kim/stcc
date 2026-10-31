<script lang="ts">
	export let currentStep: number; // 0부터 시작
	export let totalSteps: number; // 총 질문 수 (8)

	$: progress = ((currentStep + 1) / totalSteps) * 100;

	// 격려 멘트 계산
	$: encouragementMessage = (() => {
		const percentage = progress;
		if (percentage < 20) return '시작이 반입니다!';
		if (percentage < 40) return '좋은 출발이에요!';
		if (percentage < 60) return '거의 절반 넘었어요!';
		if (percentage < 80) return '이제 조금만 더!';
		if (percentage < 100) return '거의 다 왔어요!';
		return '완료!';
	})();
</script>

<div class="progress-container">
	<div class="progress-info">
		<span class="progress-text">질문 {currentStep + 1} / {totalSteps}</span>
		<span class="encouragement-text">{encouragementMessage}</span>
	</div>
	<div class="progress-bar">
		<div class="progress-fill" style="width: {progress}%"></div>
	</div>
</div>

<style>
	.progress-container {
		margin-bottom: 2rem;
	}

	.progress-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
		padding: 0 0.5rem;
	}

	.progress-text {
		font-size: 1rem;
		font-weight: 600;
		color: #10b981;
	}

	.encouragement-text {
		font-size: 0.875rem;
		font-weight: 600;
		color: #f59e0b;
		animation: fadeIn 0.5s ease-in;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-5px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.progress-bar {
		height: 16px;
		background: linear-gradient(90deg, #e5e7eb 0%, #d1d5db 100%);
		border-radius: 8px;
		overflow: hidden;
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #10b981 0%, #059669 100%);
		transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
		border-radius: 6px;
		position: relative;
		overflow: hidden;
	}

	/* Shimmer 애니메이션 */
	.progress-fill::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.3) 50%,
			transparent 100%
		);
		animation: shimmer 1.5s infinite;
	}

	@keyframes shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	@media (max-width: 768px) {
		.progress-container {
			margin-bottom: 1.5rem;
		}

		.progress-info {
			flex-direction: column;
			gap: 0.5rem;
			padding: 0;
		}

		.progress-text {
			font-size: 0.875rem;
		}

		.encouragement-text {
			font-size: 0.75rem;
		}

		.progress-bar {
			height: 14px;
		}
	}
</style>
