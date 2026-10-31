<script lang="ts">
	import KakaoShareButton from '$lib/components/KakaoShareButton.svelte';
	import FavoriteButton from '$lib/components/FavoriteButton.svelte';

	export let title: string;
	export let imageUrl: string | null;
	export let address: string | null;
	export let totalCourts: number | null;
	export let naverMapUrl: string | null;
	export let reservationUrl: string | null;
	export let courtId: number | null = null;

	function openUrl(url: string) {
		window.open(url, '_blank', 'noopener,noreferrer');
	}
</script>

{#if imageUrl}
	<div class="hero-image">
		<img src={imageUrl} alt={title} loading="eager" />
	</div>
{/if}

<div class="hero">
	<div class="hero-content">
		<div class="title-section">
			<div class="title-wrapper">
				<h1 class="title">{title}</h1>
				{#if totalCourts}
					<span class="badge">코트 {totalCourts}개</span>
				{/if}
			</div>
			<!-- Kakao Share Button moved to top right -->
			<div class="share-button-container">
				{#if courtId !== null}
					<FavoriteButton {courtId} />
				{/if}
				<KakaoShareButton
					title={title}
					description={`${title} - ${address || ''}. ${totalCourts}개 코트 운영 중`}
					imageUrl={imageUrl || 'https://courtnow.info/og-image.png'}
					linkUrl={typeof window !== 'undefined' ? window.location.href : 'https://courtnow.info'}
					size="icon-only"
					variant="outline"
				/>
			</div>
		</div>

		{#if address}
			<p class="address">
				<svg
					class="icon"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path>
					<circle cx="12" cy="10" r="3"></circle>
				</svg>
				{address}
			</p>
		{/if}

		<div class="actions">
			<a href={courtId ? '#timetable' : '/'} class="action-btn tertiary">
				<svg
					class="btn-icon"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
					<line x1="16" y1="2" x2="16" y2="6"></line>
					<line x1="8" y1="2" x2="8" y2="6"></line>
					<line x1="3" y1="10" x2="21" y2="10"></line>
					<polyline points="9 16 11 18 15 14"></polyline>
				</svg>
				예약 현황
			</a>

			{#if naverMapUrl}
				<button class="action-btn secondary" on:click={() => openUrl(naverMapUrl)}>
					<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path
							d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<circle
							cx="12"
							cy="10"
							r="3"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					지도 보기
				</button>
			{/if}

			{#if reservationUrl}
				<button class="action-btn secondary" on:click={() => openUrl(reservationUrl)}>
					<svg
						class="btn-icon"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
						<line x1="16" y1="2" x2="16" y2="6"></line>
						<line x1="8" y1="2" x2="8" y2="6"></line>
						<line x1="3" y1="10" x2="21" y2="10"></line>
					</svg>
					예약하기
				</button>
			{/if}
		</div>
	</div>
</div>

<style>
	.hero {
		background: white;
		color: #333;
		padding: 1.5rem 1rem;
		border-radius: 16px;
		margin-bottom: 1.5rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		border: 1px solid #eee;
	}

	.hero-content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.title-section {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		position: relative;
	}

	.title-wrapper {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-right: 5rem;
	}

	.title {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0;
		line-height: 1.3;
		color: #1a1a1a;
	}

	.share-button-container {
		flex-shrink: 0;
		position: absolute;
		top: 0;
		right: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.address {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9375rem;
		color: #666;
		margin: 0;
	}

	.icon {
		width: 18px;
		height: 18px;
		flex-shrink: 0;
		color: #666;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		padding: 0.25rem 0.75rem;
		background-color: #f5f5f5;
		border-radius: 20px;
		font-size: 0.75rem;
		font-weight: 500;
		color: #666;
	}

	.actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-top: 0.5rem;
	}

	.action-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		border: 1px solid #e0e0e0;
		border-radius: 12px;
		font-size: 0.9375rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		background: white;
		color: #333;
		flex: 1;
		justify-content: center;
	}

	.action-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
	}

	.action-btn.secondary {
		background: #f8f9fa;
		border-color: #e9ecef;
		color: #495057;
	}

	.action-btn.primary {
		background: #4361ee;
		border-color: #3a56e4;
		color: white;
	}

	.action-btn.primary:hover {
		background: #3a56e4;
		border-color: #304cd9;
		box-shadow: 0 2px 8px rgba(67, 97, 238, 0.2);
	}

	.action-btn.tertiary {
		background: transparent;
		border: 2px solid #4361ee;
		color: #4361ee;
		text-decoration: none;
	}

	.action-btn.tertiary:hover {
		background: rgba(67, 97, 238, 0.05);
		border-color: #3a56e4;
		color: #3a56e4;
	}

	.btn-icon {
		width: 16px;
		height: 16px;
	}

	.hero-image {
		width: 100%;
		height: 200px;
		border-radius: 12px;
		overflow: hidden;
		margin-bottom: 1rem;
	}

	.hero-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	@media (min-width: 768px) {
		.hero {
			padding: 2rem;
			margin-bottom: 2rem;
		}

		.title {
			font-size: 1.75rem;
		}

		.hero-image {
			height: 300px;
			margin-bottom: 1.5rem;
		}

		.action-btn {
			flex: none;
		}
	}

	@media (max-width: 640px) {
		.hero {
			padding: 1.25rem 1rem;
			margin-bottom: 1.25rem;
		}

		.title-section {
			flex-direction: row;
			align-items: flex-start;
		}

		.title {
			font-size: 1.25rem;
		}

		.share-button-container {
			align-self: flex-start;
			margin-top: 0;
		}

		.address {
			font-size: 0.875rem;
		}

		.hero-image {
			height: 180px;
		}

		.action-btn {
			padding: 0.625rem 1rem;
			font-size: 0.875rem;
		}
	}
</style>
