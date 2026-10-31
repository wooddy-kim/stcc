<script lang="ts">
	export let title: string;
	export let description: string;
	export let imageUrl: string;
	export let linkUrl: string;
	export let size: 'small' | 'medium' | 'large' | 'icon-only' = 'medium';
	export let variant: 'default' | 'outline' = 'default';

	function shareToKakao() {
		if (!window.Kakao) {
			console.warn('Kakao SDK not loaded');
			alert('카카오톡 공유 기능을 사용할 수 없습니다.');
			return;
		}

		if (!window.Kakao.isInitialized()) {
			console.warn('Kakao SDK not initialized');
			return;
		}

		try {
			window.Kakao.Share.sendDefault({
				objectType: 'feed',
				content: {
					title,
					description,
					imageUrl,
					link: {
						mobileWebUrl: linkUrl,
						webUrl: linkUrl
					}
				},
				buttons: [
					{
						title: '자세히 보기',
						link: {
							mobileWebUrl: linkUrl,
							webUrl: linkUrl
						}
					}
				]
			});
		} catch (error) {
			console.error('Kakao share failed:', error);
			alert('공유 중 오류가 발생했습니다.');
		}
	}
</script>

<button
	class="kakao-share-btn"
	class:size-small={size === 'small'}
	class:size-medium={size === 'medium'}
	class:size-large={size === 'large'}
	class:variant-default={variant === 'default'}
	class:variant-outline={variant === 'outline'}
	class:size-icon-only={size === 'icon-only'}
	on:click={shareToKakao}
	aria-label="카카오톡으로 공유하기"
>
	<!-- Kakao chat bubble icon SVG -->
	<svg class="icon" viewBox="0 0 24 24" fill="currentColor">
		<path
			d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.8 6.7-.3 1.1-1.2 4.1-1.2 4.3 0 .2.1.3.3.2.1 0 4.5-3 5.2-3.5.6.1 1.3.1 1.9.1 5.5 0 10-3.6 10-8S17.5 3 12 3z"
		/>
	</svg>
	{#if size !== 'icon-only'}
		<span class="label">공유</span>
	{/if}
</button>

<style>
	.kakao-share-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.variant-default {
		background-color: #fee500; /* Kakao brand yellow */
		color: #3c1e1e;
	}

	.variant-default:hover {
		background-color: #fada0a;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(254, 229, 0, 0.4);
	}

	.variant-outline {
		background-color: transparent;
		border: 2px solid #fee500;
		color: #fee500;
	}

	.variant-outline:hover {
		background-color: rgba(254, 229, 0, 0.1);
		transform: translateY(-2px);
	}

	.size-small {
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
	}

	.size-medium {
		padding: 0.75rem 1.5rem;
		font-size: 0.9375rem;
	}

	.size-large {
		padding: 1rem 2rem;
		font-size: 1rem;
	}

	.size-icon-only {
		padding: 0.5rem;
		background-color: rgba(255, 255, 255, 0.8);
		border: 1px solid #e0e0e0;
		border-radius: 50%;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		gap: 0;
	}

	.size-icon-only .icon {
		width: 20px;
		height: 20px;
	}

	.size-icon-only.variant-default {
		background-color: #fee500;
		border: none;
	}

	.size-icon-only.variant-outline {
		background-color: white;
		border: 1px solid #e0e0e0;
	}

	.icon {
		width: 18px;
		height: 18px;
		flex-shrink: 0;
	}

	@media (max-width: 640px) {
		.kakao-share-btn:not(.size-icon-only) {
			flex: 1;
			justify-content: center;
		}
	}
</style>
