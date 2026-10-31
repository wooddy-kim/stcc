<script lang="ts">
	export let data: Record<string, { total: number; available: number; availableRate: number }>;

	interface SlotInfo {
		time: string;
		label: string;
		availableRate: number;
		available: number;
		total: number;
	}

	// 시간대 정렬 및 라벨링
	$: sortedSlots = Object.entries(data || {})
		.sort((a, b) => a[0].localeCompare(b[0]))
		.map(([time, stat]): SlotInfo => ({
			time,
			label: `${time.slice(0, 5)}`,
			availableRate: stat?.availableRate ?? 0,
			available: stat?.available ?? 0,
			total: stat?.total ?? 0
		}));

	// 가용률에 따른 색상 계산
	function getColor(rate: number): string {
		if (rate >= 70) return 'var(--color-success)';
		if (rate >= 40) return 'var(--color-warning)';
		if (rate >= 20) return 'var(--color-orange)';
		return 'var(--color-error)';
	}

	function getBackgroundColor(rate: number): string {
		if (rate >= 70) return 'rgba(34, 197, 94, 0.15)';
		if (rate >= 40) return 'rgba(234, 179, 8, 0.15)';
		if (rate >= 20) return 'rgba(249, 115, 22, 0.15)';
		return 'rgba(239, 68, 68, 0.15)';
	}
</script>

<div class="heatmap-container">
	<h3 class="section-title">시간대별 예약 가용률</h3>
	<p class="section-desc">높을수록 예약하기 쉬운 시간대입니다</p>

	<div class="heatmap-grid">
		{#each sortedSlots as slot}
			<div
				class="slot-cell"
				style="--bg-color: {getBackgroundColor(slot.availableRate)}; --border-color: {getColor(slot.availableRate)}"
			>
				<span class="time-label">{slot.label}</span>
				<span class="rate" style="color: {getColor(slot.availableRate)}">
					{slot.availableRate}%
				</span>
				<span class="count">{slot.available}/{slot.total}</span>
			</div>
		{/each}
	</div>

	<!-- 범례 -->
	<div class="legend">
		<div class="legend-item">
			<span class="legend-dot" style="background: var(--color-success)"></span>
			<span>여유 (70%+)</span>
		</div>
		<div class="legend-item">
			<span class="legend-dot" style="background: var(--color-warning)"></span>
			<span>보통 (40-70%)</span>
		</div>
		<div class="legend-item">
			<span class="legend-dot" style="background: var(--color-orange)"></span>
			<span>혼잡 (20-40%)</span>
		</div>
		<div class="legend-item">
			<span class="legend-dot" style="background: var(--color-error)"></span>
			<span>매우 혼잡 (20%-)</span>
		</div>
	</div>
</div>

<style>
	.heatmap-container {
		background: var(--color-bg-primary);
		border-radius: var(--radius-lg);
		padding: var(--space-5);
		border: 1px solid var(--color-border-light);
	}

	.section-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0 0 var(--space-1) 0;
	}

	.section-desc {
		font-size: 0.8125rem;
		color: var(--color-text-tertiary);
		margin: 0 0 var(--space-4) 0;
	}

	.heatmap-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
		gap: var(--space-2);
	}

	.slot-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-3);
		background: var(--bg-color);
		border: 1px solid var(--border-color);
		border-radius: var(--radius-md);
		transition: all 0.2s;
	}

	.slot-cell:hover {
		transform: scale(1.02);
		box-shadow: var(--shadow-sm);
	}

	.time-label {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-text-secondary);
	}

	.rate {
		font-size: 1.125rem;
		font-weight: 700;
		margin: var(--space-1) 0;
	}

	.count {
		font-size: 0.6875rem;
		color: var(--color-text-tertiary);
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
		margin-top: var(--space-4);
		padding-top: var(--space-4);
		border-top: 1px solid var(--color-border-light);
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.legend-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
	}

	@media (max-width: 640px) {
		.heatmap-container {
			padding: var(--space-4);
		}

		.heatmap-grid {
			grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
			gap: var(--space-1);
		}

		.slot-cell {
			padding: var(--space-2);
		}

		.rate {
			font-size: 1rem;
		}

		.legend {
			gap: var(--space-3);
		}
	}
</style>
