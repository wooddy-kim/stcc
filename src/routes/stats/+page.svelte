<script lang="ts">
	import { onMount } from 'svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import PageWrapper from '$lib/components/layout/PageWrapper.svelte';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import TimeSlotHeatmap from '$lib/components/stats/TimeSlotHeatmap.svelte';
	import DayOfWeekChart from '$lib/components/stats/DayOfWeekChart.svelte';
	import StateMessage from '$lib/components/ui/StateMessage.svelte';
	import AdSenseBanner from '$lib/components/ads/AdSenseBanner.svelte';
	import { AD_SLOTS } from '$lib/config/ads';

	interface Court {
		id: number;
		name: string;
	}

	interface StatsData {
		timeSlotStats: Record<string, { total: number; available: number; availableRate: number }>;
		dayOfWeekStats: Record<string, { total: number; available: number; availableRate: number }>;
		popularTimeSlots: string[];
		leastCrowdedTimeSlots: string[];
		courtName?: string;
		period: string;
		dataRange: { from: string; to: string };
	}

	let courts: Court[] = [];
	let selectedCourtId: number | null = null;
	let selectedPeriod: 'week' | 'month' = 'week';
	let stats: StatsData | null = null;
	let loading = false;
	let error: string | null = null;

	async function fetchCourts() {
		try {
			const response = await fetch('/api/courts');
			const result = await response.json();
			if (result.success) {
				courts = result.data;
			}
		} catch (err) {
			console.error('Failed to fetch courts:', err);
		}
	}

	async function fetchStats() {
		loading = true;
		error = null;

		try {
			const params = new URLSearchParams({ period: selectedPeriod });
			if (selectedCourtId) {
				params.set('courtId', String(selectedCourtId));
			}

			const response = await fetch(`/api/stats/reservations?${params}`);
			const result = await response.json();

			if (result.success) {
				stats = result.data;
			} else {
				error = result.error || '통계를 불러오는데 실패했습니다.';
			}
		} catch (err) {
			console.error('Failed to fetch stats:', err);
			error = '통계를 불러오는데 실패했습니다.';
		} finally {
			loading = false;
		}
	}

	function formatTimeSlot(time: string): string {
		return time.slice(0, 5);
	}

	onMount(() => {
		fetchCourts();
		fetchStats();
	});

	$: {
		selectedCourtId;
		selectedPeriod;
		if (typeof window !== 'undefined') {
			fetchStats();
		}
	}
</script>

<svelte:head>
	<title>예약 통계 | CourtNow</title>
	<meta
		name="description"
		content="수도권 공공 테니스장의 시간대별, 요일별 예약 가용률 통계를 확인하세요. 예약하기 좋은 시간대를 찾아보세요."
	/>
	<link rel="canonical" href="https://courtnow.info/stats" />

	<!-- Breadcrumb Schema -->
	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			"itemListElement": [
				{
					"@type": "ListItem",
					"position": 1,
					"name": "홈",
					"item": "https://courtnow.info"
				},
				{
					"@type": "ListItem",
					"position": 2,
					"name": "예약 통계",
					"item": "https://courtnow.info/stats"
				}
			]
		}
	</script>
</svelte:head>

<PageWrapper>
	<Breadcrumb
		items={[
			{ label: '홈', href: '/' },
			{ label: '예약 통계', href: '/stats' }
		]}
	/>

	<PageHeader
		title="예약 통계"
		description="시간대별, 요일별 예약 패턴을 분석합니다"
	/>

	<!-- 1. 필터 전 (즉시 로드) -->
	<AdSenseBanner adSlot={AD_SLOTS.stats.top} variant="display" minHeight="60px" />

	<!-- 필터 섹션 -->
	<div class="filter-section">
		<div class="filter-group">
			<label for="court-select">테니스장</label>
			<select id="court-select" bind:value={selectedCourtId}>
				<option value={null}>전체</option>
				{#each courts as court}
					<option value={court.id}>{court.name}</option>
				{/each}
			</select>
		</div>

		<div class="filter-group">
			<label for="period-select">기간</label>
			<select id="period-select" bind:value={selectedPeriod}>
				<option value="week">최근 1주</option>
				<option value="month">최근 1달</option>
			</select>
		</div>
	</div>

	{#if loading}
		<StateMessage type="loading" message="통계를 불러오는 중..." />
	{:else if error}
		<StateMessage type="error" message={error} />
	{:else if stats}
		<!-- 데이터 범위 표시 -->
		<div class="data-range">
			<span class="range-label">데이터 기간:</span>
			<span class="range-value">{stats.dataRange.from} ~ {stats.dataRange.to}</span>
			{#if stats.courtName}
				<span class="court-badge">{stats.courtName}</span>
			{/if}
		</div>

		<!-- 인기/한산 시간대 배지 -->
		<div class="highlights">
			<div class="highlight-card popular">
				<h4>인기 시간대 (예약 빠름)</h4>
				<div class="time-badges">
					{#each stats.popularTimeSlots as time}
						<span class="time-badge">{formatTimeSlot(time)}</span>
					{/each}
				</div>
			</div>
			<div class="highlight-card quiet">
				<h4>한산한 시간대 (여유 있음)</h4>
				<div class="time-badges">
					{#each stats.leastCrowdedTimeSlots as time}
						<span class="time-badge">{formatTimeSlot(time)}</span>
					{/each}
				</div>
			</div>
		</div>

		<!-- 차트 섹션 -->
		<div class="charts-section">
			<TimeSlotHeatmap data={stats.timeSlotStats} />

			<!-- 2. 차트 사이 (Lazy Load) -->
			<AdSenseBanner
				adSlot={AD_SLOTS.stats.mid}
				variant="in-feed"
				lazyLoad={true}
				minHeight="50px"
			/>

			<DayOfWeekChart data={stats.dayOfWeekStats} />
		</div>
	{:else}
		<StateMessage type="empty" message="통계 데이터가 없습니다." />
	{/if}
</PageWrapper>

<style>
	.filter-section {
		display: flex;
		gap: var(--space-4);
		margin-bottom: var(--space-6);
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.filter-group label {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--color-text-secondary);
	}

	.filter-group select {
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-md);
		background: var(--color-bg-primary);
		font-size: 0.875rem;
		color: var(--color-text-primary);
		min-width: 140px;
		cursor: pointer;
	}

	.filter-group select:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.data-range {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
		font-size: 0.8125rem;
	}

	.range-label {
		color: var(--color-text-tertiary);
	}

	.range-value {
		color: var(--color-text-secondary);
	}

	.court-badge {
		padding: var(--space-1) var(--space-2);
		background: var(--color-primary);
		color: white;
		border-radius: var(--radius-sm);
		font-size: 0.75rem;
		font-weight: 500;
	}

	.highlights {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--space-4);
		margin-bottom: var(--space-6);
	}

	.highlight-card {
		padding: var(--space-4);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border-light);
	}

	.highlight-card.popular {
		background: rgba(239, 68, 68, 0.05);
		border-color: rgba(239, 68, 68, 0.2);
	}

	.highlight-card.quiet {
		background: rgba(34, 197, 94, 0.05);
		border-color: rgba(34, 197, 94, 0.2);
	}

	.highlight-card h4 {
		font-size: 0.8125rem;
		font-weight: 600;
		margin: 0 0 var(--space-3) 0;
	}

	.popular h4 {
		color: var(--color-error);
	}

	.quiet h4 {
		color: var(--color-success);
	}

	.time-badges {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.time-badge {
		padding: var(--space-2) var(--space-3);
		background: var(--color-bg-primary);
		border-radius: var(--radius-md);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.charts-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	@media (max-width: 640px) {
		.filter-section {
			flex-direction: column;
			gap: var(--space-3);
		}

		.filter-group select {
			width: 100%;
		}

		.data-range {
			flex-wrap: wrap;
		}

		.highlights {
			grid-template-columns: 1fr;
		}
	}
</style>
