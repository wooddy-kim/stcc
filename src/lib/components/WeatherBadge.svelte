<script lang="ts">
	import { getWeatherIcon, type WeatherData } from '$lib/utils/weather';

	export let weather: Partial<WeatherData> | null = null;
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let showScore: boolean = true;
	export let showDescription: boolean = false;

	function getConditionColor(condition: WeatherData['condition'] | undefined): string {
		switch (condition) {
			case 'excellent':
				return 'var(--color-success)';
			case 'good':
				return 'var(--color-primary)';
			case 'fair':
				return 'var(--color-warning)';
			case 'poor':
				return 'var(--color-error)';
			default:
				return 'var(--color-text-secondary)';
		}
	}

	function getConditionLabel(condition: WeatherData['condition'] | undefined): string {
		switch (condition) {
			case 'excellent':
				return '최적';
			case 'good':
				return '좋음';
			case 'fair':
				return '보통';
			case 'poor':
				return '비추천';
			default:
				return '';
		}
	}

	$: icon = weather ? getWeatherIcon(weather) : '🌤️';
	$: conditionColor = getConditionColor(weather?.condition);
	$: conditionLabel = getConditionLabel(weather?.condition);
</script>

{#if weather}
	<div class="weather-badge size-{size}">
		<span class="weather-icon">{icon}</span>

		{#if weather.temperature !== undefined}
			<span class="temperature">{Math.round(weather.temperature)}°</span>
		{/if}

		{#if showScore && weather.tennisScore !== undefined}
			<span class="score" style="color: {conditionColor}">
				{weather.tennisScore}점
			</span>
		{/if}

		{#if showDescription && weather.description}
			<span class="description">{weather.description}</span>
		{/if}
	</div>
{/if}

<style>
	.weather-badge {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-1) var(--space-2);
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-md);
		white-space: nowrap;
	}

	.weather-icon {
		line-height: 1;
	}

	.temperature {
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.score {
		font-weight: 700;
		font-size: 0.875em;
	}

	.description {
		font-size: 0.75em;
		color: var(--color-text-tertiary);
	}

	/* Size variants */
	.size-sm {
		font-size: 0.75rem;
		padding: 2px var(--space-1);
		gap: 2px;
	}

	.size-sm .weather-icon {
		font-size: 0.875rem;
	}

	.size-md {
		font-size: 0.8125rem;
	}

	.size-md .weather-icon {
		font-size: 1rem;
	}

	.size-lg {
		font-size: 0.9375rem;
		padding: var(--space-2) var(--space-3);
		gap: var(--space-2);
	}

	.size-lg .weather-icon {
		font-size: 1.25rem;
	}
</style>
