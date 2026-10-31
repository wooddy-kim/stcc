<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	// Props
	export let messages: string[] = []; // 각 페이지에서 주입
	export let duration: number = 2800;
	export let particleCount: number = 20;

	// Particle interface
	interface Particle {
		id: number;
		x: number;
		y: number;
		size: number;
		delay: number;
		duration: number;
		color: string;
	}

	// Message state
	let currentMessageIndex = 0;
	let intervalId: number;
	let displayedMessages: string[] = [];

	// Particle state
	let particles: Particle[] = [];

	// Particle colors
	const particleColors = ['#84cc16', '#10b981', '#3b82f6']; // lime, emerald, blue

	// Detect mobile for reduced particle count
	let isMobile = false;

	onMount(() => {
		// Detect mobile
		isMobile = window.innerWidth < 768;
		const count = isMobile ? 15 : particleCount;

		// Generate particles
		particles = Array.from({ length: count }, (_, i) => ({
			id: i,
			x: (Math.random() - 0.5) * 400,
			y: (Math.random() - 0.5) * 400,
			size: (isMobile ? 3 : 4) + Math.random() * (isMobile ? 5 : 8),
			delay: Math.random() * 1000,
			duration: 2000 + Math.random() * 2000,
			color: particleColors[Math.floor(Math.random() * particleColors.length)]
		}));

		// Message rotation
		if (messages.length > 0) {
			const shuffled = [...messages].sort(() => Math.random() - 0.5);
			displayedMessages = shuffled.slice(0, Math.min(4, messages.length));

			intervalId = window.setInterval(() => {
				currentMessageIndex = (currentMessageIndex + 1) % displayedMessages.length;
			}, 700);
		}
	});

	onDestroy(() => {
		if (intervalId) {
			window.clearInterval(intervalId);
		}
	});
</script>

<div
	class="fullscreen-overlay"
	role="alert"
	aria-busy="true"
	aria-label="분석 중입니다. 잠시만 기다려주세요."
	transition:fade={{ duration: 300, easing: cubicOut }}
>
	<div class="background-blur">
		<div class="content-center">
			<!-- Particles -->
			<div class="particles-container" aria-hidden="true">
				{#each particles as particle (particle.id)}
					<div
						class="particle"
						style="
							--x: {particle.x}px;
							--y: {particle.y}px;
							--size: {particle.size}px;
							--delay: {particle.delay}ms;
							--duration: {particle.duration}ms;
							--color: {particle.color};
						"
					/>
				{/each}
			</div>

			<!-- Loading Content -->
			<div class="loading-content">
				<!-- Tennis Ball -->
				<div class="relative flex justify-center items-center">
					<div
						class="tennis-ball bg-lime-500 rounded-full shadow-[inset_-5px_-5px_15px_rgba(0,0,0,0.2)] relative overflow-hidden border-2 border-lime-300 animate-[spin_2s_linear_infinite]"
					>
						<div class="tennis-seam"></div>
						<div class="tennis-seam rotate-90"></div>
					</div>

					<div
						class="absolute -bottom-6 w-20 h-3 bg-gray-400/40 rounded-[50%] blur-md animate-pulse"
					></div>
				</div>

				<!-- Progress Bar -->
				<div class="progress-container">
					<div class="progress-bar">
						<div class="progress-fill" />
					</div>
				</div>

				<!-- Message -->
				{#if displayedMessages.length > 0}
					<div class="message-container">
						<p
							class="loading-message"
							class:tip-message={displayedMessages[currentMessageIndex]?.startsWith('💡')}
						>
							{displayedMessages[currentMessageIndex]}
						</p>
					</div>
				{/if}

				<!-- Screen Reader Only -->
				<div class="sr-only" aria-live="polite">
					{displayedMessages[currentMessageIndex] || '분석 중...'}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* Fullscreen Overlay */
	.fullscreen-overlay {
		position: fixed;
		inset: 0;
		z-index: 9999;
		overflow: hidden;
	}

	/* Background Blur with Fallback */
	.background-blur {
		width: 100%;
		height: 100%;
		backdrop-filter: blur(10px) saturate(180%);
		-webkit-backdrop-filter: blur(10px) saturate(180%);
		background: rgba(0, 0, 0, 0.6);
	}

	@supports not (backdrop-filter: blur(10px)) {
		.background-blur {
			background: rgba(0, 0, 0, 0.8);
		}
	}

	/* Center Content */
	.content-center {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	/* Particles Container */
	.particles-container {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
		z-index: 2;
	}

	/* Individual Particle */
	.particle {
		position: absolute;
		top: 50%;
		left: 50%;
		width: var(--size);
		height: var(--size);
		background: var(--color);
		border-radius: 50%;
		opacity: 0;
		animation:
			float-outward var(--duration) var(--delay) ease-out infinite,
			pulse-opacity 2s ease-in-out infinite;
		will-change: transform, opacity;
		transform: translateZ(0);
	}

	@keyframes float-outward {
		0% {
			transform: translate(0, 0) scale(0.3);
			opacity: 0;
		}
		20% {
			opacity: 0.6;
		}
		100% {
			transform: translate(var(--x), var(--y)) scale(1.5);
			opacity: 0;
		}
	}

	@keyframes pulse-opacity {
		0%,
		100% {
			opacity: 0.3;
		}
		50% {
			opacity: 0.7;
		}
	}

	/* Loading Content */
	.loading-content {
		position: relative;
		z-index: 3;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		padding: 2rem;
	}

	/* Tennis Ball */
	.tennis-ball {
		width: 96px;
		height: 96px;
		will-change: transform;
		transform: translateZ(0);
	}

	/* Tennis Seam */
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
		border: 3px solid rgba(255, 255, 255, 0.9);
		width: 100%;
		height: 100%;
		border-radius: 50%;
		box-sizing: border-box;
	}

	.tennis-seam::before {
		top: -65%;
	}

	.tennis-seam::after {
		bottom: -65%;
	}

	/* Progress Bar */
	.progress-container {
		width: 100%;
		max-width: 400px;
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
		animation: progress var(--duration, 2800ms) linear forwards;
		will-change: transform;
		transform: translateZ(0);
	}

	@keyframes progress {
		0% {
			width: 0%;
		}
		100% {
			width: 100%;
		}
	}

	/* Message */
	.message-container {
		text-align: center;
		min-height: 2rem;
	}

	.loading-message {
		font-size: 1.125rem;
		font-weight: 600;
		color: #ffffff;
		margin: 0;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}

	.tip-message {
		color: #fbbf24;
		font-size: 1rem;
	}

	/* Screen Reader Only */
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}

	/* Reduced Motion Support */
	@media (prefers-reduced-motion: reduce) {
		.particle {
			animation: none;
			display: none;
		}

		.tennis-ball {
			animation: spin 4s linear infinite;
		}

		* {
			animation-duration: 0.01ms !important;
			transition-duration: 0.01ms !important;
		}
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.tennis-ball {
			width: 64px;
			height: 64px;
		}

		.loading-message {
			font-size: 1rem;
		}

		.tip-message {
			font-size: 0.875rem;
		}

		.progress-container {
			max-width: 80%;
		}

		.particle {
			--size: calc(var(--size) * 0.7);
		}
	}

	/* Tablet Responsive */
	@media (min-width: 768px) and (max-width: 1024px) {
		.tennis-ball {
			width: 80px;
			height: 80px;
		}

		.progress-container {
			max-width: 70%;
		}
	}
</style>
