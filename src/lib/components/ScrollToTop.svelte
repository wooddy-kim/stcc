<script lang="ts">
	import { onMount } from 'svelte';

	let showButton = false;
	const scrollThreshold = 300; // 300px 이상 스크롤하면 버튼 표시

	function handleScroll() {
		showButton = window.scrollY > scrollThreshold;
	}

	function scrollToTop() {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	}

	onMount(() => {
		window.addEventListener('scroll', handleScroll);
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

{#if showButton}
	<button
		class="scroll-to-top"
		on:click={scrollToTop}
		aria-label="페이지 상단으로 이동"
		title="맨 위로"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<polyline points="18 15 12 9 6 15" />
		</svg>
	</button>
{/if}

<style>
	.scroll-to-top {
		position: fixed;
		bottom: 1.5rem; /* 24px from bottom */
		right: 1.5rem; /* 24px from right */
		width: 3rem; /* 48px */
		height: 3rem; /* 48px */
		border-radius: 50%;
		background-color: white; /* White background */
		color: #2563eb; /* Brand blue color */
		border: 1px solid #f1f5f9; /* Light gray border */
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); /* Soft shadow */
		transition: all 0.3s ease;
		z-index: 1000;
		animation: fadeIn 0.3s ease;
	}

	.scroll-to-top:hover {
		background-color: #f8fafc; /* Very light gray on hover */
		transform: translateY(-0.25rem); /* Subtle upward movement */
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
	}

	.scroll-to-top:active {
		transform: translateY(0);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* 모바일 반응형 */
	@media (max-width: 768px) {
		.scroll-to-top {
			bottom: 1.5rem;
			right: 1.5rem;
			width: 3rem;
			height: 3rem;
		}
	}
</style>
