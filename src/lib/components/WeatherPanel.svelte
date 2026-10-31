<script lang="ts">
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { getWeatherIcon, type WeatherData } from '$lib/utils/weather';

	const dispatch = createEventDispatcher<{ close: void }>();

	export let region: string = 'SUWON';

	interface ForecastDay {
		date: string;
		dateLabel: string;
		forecasts: WeatherData[];
		avgScore: number;
		bestTime: WeatherData | null;
	}

	let loading = true;
	let error: string | null = null;
	let regionName = '';
	let forecastDays: ForecastDay[] = [];

	const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

	function formatDateLabel(dateStr: string): string {
		const date = new Date(dateStr);
		const month = date.getMonth() + 1;
		const day = date.getDate();
		const dayOfWeek = DAY_LABELS[date.getDay()];
		const isToday = new Date().toDateString() === date.toDateString();
		const isTomorrow =
			new Date(Date.now() + 86400000).toDateString() === date.toDateString();

		if (isToday) return `오늘 (${dayOfWeek})`;
		if (isTomorrow) return `내일 (${dayOfWeek})`;
		return `${month}/${day} (${dayOfWeek})`;
	}

	function getConditionColor(condition: WeatherData['condition']): string {
		switch (condition) {
			case 'excellent':
				return 'var(--color-success)';
			case 'good':
				return 'var(--color-primary)';
			case 'fair':
				return 'var(--color-warning)';
			case 'poor':
				return 'var(--color-error)';
		}
	}

	function getConditionBg(condition: WeatherData['condition']): string {
		switch (condition) {
			case 'excellent':
				return 'rgba(34, 197, 94, 0.1)';
			case 'good':
				return 'rgba(59, 130, 246, 0.1)';
			case 'fair':
				return 'rgba(245, 158, 11, 0.1)';
			case 'poor':
				return 'rgba(239, 68, 68, 0.1)';
		}
	}

	async function fetchWeather() {
		loading = true;
		error = null;

		try {
			const response = await fetch(`/api/weather?region=${region}`);
			const result = await response.json();

			if (!result.success) {
				throw new Error(result.error || 'Failed to fetch weather');
			}

			regionName = result.data.region;
			const forecasts: WeatherData[] = result.data.forecasts;

			// 날짜별로 그룹화
			const dayMap = new Map<string, WeatherData[]>();
			for (const forecast of forecasts) {
				if (!dayMap.has(forecast.date)) {
					dayMap.set(forecast.date, []);
				}
				dayMap.get(forecast.date)!.push(forecast);
			}

			// ForecastDay 배열 생성
			forecastDays = Array.from(dayMap.entries())
				.map(([date, dayForecasts]) => {
					const avgScore = Math.round(
						dayForecasts.reduce((sum, f) => sum + f.tennisScore, 0) / dayForecasts.length
					);
					const bestTime = dayForecasts.reduce(
						(best, f) => (f.tennisScore > (best?.tennisScore || 0) ? f : best),
						null as WeatherData | null
					);

					return {
						date,
						dateLabel: formatDateLabel(date),
						forecasts: dayForecasts,
						avgScore,
						bestTime
					};
				})
				.slice(0, 3); // 최대 3일
		} catch (err) {
			console.error('Weather fetch error:', err);
			error = err instanceof Error ? err.message : '날씨 정보를 불러오지 못했습니다';
		} finally {
			loading = false;
		}
	}

	function handleClose() {
		dispatch('close');
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			handleClose();
		}
	}

	onMount(() => {
		fetchWeather();
	});
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="weather-overlay" on:click={handleBackdropClick} role="dialog" aria-modal="true">
	<div class="weather-panel">
		<header class="panel-header">
			<div class="header-title">
				<span class="icon">🌤️</span>
				<h2>테니스 날씨</h2>
				{#if regionName}
					<span class="region-badge">{regionName}</span>
				{/if}
			</div>
			<button class="close-btn" on:click={handleClose} aria-label="닫기">×</button>
		</header>

		<div class="panel-content">
			{#if loading}
				<div class="loading-state">
					<div class="spinner"></div>
					<p>날씨 정보를 불러오는 중...</p>
				</div>
			{:else if error}
				<div class="error-state">
					<p>⚠️ {error}</p>
					<button class="retry-btn" on:click={fetchWeather}>다시 시도</button>
				</div>
			{:else}
				<div class="forecast-list">
					{#each forecastDays as day}
						<div class="forecast-day">
							<div class="day-header">
								<span class="date-label">{day.dateLabel}</span>
								<span
									class="avg-score"
									style="color: {getConditionColor(day.bestTime?.condition || 'fair')}"
								>
									평균 {day.avgScore}점
								</span>
							</div>

							<div class="time-slots">
								{#each day.forecasts as forecast}
									<div
										class="time-slot"
										style="background: {getConditionBg(forecast.condition)}"
									>
										<div class="slot-time">{forecast.time.slice(0, 5)}</div>
										<div class="slot-icon">{getWeatherIcon(forecast)}</div>
										<div class="slot-temp">{Math.round(forecast.temperature)}°</div>
										<div
											class="slot-score"
											style="color: {getConditionColor(forecast.condition)}"
										>
											{forecast.tennisScore}
										</div>
									</div>
								{/each}
							</div>

							{#if day.bestTime}
								<div class="best-time">
									<span class="best-label">추천 시간</span>
									<span class="best-value">
										{day.bestTime.time.slice(0, 5)} ({day.bestTime.tennisScore}점)
									</span>
								</div>
							{/if}
						</div>
					{/each}
				</div>

				<div class="legend">
					<h4>테니스 적합도</h4>
					<div class="legend-items">
						<span class="legend-item">
							<span class="dot" style="background: var(--color-success)"></span>
							80+ 최적
						</span>
						<span class="legend-item">
							<span class="dot" style="background: var(--color-primary)"></span>
							60-79 좋음
						</span>
						<span class="legend-item">
							<span class="dot" style="background: var(--color-warning)"></span>
							40-59 보통
						</span>
						<span class="legend-item">
							<span class="dot" style="background: var(--color-error)"></span>
							0-39 비추천
						</span>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.weather-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--space-4);
	}

	.weather-panel {
		background: var(--color-bg-primary);
		border-radius: var(--radius-xl);
		width: 100%;
		max-width: 400px;
		max-height: 80vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		box-shadow: var(--shadow-xl);
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-4);
		border-bottom: 1px solid var(--color-border-light);
		background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%);
	}

	.header-title {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.header-title .icon {
		font-size: 1.5rem;
	}

	.header-title h2 {
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0;
	}

	.region-badge {
		padding: var(--space-1) var(--space-2);
		background: var(--color-primary);
		color: white;
		border-radius: var(--radius-sm);
		font-size: 0.6875rem;
		font-weight: 600;
	}

	.close-btn {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-full);
		font-size: 1.25rem;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all 0.2s;
	}

	.close-btn:hover {
		background: var(--color-bg-primary);
		border-color: var(--color-border);
	}

	.panel-content {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-4);
	}

	.loading-state,
	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-8);
		gap: var(--space-3);
		text-align: center;
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--color-border-light);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error-state p {
		color: var(--color-text-secondary);
	}

	.retry-btn {
		padding: var(--space-2) var(--space-4);
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: var(--radius-md);
		font-size: 0.875rem;
		cursor: pointer;
	}

	.forecast-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.forecast-day {
		background: var(--color-bg-secondary);
		border-radius: var(--radius-lg);
		padding: var(--space-3);
	}

	.day-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-3);
	}

	.date-label {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.avg-score {
		font-size: 0.8125rem;
		font-weight: 700;
	}

	.time-slots {
		display: flex;
		gap: var(--space-2);
		overflow-x: auto;
		padding-bottom: var(--space-2);
		margin-bottom: var(--space-2);
	}

	.time-slot {
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding: var(--space-2);
		border-radius: var(--radius-md);
		min-width: 50px;
	}

	.slot-time {
		font-size: 0.6875rem;
		color: var(--color-text-tertiary);
	}

	.slot-icon {
		font-size: 1.25rem;
	}

	.slot-temp {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.slot-score {
		font-size: 0.6875rem;
		font-weight: 700;
	}

	.best-time {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding-top: var(--space-2);
		border-top: 1px solid var(--color-border-light);
	}

	.best-label {
		font-size: 0.6875rem;
		color: var(--color-success);
		font-weight: 600;
	}

	.best-value {
		font-size: 0.8125rem;
		color: var(--color-text-primary);
	}

	.legend {
		margin-top: var(--space-4);
		padding: var(--space-3);
		background: var(--color-bg-secondary);
		border-radius: var(--radius-md);
	}

	.legend h4 {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-tertiary);
		margin: 0 0 var(--space-2) 0;
	}

	.legend-items {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		font-size: 0.6875rem;
		color: var(--color-text-secondary);
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	@media (max-width: 640px) {
		.weather-overlay {
			padding: 0;
			align-items: flex-end;
		}

		.weather-panel {
			max-width: 100%;
			max-height: 85vh;
			border-radius: var(--radius-xl) var(--radius-xl) 0 0;
		}
	}
</style>
