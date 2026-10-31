<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { browser } from '$app/environment';

	const dispatch = createEventDispatcher<{ openWeather: void }>();

	export let region: string = 'SUWON';

	interface WeatherSummary {
		temperature: number;
		sky: number;
		precipitation: number;
		windSpeed: number;
	}

	let summary: WeatherSummary | null = null;
	let loading = true;

	function getWeatherEmoji(sky: number, precipitation: number): string {
		if (precipitation === 1 || precipitation === 4) return '🌧️';
		if (precipitation === 2) return '🌨️';
		if (precipitation === 3) return '❄️';
		if (sky === 1) return '☀️';
		if (sky === 3) return '⛅';
		return '☁️';
	}

	function getTennisMessage(s: WeatherSummary): string {
		const { temperature: t, precipitation: p, windSpeed: w } = s;

		// 강수 우선
		if (p === 3) return '눈이 내려요 ❄️ 코트가 미끄러울 수 있으니 안전에 주의하세요';
		if (p === 2) return '진눈깨비 예보예요 — 코트 상태 미리 확인하세요';
		if (p === 1) return '비가 내려요 ☔ 실내 연습이나 다른 날을 추천해요';
		if (p === 4) return '소나기 주의 🌦️ 경기 전 예보를 한 번 더 확인하세요';

		// 강풍
		if (w >= 7) return `${t}°C · 바람이 꽤 강해요 💨 서브 토스 낮추고 발리 타이밍 주의하세요`;
		if (w >= 4) return `${t}°C · 바람이 조금 있어요 — 토스 높이를 낮추는 게 좋아요`;

		// 기온
		if (t >= 33) return `${t}°C · 매우 더워요 🥵 자주 그늘에서 쉬고 수분 꼭 챙기세요`;
		if (t >= 28) return `${t}°C · 무더운 날씨예요 ☀️ 이른 아침이나 저녁 시간대를 추천해요`;
		if (t >= 22) return `${t}°C · 야외 테니스 치기 좋은 날씨예요 🎾`;
		if (t >= 16) return `${t}°C · 선선하고 쾌적해요 — 움직이기 딱 좋은 날이에요`;
		if (t >= 10) return `${t}°C · 조금 서늘해요 — 충분히 워밍업하고 시작하세요`;
		if (t >= 4)  return `${t}°C · 쌀쌀해요 🧥 겉옷 꼭 챙겨가세요`;
		return `${t}°C · 많이 춥습니다 🥶 방한 장갑과 두꺼운 옷은 필수예요`;
	}

	$: bannerText = summary
		? `${getWeatherEmoji(summary.sky, summary.precipitation)} ${getTennisMessage(summary)}`
		: '날씨 정보 불러오는 중...';

	async function fetchWeather() {
		loading = true;
		try {
			const res = await fetch(`/api/weather?region=${region}`);
			const json = await res.json();
			const forecasts = json?.data?.forecasts;
			if (forecasts && forecasts.length > 0) {
				const now = new Date();
				const nowHour = now.getHours();
				// date 형식: "YYYY-MM-DD", time 형식: "HH:MM"
				const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
				const todayForecasts = forecasts.filter((f: { date: string }) => f.date === todayStr);
				const forecast = todayForecasts.find((f: { time: string }) => {
					const h = parseInt(f.time.split(':')[0]);
					return h >= nowHour;
				}) || todayForecasts[0] || forecasts[0];
				if (forecast) {
					summary = {
						temperature: forecast.temperature,
						sky: forecast.sky,
						precipitation: forecast.precipitation,
						windSpeed: forecast.windSpeed ?? 0
					};
				}
			}
		} catch {
			// silently fail
		} finally {
			loading = false;
		}
	}

	$: if (browser && region) {
		fetchWeather();
	}
</script>

{#if !loading && summary}
	<button
		class="weather-banner"
		on:click={() => dispatch('openWeather')}
		aria-label="날씨 상세 보기"
	>
		<div class="marquee-track">
			<span class="marquee-text">{bannerText}&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;{bannerText}&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;{bannerText}</span>
		</div>
		<span class="banner-arrow">›</span>
	</button>
{/if}

<style>
	.weather-banner {
		display: flex;
		align-items: center;
		overflow: hidden;
		height: 34px;
		background: linear-gradient(90deg, var(--color-primary-50) 0%, var(--color-primary-100) 100%);
		border-top: 1px solid var(--color-primary-200);
		border-radius: 0 0 var(--radius-lg) var(--radius-lg);
		cursor: pointer;
		width: 100%;
		padding: 0;
		border-left: none;
		border-right: none;
		border-bottom: none;
		transition: background 0.2s;
		position: relative;
	}

	.weather-banner:hover {
		background: linear-gradient(90deg, var(--color-primary-100) 0%, var(--color-primary-150, var(--color-primary-200)) 100%);
	}

	.marquee-track {
		flex: 1;
		overflow: hidden;
		white-space: nowrap;
	}

	.marquee-text {
		display: inline-block;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--color-primary-700);
		padding-left: var(--space-4);
		animation: marquee 18s linear infinite;
	}

	@keyframes marquee {
		0% { transform: translateX(0%); }
		100% { transform: translateX(-33.33%); }
	}

	.banner-arrow {
		flex-shrink: 0;
		font-size: 1rem;
		color: var(--color-primary-500);
		padding-right: var(--space-3);
		line-height: 1;
	}
</style>
