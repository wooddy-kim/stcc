<script lang="ts">
	// Props for dynamic banner configuration
	export let bannerId: number;
	export let trackingCode: string = 'AF7466917';
	export let width: number = 680;
	export let height: number = 140;
	export let subId: string = '';
	export let tsource: string = '';
	export let template: string = 'carousel';

	$: iframeSrc = `https://ads-partners.coupang.com/widgets.html?id=${bannerId}&template=${template}&trackingCode=${trackingCode}&subId=${subId}&width=${width}&height=${height}&tsource=${tsource}`;
</script>

<div class="coupang-container">
	<div class="ad-label">파트너스 활동으로 일정액의 수수료를 제공받을 수 있습니다</div>
	<div class="ad-content">
		<iframe
			src={iframeSrc}
			{width}
			{height}
			frameborder="0"
			scrolling="no"
			referrerpolicy="unsafe-url"
			title="쿠팡 파트너스 광고"
			class="coupang-iframe"
		></iframe>
	</div>
</div>

<style>
	.coupang-container {
		margin: 1.5rem 0;
		padding: 1rem;
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		overflow: hidden;
	}

	.ad-label {
		font-size: 0.6875rem;
		color: #9ca3af;
		text-align: center;
		line-height: 1.4;
	}

	.ad-content {
		width: 100%;
		max-width: 680px;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.coupang-iframe {
		max-width: 100%;
		border: none;
	}

	@media (max-width: 768px) {
		.coupang-container {
			margin: 1rem 0;
			padding: 0.75rem;
		}

		.ad-label {
			font-size: 0.625rem;
		}

		.ad-content {
			max-width: 100%;
		}

		.coupang-iframe {
			width: 100%;
			height: auto;
			min-height: 120px;
		}
	}

	@media (max-width: 480px) {
		.coupang-container {
			margin: 0.75rem 0;
			padding: 0.5rem;
		}

		.ad-label {
			font-size: 0.5625rem;
		}

		.coupang-iframe {
			min-height: 100px;
		}
	}
</style>
