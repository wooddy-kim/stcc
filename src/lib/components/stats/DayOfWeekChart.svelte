<script lang="ts">
	export let data: Record<string, { total: number; available: number; availableRate: number }>;

	const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
	const DAY_LABELS: Record<string, string> = {
		sun: '일',
		mon: '월',
		tue: '화',
		wed: '수',
		thu: '목',
		fri: '금',
		sat: '토'
	};

	interface DayInfo {
		day: string;
		label: string;
		availableRate: number;
		available: number;
		total: number;
		isWeekend: boolean;
	}

	$: sortedDays = DAY_ORDER.map((day): DayInfo => {
		const stat = data?.[day] || { total: 0, available: 0, availableRate: 0 };
		return {
			day,
			label: DAY_LABELS[day],
			availableRate: stat.availableRate ?? 0,
			available: stat.available ?? 0,
			total: stat.total ?? 0,
			isWeekend: day === 'sat' || day === 'sun'
		};
	});

	$: maxRate = Math.max(...sortedDays.map((d) => d.availableRate || 0), 1);

	function getBarColor(day: DayInfo): string {
		if (day.isWeekend) return 'var(--color-primary-500)';
		return 'var(--color-primary-300)';
	}
</script>

<div class="chart-container">
	<h3 class="section-title">요일별 예약 가용률</h3>
	<p class="section-desc">평일과 주말의 예약 패턴을 비교해보세요</p>

	<div class="chart">
		{#each sortedDays as day}
			<div class="bar-wrapper">
				<div class="bar-info">
					<span class="day-label" class:weekend={day.isWeekend}>{day.label}</span>
					<span class="rate-value">{day.availableRate}%</span>
				</div>
				<div class="bar-track">
					{#if day.availableRate > 0}
						<div
							class="bar-fill"
							style="width: {(day.availableRate / maxRate) * 100}%; background: {getBarColor(day)}"
						></div>
					{/if}
				</div>
				<span class="count-label">{day.available}/{day.total}</span>
			</div>
		{/each}
	</div>

	<!-- 요약 -->
	{#if sortedDays.length > 0}
		{@const weekdayAvg =
			sortedDays
				.filter((d) => !d.isWeekend)
				.reduce((sum, d) => sum + d.availableRate, 0) / 5}
		{@const weekendAvg =
			sortedDays
				.filter((d) => d.isWeekend)
				.reduce((sum, d) => sum + d.availableRate, 0) / 2}

		<div class="summary">
			<div class="summary-item">
				<span class="summary-label">평일 평균</span>
				<span class="summary-value">{weekdayAvg.toFixed(1)}%</span>
			</div>
			<div class="summary-item">
				<span class="summary-label">주말 평균</span>
				<span class="summary-value weekend">{weekendAvg.toFixed(1)}%</span>
			</div>
		</div>
	{/if}
</div>

<style>
	.chart-container {
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

	.chart {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.bar-wrapper {
		display: grid;
		grid-template-columns: 80px 1fr 60px;
		align-items: center;
		gap: var(--space-3);
	}

	.bar-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.day-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-secondary);
	}

	.day-label.weekend {
		color: var(--color-primary-600);
		font-weight: 600;
	}

	.rate-value {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.bar-track {
		height: 24px;
		background: var(--color-bg-secondary);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.bar-fill {
		height: 100%;
		border-radius: var(--radius-md);
		transition: width 0.3s ease;
		min-width: 8px;
	}

	.count-label {
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
		text-align: right;
	}

	.summary {
		display: flex;
		gap: var(--space-6);
		margin-top: var(--space-4);
		padding-top: var(--space-4);
		border-top: 1px solid var(--color-border-light);
	}

	.summary-item {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.summary-label {
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
	}

	.summary-value {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.summary-value.weekend {
		color: var(--color-primary-600);
	}

	@media (max-width: 640px) {
		.chart-container {
			padding: var(--space-4);
		}

		.bar-wrapper {
			grid-template-columns: 70px 1fr 50px;
			gap: var(--space-2);
		}

		.day-label {
			font-size: 0.8125rem;
		}

		.bar-track {
			height: 20px;
		}

		.summary {
			gap: var(--space-4);
		}
	}
</style>
