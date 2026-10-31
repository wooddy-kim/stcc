<script lang="ts">
	import type { PageData } from './$types';
	import { browser } from '$app/environment';
	import KakaoMap from '$lib/components/KakaoMap.svelte';

	export let data: PageData;

	const TODAY = new Date();
	TODAY.setHours(0, 0, 0, 0);

	function makeDate(offset: number) {
		const d = new Date(TODAY);
		d.setDate(d.getDate() + offset);
		return d;
	}

	// toISOString()은 UTC 기준이라 KST에서 하루 빠짐 → 로컬 날짜 사용
	function toLocalDateStr(d: Date) {
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		return `${y}-${m}-${day}`;
	}

	function formatLabel(d: Date) {
		const diff = Math.round((d.getTime() - TODAY.getTime()) / 86400000);
		if (diff === 0) return '오늘';
		if (diff === 1) return '내일';
		if (diff === 2) return '모레';
		return ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
	}

	function formatDateNum(d: Date) {
		return `${d.getMonth() + 1}/${d.getDate()}`;
	}

	// 오늘부터 다음달 말일까지
	const nextMonthEnd = new Date(TODAY.getFullYear(), TODAY.getMonth() + 2, 0);
	const totalDays = Math.round((nextMonthEnd.getTime() - TODAY.getTime()) / 86400000) + 1;
	const dates = Array.from({ length: totalDays }, (_, i) => makeDate(i));

	let selectedDateStr = toLocalDateStr(TODAY);
	let courts = data.courts;
	let loading = false;

	async function selectDate(dateStr: string) {
		if (dateStr === selectedDateStr) return;
		selectedDateStr = dateStr;
		loading = true;
		try {
			const res = await fetch(`/api/map/courts?date=${dateStr}`);
			const json = await res.json();
			if (json.success) courts = json.data;
		} catch (e) {
			console.error('날짜별 코트 조회 실패:', e);
		} finally {
			loading = false;
		}
	}

	$: availableCount = courts.filter((c) => c.availabilityStatus === 'available').length;
	$: closedCount = courts.filter((c) => c.availabilityStatus === 'closed').length;
	$: noDataCount = courts.filter((c) => c.availabilityStatus === 'no_data').length;
</script>

<svelte:head>
	<title>테니스장 지도 | 수도권 공공 테니스장 예약 현황 - CourtNow</title>
	<meta name="description" content="수도권 공공 테니스장 예약 가능 현황을 지도에서 확인하세요." />
	<link rel="canonical" href="https://courtnow.info/map" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="테니스장 지도 | CourtNow" />
	<meta property="og:description" content="수도권 공공 테니스장 예약 가능 현황을 지도에서 확인하세요." />
	<meta property="og:url" content="https://courtnow.info/map" />
	<meta property="og:site_name" content="CourtNow" />
	<meta property="og:locale" content="ko_KR" />
	<meta property="og:image" content="https://courtnow.info/og-image.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="테니스장 지도 | CourtNow" />
	<meta name="twitter:description" content="수도권 공공 테니스장 예약 가능 현황을 지도에서 확인하세요." />
	<meta name="twitter:image" content="https://courtnow.info/og-image.png" />
</svelte:head>

<div class="map-page">
	<!-- 날짜 네비게이션 -->
	<div class="date-nav">
		{#each dates as d}
			{@const str = toLocalDateStr(d)}
			{@const isSelected = str === selectedDateStr}
			{@const isSat = d.getDay() === 6}
			{@const isSun = d.getDay() === 0}
			<button
				class="date-btn"
				class:selected={isSelected}
				on:click={() => selectDate(str)}
				disabled={loading}
			>
				<span class="date-top">{formatLabel(d)}</span>
				<span class="date-num" class:sat={isSat} class:sun={isSun}>{formatDateNum(d)}</span>
			</button>
		{/each}
	</div>

	<!-- 범례 -->
	<div class="legend-bar">
		{#if loading}
			<span class="loading-text">불러오는 중...</span>
		{:else}
			<span class="legend-item available"><span class="dot"></span>예약 가능 ({availableCount})</span>
			<span class="legend-item closed"><span class="dot"></span>마감 ({closedCount})</span>
			<span class="legend-item no-data"><span class="dot"></span>정보 없음 ({noDataCount})</span>
		{/if}
	</div>

	<!-- 지도 -->
	<div class="map-wrapper" class:dimmed={loading}>
		{#if browser}
			<KakaoMap {courts} selectedDate={selectedDateStr} />
		{/if}
	</div>
</div>

<style>
	.map-page {
		display: flex;
		flex-direction: column;
		height: calc(100vh - 64px);
		height: calc(100dvh - 64px);
	}

	/* 날짜 네비게이션 */
	.date-nav {
		display: flex;
		gap: 6px;
		padding: 8px 12px;
		background: white;
		border-bottom: 1px solid #e5e7eb;
		overflow-x: auto;
		flex-shrink: 0;
		scrollbar-width: none;
	}
	.date-nav::-webkit-scrollbar { display: none; }

	.date-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding: 6px 12px;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		background: white;
		color: #374151;
		cursor: pointer;
		flex-shrink: 0;
		transition: all 0.15s;
		min-width: 52px;
	}
	.date-btn:hover:not(:disabled) {
		border-color: #10b981;
		background: #10b981;
		color: white;
	}
	.date-btn.selected {
		background: #10b981;
		border-color: #10b981;
		color: white;
	}
	.date-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.date-top {
		font-size: 12px;
		font-weight: 700;
		line-height: 1;
	}
	.date-num {
		font-size: 11px;
		color: #6b7280;
		line-height: 1;
	}
	.date-num.sat { color: #2563eb; }
	.date-num.sun { color: #dc2626; }

	.date-btn:hover:not(:disabled) .date-num,
	.date-btn.selected .date-num {
		color: rgba(255, 255, 255, 0.85);
	}

	/* 범례 */
	.legend-bar {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 6px 14px;
		background: #f9fafb;
		border-bottom: 1px solid #e5e7eb;
		font-size: 0.8125rem;
		flex-shrink: 0;
		flex-wrap: wrap;
		min-height: 34px;
	}
	.legend-item {
		display: flex;
		align-items: center;
		gap: 5px;
		color: #6b7280;
	}
	.dot {
		width: 9px;
		height: 9px;
		border-radius: 50%;
		display: inline-block;
	}
	.legend-item.available .dot { background: #16a34a; }
	.legend-item.closed .dot { background: #dc2626; }
	.legend-item.no-data .dot { background: #6b7280; }

	.loading-text {
		font-size: 0.8125rem;
		color: #9ca3af;
	}

	/* 지도 */
	.map-wrapper {
		flex: 1;
		min-height: 0;
		transition: opacity 0.2s;
	}
	.map-wrapper.dimmed {
		opacity: 0.6;
		pointer-events: none;
	}
</style>
