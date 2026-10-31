import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { WEATHER_API_KEY } from '$env/static/private';
import {
	REGION_COORDINATES,
	getBaseTime,
	parseWeatherResponse,
	calculateTennisScore,
	getWeatherIcon,
	formatDate,
	formatTime,
	type WeatherData,
	type WeatherItem
} from '$lib/utils/weather';

interface WeatherResponse {
	forecasts: WeatherData[];
	region: string;
	updatedAt: string;
}

interface KMAResponse {
	response: {
		header: {
			resultCode: string;
			resultMsg: string;
		};
		body?: {
			items?: {
				item?: WeatherItem[];
			};
		};
	};
}

// 캐시 (30분 TTL)
const cache = new Map<string, { data: WeatherResponse; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000;

export const GET: RequestHandler = async ({ url }) => {
	try {
		const region = url.searchParams.get('region') || 'SUWON';
		const targetDate = url.searchParams.get('date'); // YYYY-MM-DD 형식

		// 지역 좌표 확인
		const coords = REGION_COORDINATES[region];
		if (!coords) {
			return json(
				{ success: false, error: 'Invalid region' },
				{ status: 400 }
			);
		}

		// 캐시 확인
		const cacheKey = `weather-${region}`;
		const cached = cache.get(cacheKey);

		if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
			// 특정 날짜 필터링
			if (targetDate) {
				const filtered = cached.data.forecasts.filter(f => f.date === targetDate);
				return json(
					{ success: true, data: { ...cached.data, forecasts: filtered } },
					{ headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600' } }
				);
			}
			return json(
				{ success: true, data: cached.data },
				{ headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600' } }
			);
		}

		// API 키 확인
		if (!WEATHER_API_KEY) {
			return json(
				{ success: false, error: 'Weather API key not configured' },
				{ status: 500 }
			);
		}

		// base_date, base_time 계산
		const { baseDate, baseTime } = getBaseTime();

		// 기상청 API 호출
		const apiUrl = new URL('http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst');
		apiUrl.searchParams.set('serviceKey', WEATHER_API_KEY);
		apiUrl.searchParams.set('numOfRows', '1000');
		apiUrl.searchParams.set('pageNo', '1');
		apiUrl.searchParams.set('dataType', 'JSON');
		apiUrl.searchParams.set('base_date', baseDate);
		apiUrl.searchParams.set('base_time', baseTime);
		apiUrl.searchParams.set('nx', String(coords.nx));
		apiUrl.searchParams.set('ny', String(coords.ny));

		const response = await fetch(apiUrl.toString());

		if (!response.ok) {
			console.error('Weather API HTTP error:', response.status);
			return json(
				{ success: false, error: 'Weather API request failed' },
				{ status: 502 }
			);
		}

		const result: KMAResponse = await response.json();

		// API 응답 확인
		if (result.response.header.resultCode !== '00') {
			console.error('Weather API error:', result.response.header.resultMsg);
			return json(
				{ success: false, error: result.response.header.resultMsg },
				{ status: 502 }
			);
		}

		const items = result.response.body?.items?.item || [];

		if (items.length === 0) {
			return json(
				{ success: false, error: 'No weather data available' },
				{ status: 404 }
			);
		}

		// 응답 파싱
		const weatherMap = parseWeatherResponse(items);

		// WeatherData 배열로 변환
		const forecasts: WeatherData[] = [];
		const processedTimes = new Set<string>();

		for (const [key, data] of weatherMap) {
			// 3시간 단위로 필터링 (06, 09, 12, 15, 18)
			const hour = parseInt(data.time?.slice(0, 2) || '0');
			if (![6, 9, 12, 15, 18].includes(hour)) continue;

			// 중복 방지
			const dateTimeKey = `${data.date}-${hour}`;
			if (processedTimes.has(dateTimeKey)) continue;
			processedTimes.add(dateTimeKey);

			const { score, condition, description } = calculateTennisScore(data);
			const icon = getWeatherIcon(data);

			forecasts.push({
				date: formatDate(data.date || ''),
				time: formatTime(data.time || ''),
				temperature: data.temperature ?? 0,
				sky: data.sky ?? 1,
				precipitation: data.precipitation ?? 0,
				precipitationProbability: data.precipitationProbability ?? 0,
				humidity: data.humidity ?? 0,
				windSpeed: data.windSpeed ?? 0,
				tennisScore: score,
				condition,
				description
			});
		}

		// 날짜/시간순 정렬
		forecasts.sort((a, b) => {
			const dateCompare = a.date.localeCompare(b.date);
			if (dateCompare !== 0) return dateCompare;
			return a.time.localeCompare(b.time);
		});

		const weatherResponse: WeatherResponse = {
			forecasts,
			region: coords.name,
			updatedAt: new Date().toISOString()
		};

		// 캐시 저장
		cache.set(cacheKey, { data: weatherResponse, timestamp: Date.now() });

		// 특정 날짜 필터링
		if (targetDate) {
			const filtered = forecasts.filter(f => f.date === targetDate);
			return json(
				{ success: true, data: { ...weatherResponse, forecasts: filtered } },
				{ headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600' } }
			);
		}

		return json(
			{ success: true, data: weatherResponse },
			{ headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600' } }
		);
	} catch (error) {
		console.error('Weather API error:', error);
		return json(
			{ success: false, error: 'Failed to fetch weather data' },
			{ status: 500, headers: { 'Cache-Control': 'no-store' } }
		);
	}
};
