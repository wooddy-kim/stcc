/**
 * 날씨 유틸리티 함수
 * - 기상청 API 응답 파싱
 * - 테니스 적합도 점수 계산
 * - 좌표 변환
 */

// 기상청 API 응답 타입
export interface WeatherItem {
	category: string;
	fcstDate: string;
	fcstTime: string;
	fcstValue: string;
}

export interface WeatherData {
	date: string;
	time: string;
	temperature: number; // 기온 (TMP)
	sky: number; // 하늘상태 (SKY): 1맑음, 3구름많음, 4흐림
	precipitation: number; // 강수형태 (PTY): 0없음, 1비, 2비/눈, 3눈, 4소나기
	precipitationProbability: number; // 강수확률 (POP)
	humidity: number; // 습도 (REH)
	windSpeed: number; // 풍속 (WSD)
	tennisScore: number; // 테니스 적합도 점수 (0-100)
	condition: 'excellent' | 'good' | 'fair' | 'poor';
	description: string;
}

// 지역별 좌표 (기상청 격자 좌표)
export const REGION_COORDINATES: Record<string, { nx: number; ny: number; name: string }> = {
	SUWON: { nx: 60, ny: 121, name: '수원시' },
	HWASEONG: { nx: 62, ny: 120, name: '화성시' },
	YONGIN: { nx: 64, ny: 119, name: '용인시' }
};

// 코트 ID에서 지역 추출
export function getRegionFromCourtId(courtId: number): string {
	// 코트 ID 범위에 따라 지역 반환
	// 1-2: 수원 (망포), 3-6: 화성 (여울, 왕배산, 금반), 7-8: 용인
	if (courtId <= 2) return 'SUWON';
	if (courtId <= 6) return 'HWASEONG';
	return 'YONGIN';
}

// 기상청 API base_time 계산 (가장 최근 발표 시각)
export function getBaseTime(date: Date = new Date()): { baseDate: string; baseTime: string } {
	const hours = date.getHours();
	const minutes = date.getMinutes();

	// 발표 시각: 0200, 0500, 0800, 1100, 1400, 1700, 2000, 2300
	// 각 발표 시각 + 10분 후에 API 데이터 생성됨
	const baseTimes = [2, 5, 8, 11, 14, 17, 20, 23];

	let baseHour = baseTimes[0];
	let baseDate = new Date(date);

	for (const bt of baseTimes) {
		// 발표 시각 + 10분 이후면 해당 시각 사용 가능
		if (hours > bt || (hours === bt && minutes >= 10)) {
			baseHour = bt;
		}
	}

	// 현재 시각이 02:10 이전이면 전날 23시 데이터 사용
	if (hours < 2 || (hours === 2 && minutes < 10)) {
		baseDate.setDate(baseDate.getDate() - 1);
		baseHour = 23;
	}

	const year = baseDate.getFullYear();
	const month = String(baseDate.getMonth() + 1).padStart(2, '0');
	const day = String(baseDate.getDate()).padStart(2, '0');

	return {
		baseDate: `${year}${month}${day}`,
		baseTime: String(baseHour).padStart(2, '0') + '00'
	};
}

// 기상청 API 응답 파싱
export function parseWeatherResponse(items: WeatherItem[]): Map<string, Partial<WeatherData>> {
	const weatherMap = new Map<string, Partial<WeatherData>>();

	for (const item of items) {
		const key = `${item.fcstDate}-${item.fcstTime}`;

		if (!weatherMap.has(key)) {
			weatherMap.set(key, {
				date: item.fcstDate,
				time: item.fcstTime
			});
		}

		const data = weatherMap.get(key)!;
		const value = parseFloat(item.fcstValue);

		switch (item.category) {
			case 'TMP': // 기온
				data.temperature = value;
				break;
			case 'SKY': // 하늘상태
				data.sky = value;
				break;
			case 'PTY': // 강수형태
				data.precipitation = value;
				break;
			case 'POP': // 강수확률
				data.precipitationProbability = value;
				break;
			case 'REH': // 습도
				data.humidity = value;
				break;
			case 'WSD': // 풍속
				data.windSpeed = value;
				break;
		}
	}

	return weatherMap;
}

// 테니스 적합도 점수 계산
export function calculateTennisScore(data: Partial<WeatherData>): {
	score: number;
	condition: WeatherData['condition'];
	description: string;
} {
	let score = 100;
	const reasons: string[] = [];

	const temp = data.temperature ?? 20;
	const sky = data.sky ?? 1;
	const pty = data.precipitation ?? 0;
	const pop = data.precipitationProbability ?? 0;
	const humidity = data.humidity ?? 50;
	const wind = data.windSpeed ?? 0;

	// 1. 강수 체크 (가장 중요)
	if (pty > 0) {
		// 비/눈이 오면 크게 감점
		score -= 50;
		if (pty === 1 || pty === 4) reasons.push('비');
		else if (pty === 3) reasons.push('눈');
		else if (pty === 2) reasons.push('비/눈');
	} else if (pop >= 60) {
		score -= 30;
		reasons.push(`강수확률 ${pop}%`);
	} else if (pop >= 30) {
		score -= 15;
	}

	// 2. 기온 체크
	if (temp >= 15 && temp <= 25) {
		// 최적 기온: 감점 없음
	} else if (temp >= 10 && temp <= 30) {
		score -= 10;
	} else if (temp >= 5 && temp <= 35) {
		score -= 25;
		if (temp < 10) reasons.push('쌀쌀함');
		else reasons.push('더움');
	} else {
		score -= 40;
		if (temp < 5) reasons.push('추움');
		else reasons.push('폭염');
	}

	// 3. 바람 체크
	if (wind > 10) {
		score -= 30;
		reasons.push('강풍');
	} else if (wind > 7) {
		score -= 15;
		reasons.push('바람');
	} else if (wind > 5) {
		score -= 5;
	}

	// 4. 습도 체크
	if (humidity > 85) {
		score -= 20;
		reasons.push('높은 습도');
	} else if (humidity > 75) {
		score -= 10;
	}

	// 5. 하늘 상태
	if (sky === 1) {
		// 맑음: 보너스
		if (reasons.length === 0) reasons.push('맑음');
	} else if (sky === 4) {
		score -= 5;
		if (reasons.length === 0) reasons.push('흐림');
	}

	// 점수 범위 제한
	score = Math.max(0, Math.min(100, score));

	// 컨디션 결정
	let condition: WeatherData['condition'];
	if (score >= 80) condition = 'excellent';
	else if (score >= 60) condition = 'good';
	else if (score >= 40) condition = 'fair';
	else condition = 'poor';

	// 설명 생성
	const description = reasons.length > 0 ? reasons.join(', ') : '보통';

	return { score, condition, description };
}

// 날씨 아이콘 결정
export function getWeatherIcon(data: Partial<WeatherData>): string {
	const pty = data.precipitation ?? 0;
	const sky = data.sky ?? 1;

	// 강수 형태에 따른 아이콘
	if (pty === 1 || pty === 4) return '🌧️'; // 비, 소나기
	if (pty === 2) return '🌨️'; // 비/눈
	if (pty === 3) return '❄️'; // 눈

	// 하늘 상태에 따른 아이콘
	if (sky === 1) return '☀️'; // 맑음
	if (sky === 3) return '⛅'; // 구름많음
	if (sky === 4) return '☁️'; // 흐림

	return '🌤️'; // 기본
}

// 날짜 포맷 변환 (YYYYMMDD -> YYYY-MM-DD)
export function formatDate(dateStr: string): string {
	if (dateStr.length === 8) {
		return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
	}
	return dateStr;
}

// 시간 포맷 변환 (HHMM -> HH:MM)
export function formatTime(timeStr: string): string {
	if (timeStr.length === 4) {
		return `${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}`;
	}
	return timeStr;
}
