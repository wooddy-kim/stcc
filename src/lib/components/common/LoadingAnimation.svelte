<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	// Props
	export let messages: string[] = [];

	// Animation state
	let currentMessageIndex = 0;
	let intervalId: number;
	let displayedMessages: string[] = [];

	// 기본 메시지 배열 (props로 전달되지 않으면 사용)
	const defaultMessages = [
		'플레이 스타일 분석 중...',
		'라켓 강성 계산 중...',
		'무게 분포 분석 중...',
		'최적의 라켓 매칭 중...',

		// 추가 테니스 팁 메시지
		'💡 라켓 무게가 300g 이상이면 초보자에게 무거울 수 있어요!',
		'💡 헤드 사이즈가 클수록 스위트 스팟이 넓어요',
		'💡 탑스핀은 공이 코트에 빨리 떨어져 안전합니다',
		'💡 경도가 높을수록 파워가 좋지만 팔에 부담이 됩니다',
		'💡 스트링 텐션은 낮을수록 파워, 높을수록 컨트롤에 유리해요',
		'💡 파워 라켓은 스윙이 느린 초보자에게 적합해요',
		'💡 컨트롤 라켓은 스윙이 빠른 상급자에게 권장됩니다',
		'💡 편안한 라켓은 팔꿈치 통증 예방에 도움이 됩니다',
		'💡 그립 사이즈는 검지가 딱 들어가는 크기가 적당해요',
		'💡 라켓 밸런스는 헤드 헤비, 이븐, 헤드 라이트로 구분돼요',
		'💡 폴리 스트링은 내구성이 좋지만 경직도가 높아요',
		'💡 멀티필라멘트 스트링은 팔에 부담이 적어요',
		'💡 정기적인 스트링 교체가 성능 유지에 중요해요',
		'💡 라켓은 시즌마다 약간씩 스펙이 변경될 수 있어요',
		'💡 같은 모델이라도 개별 편차가 있을 수 있습니다',
		'💡 구매 전에 실제로 라켓을 쥐어보는 게 중요해요'
	];

	// Initialize the animation
	onMount(() => {
		// props로 전달된 메시지가 있으면 사용, 없으면 기본 메시지 사용
		const messagesToUse = messages.length > 0 ? messages : defaultMessages;

		// 메시지 셔플 후 4개만 선택
		const shuffled = [...messagesToUse].sort(() => Math.random() - 0.5);
		displayedMessages = shuffled.slice(0, 4);

		intervalId = window.setInterval(() => {
			currentMessageIndex = (currentMessageIndex + 1) % displayedMessages.length;
		}, 700);
	});

	// Clean up the interval
	onDestroy(() => {
		if (intervalId) {
			window.clearInterval(intervalId);
		}
	});
</script>

<div class="loading-container">
	<div class="flex flex-col items-center justify-center space-y-8">
		<div class="relative flex justify-center items-center">
			<div class="w-24 h-24 bg-lime-500 rounded-full shadow-[inset_-5px_-5px_15px_rgba(0,0,0,0.2)] relative overflow-hidden border-2 border-lime-300 animate-[spin_2s_linear_infinite]">
				<div class="tennis-seam"></div>
				<div class="tennis-seam rotate-90"></div>
			</div>

			<div class="absolute -bottom-6 w-20 h-3 bg-gray-400/40 rounded-[50%] blur-md animate-pulse"></div>
		</div>

		<div class="progress-container">
			<div class="progress-bar">
				<div class="progress-fill" />
			</div>
		</div>

		<div class="message-container">
			<p
				class="loading-message"
				class:tip-message={displayedMessages[currentMessageIndex]?.startsWith('💡')}
			>
				{displayedMessages[currentMessageIndex] || '분석 중...'}
			</p>
		</div>
	</div>
</div>

<style>
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: 100%;
		padding: 2rem;
	}

	/* 테니스공의 흰색 곡선 솔기를 표현하는 CSS */
	.tennis-seam {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
	}

	.tennis-seam::before,
	.tennis-seam::after {
		content: '';
		position: absolute;
		/* 솔기 색상 및 두께 설정 */
		border: 3px solid rgba(255, 255, 255, 0.9);
		width: 100%;
		height: 100%;
		border-radius: 50%;
		/* 둥글게 만듦 */
		box-sizing: border-box;
	}

	/* 위쪽 솔기 위치 조정 */
	.tennis-seam::before {
		top: -65%;
		/* 공의 위쪽 바깥으로 밀어내어 곡선만 보이게 함 */
	}

	/* 아래쪽 솔기 위치 조정 */
	.tennis-seam::after {
		bottom: -65%;
		/* 공의 아래쪽 바깥으로 밀어내어 곡선만 보이게 함 */
	}

	.progress-container {
		width: 100%;
		max-width: 400px;
		margin-bottom: 1rem;
	}

	.progress-bar {
		height: 12px;
		background: #e5e7eb;
		border-radius: 6px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		width: 100%;
		background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
		border-radius: 6px;
		animation: progress 2.8s linear forwards;
	}

	.message-container {
		text-align: center;
		min-height: 2rem;
	}

	.loading-message {
		font-size: 1.125rem;
		font-weight: 600;
		color: #3b82f6;
		margin: 0;
	}

	.tip-message {
		color: #f59e0b;
		font-size: 1rem;
		font-weight: 600;
	}

	@keyframes progress {
		0% {
			width: 0%;
		}
		100% {
			width: 100%;
		}
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.loading-message {
			font-size: 1rem;
		}
	}
</style>