<script lang="ts">
	interface GatewayCard {
		id: string;
		title: string;
		description: string;
		href: string;
		iconColor: string;
		iconBg: string;
		external?: boolean;
	}

	interface TipContent {
		title: string;
		slug: string;
		category: string;
		difficulty: string;
	}

	const staticCards: GatewayCard[] = [
		{
			id: 'glossary',
			title: '테니스 용어 사전',
			description: '테니스 용어를 배워보세요',
			href: '/glossary',
			iconColor: '#059669',
			iconBg: '#ecfdf5'
		},
		{
			id: 'stats',
			title: '예약 통계',
			description: '언제 예약이 잘 될까?',
			href: '/stats',
			iconColor: '#d97706',
			iconBg: '#fffbeb'
		},
		{
			id: 'match-point',
			title: '매치포인트',
			description: '같이 칠 파트너 찾기',
			href: 'https://match-point.courtnow.info/',
			iconColor: '#0284c7',
			iconBg: '#f0f9ff',
			external: true
		}
	];

	/** 서버 load에서 내려온 팁 목록. 첫 항목을 카드로 만든다. */
	export let tips: TipContent[] = [];

	let currentIndex = 0;

	$: cards = tips.length > 0
		? [
				...staticCards,
				{
					id: 'tip',
					title: tips[0].title,
					description: `${tips[0].category} · ${tips[0].difficulty}`,
					href: `/content/${tips[0].slug}`,
					iconColor: '#7c3aed',
					iconBg: '#f5f3ff'
				} satisfies GatewayCard
			]
		: [...staticCards];

	function scrollLeft() {
		if (currentIndex > 0) currentIndex--;
	}

	function scrollRight() {
		if (currentIndex < cards.length - 3) currentIndex++;
	}

	function handleKeydown(e: KeyboardEvent, href: string, external = false) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			if (external) {
				window.open(href, '_blank', 'noopener,noreferrer');
			} else {
				window.location.href = href;
			}
		}
	}
</script>

<div class="gateway-container">
	<div class="gateway-header">
		<h3>더 알아보기</h3>
		<div class="nav-buttons">
			<button class="nav-btn" on:click={scrollLeft} disabled={currentIndex === 0} aria-label="이전">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg
				>
			</button>
			<button
				class="nav-btn"
				on:click={scrollRight}
				disabled={currentIndex >= cards.length - 3}
				aria-label="다음"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg
				>
			</button>
		</div>
	</div>

	<div class="cards-viewport">
		<div class="cards-track" style="transform: translateX(-{currentIndex * (176 + 12)}px)">
			{#each cards as card (card.id)}
				<a
					class="gateway-card"
					href={card.href}
					target={card.external ? '_blank' : undefined}
					rel={card.external ? 'noopener noreferrer' : undefined}
					tabindex="0"
					on:keydown={(e) => handleKeydown(e, card.href, card.external)}
				>
					<div class="card-icon-wrap" style="background: {card.iconBg}; color: {card.iconColor}">
						{#if card.id === 'glossary'}
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
								><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path
									d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
								/></svg
							>
						{:else if card.id === 'stats'}
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
								><line x1="18" y1="20" x2="18" y2="10" /><line
									x1="12"
									y1="20"
									x2="12"
									y2="4"
								/><line x1="6" y1="20" x2="6" y2="14" /></svg
							>
						{:else if card.id === 'match-point'}
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
								><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle
									cx="9"
									cy="7"
									r="4"
								/><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg
							>
						{:else}
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
								><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line
									x1="12"
									y1="16"
									x2="12.01"
									y2="16"
								/></svg
							>
						{/if}
					</div>
					<div class="card-content">
						<span class="card-title">{card.title}</span>
						<span class="card-desc">{card.description}</span>
					</div>
					<svg
						class="card-arrow"
						xmlns="http://www.w3.org/2000/svg"
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg
					>
				</a>
			{/each}
		</div>
	</div>
</div>

<style>
	.gateway-container {
		margin: var(--space-6) 0;
	}

	.gateway-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-3);
	}

	.gateway-header h3 {
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		color: var(--color-text-secondary);
		margin: 0;
		letter-spacing: 0.02em;
	}

	.nav-buttons {
		display: flex;
		gap: var(--space-1);
	}

	.nav-btn {
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-md);
		cursor: pointer;
		color: var(--color-text-tertiary);
		transition: all var(--transition-fast);
	}

	.nav-btn:hover:not(:disabled) {
		border-color: var(--color-primary-300);
		color: var(--color-primary-600);
		background: var(--color-primary-50);
	}

	.nav-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.cards-viewport {
		overflow: hidden;
	}

	.cards-track {
		display: flex;
		gap: 12px;
		transition: transform 0.3s ease;
	}

	.gateway-card {
		flex-shrink: 0;
		width: 176px;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-4);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-xl);
		cursor: pointer;
		transition: all var(--transition-base);
		color: inherit;
		text-decoration: none;
		box-shadow: var(--shadow-sm);
	}

	.gateway-card:hover {
		border-color: var(--color-primary-300);
		box-shadow: var(--shadow-primary-sm);
		transform: translateY(-2px);
		color: inherit;
	}

	.gateway-card:focus {
		outline: 2px solid var(--color-primary-400);
		outline-offset: 2px;
	}

	.card-icon-wrap {
		width: 40px;
		height: 40px;
		border-radius: var(--radius-lg);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.card-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.card-title {
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		color: var(--color-text-primary);
		line-height: 1.35;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card-desc {
		font-size: var(--text-xs);
		color: var(--color-text-tertiary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.card-arrow {
		color: var(--color-gray-300);
		align-self: flex-end;
		flex-shrink: 0;
		transition: color var(--transition-fast);
	}

	.gateway-card:hover .card-arrow {
		color: var(--color-primary-400);
	}

	@media (max-width: 768px) {
		.nav-buttons {
			display: none;
		}

		.cards-viewport {
			overflow-x: auto;
			scrollbar-width: none;
			-ms-overflow-style: none;
			-webkit-overflow-scrolling: touch;
			margin: 0 calc(-1 * var(--space-4));
			padding: 0 var(--space-4);
			padding-right: var(--space-8);
		}

		.cards-viewport::-webkit-scrollbar {
			display: none;
		}

		.cards-track {
			transform: none !important;
		}

		.gateway-card {
			width: 152px;
		}
	}

	@media (max-width: 640px) {
		.gateway-container {
			margin: var(--space-4) 0;
		}

		.gateway-card {
			width: 140px;
			padding: var(--space-3);
			gap: var(--space-2);
		}

		.card-icon-wrap {
			width: 36px;
			height: 36px;
		}
	}
</style>
