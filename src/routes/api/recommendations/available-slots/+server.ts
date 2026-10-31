import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { reservations, courts } from '$lib/server/db/schema';
import { eq, sql, and, gte, lte, inArray } from 'drizzle-orm';

interface HistoricalStat {
	startTime: string;
	total: number;
	available: number;
}

interface AvailableSlot {
	courtId: number | null;
	date: Date;
	startTime: string;
	endTime: string;
	status: string;
}

interface RecommendedSlot {
	courtId: number;
	courtName: string;
	date: string;
	dateLabel: string;
	timeSlot: string;
	availabilityScore: number;
	reason: string;
}

interface RecommendationsResponse {
	recommendations: RecommendedSlot[];
	topPicks: RecommendedSlot[];
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

// 비인기 시간대 (가산점 부여)
const OFF_PEAK_TIMES = ['06:00', '12:00', '14:00'];

// 캐시 (3분 TTL)
const cache = new Map<string, { data: RecommendationsResponse; timestamp: number }>();
const CACHE_TTL = 3 * 60 * 1000;

function isOffPeakTime(time: string): boolean {
	return OFF_PEAK_TIMES.includes(time);
}

function formatDateLabel(date: Date): string {
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const dayOfWeek = DAY_LABELS[date.getDay()];
	return `${month}/${day} (${dayOfWeek})`;
}

function generateReason(
	status: string,
	availableRate: number,
	isOffPeak: boolean,
	isWeekend: boolean
): string {
	const reasons: string[] = [];

	if (status === 'available') {
		reasons.push('현재 예약 가능');
	}

	if (availableRate >= 70) {
		reasons.push('높은 가용률');
	} else if (availableRate >= 40) {
		reasons.push('보통 가용률');
	}

	if (isOffPeak) {
		reasons.push('비인기 시간대');
	}

	if (!isWeekend) {
		reasons.push('평일');
	}

	return reasons.length > 0 ? reasons.join(', ') : '추천';
}

export const GET: RequestHandler = async ({ url }) => {
	try {
		const courtIdsParam = url.searchParams.get('courtIds');
		const dateParam = url.searchParams.get('date');

		// 캐시 키 생성
		const cacheKey = `recommendations-${courtIdsParam || 'all'}-${dateParam || 'default'}`;
		const cached = cache.get(cacheKey);

		if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
			return json(
				{ success: true, data: cached.data },
				{ headers: { 'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=300' } }
			);
		}

		// 날짜 범위 설정 (오늘부터 7일)
		const startDate = new Date();
		const endDate = new Date();
		endDate.setDate(endDate.getDate() + 7);

		// 코트 ID 파싱
		let courtIds: number[] | undefined;
		if (courtIdsParam) {
			courtIds = courtIdsParam.split(',').map((id) => parseInt(id)).filter((id) => !isNaN(id));
		}

		// 활성화된 코트 목록 조회
		const activeCourts = await db
			.select({ id: courts.id, name: courts.name })
			.from(courts)
			.where(eq(courts.isActive, true));

		const courtMap = new Map(activeCourts.map((c: { id: number; name: string }) => [c.id, c.name]));

		// 쿼리 조건 설정
		const conditions = [
			gte(reservations.date, startDate),
			lte(reservations.date, endDate),
			eq(reservations.status, 'available')
		];

		if (courtIds && courtIds.length > 0) {
			conditions.push(inArray(reservations.courtId, courtIds));
		}

		// 예약 가능한 슬롯 조회
		const availableSlots = await db
			.select({
				courtId: reservations.courtId,
				date: reservations.date,
				startTime: reservations.startTime,
				endTime: reservations.endTime,
				status: reservations.status
			})
			.from(reservations)
			.where(and(...conditions))
			.limit(100);

		// 과거 가용률 조회 (시간대별)
		const historicalStats = await db
			.select({
				startTime: reservations.startTime,
				total: sql<number>`count(*)::int`,
				available: sql<number>`sum(case when ${reservations.status} = 'available' then 1 else 0 end)::int`
			})
			.from(reservations)
			.where(
				and(
					gte(reservations.date, new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)),
					lte(reservations.date, new Date())
				)
			)
			.groupBy(reservations.startTime);

		const availabilityRates = new Map<string, number>(
			(historicalStats as HistoricalStat[]).map((stat) => [
				stat.startTime,
				stat.total > 0 ? (stat.available / stat.total) * 100 : 50
			])
		);

		// 점수 계산 및 추천 생성
		const recommendations: RecommendedSlot[] = (availableSlots as AvailableSlot[])
			.map((slot: AvailableSlot) => {
				if (slot.courtId === null) return null;

				const courtName = courtMap.get(slot.courtId);
				if (!courtName) return null;

				const date = new Date(slot.date);
				const isWeekend = date.getDay() === 0 || date.getDay() === 6;
				const isOffPeak = isOffPeakTime(slot.startTime);
				const historicalRate = availabilityRates.get(slot.startTime) || 50;

				// 점수 계산
				let score = 0;

				// 현재 예약 가능 (50점)
				if (slot.status === 'available') score += 50;

				// 과거 가용률 기반 (30점)
				score += (historicalRate / 100) * 30;

				// 비인기 시간대 가산점 (20점)
				if (isOffPeak) score += 20;

				// 평일 가산점 (10점)
				if (!isWeekend) score += 10;

				const reason = generateReason(slot.status, historicalRate, isOffPeak, isWeekend);

				return {
					courtId: slot.courtId,
					courtName,
					date: date.toISOString().split('T')[0],
					dateLabel: formatDateLabel(date),
					timeSlot: `${slot.startTime} - ${slot.endTime}`,
					availabilityScore: Math.min(100, Math.round(score)),
					reason
				};
			})
			.filter((r: RecommendedSlot | null): r is RecommendedSlot => r !== null);

		// 점수순 정렬
		recommendations.sort((a, b) => b.availabilityScore - a.availabilityScore);

		// 상위 3개 추출 (중복 코트 제거)
		const seenCourts = new Set<number>();
		const topPicks = recommendations
			.filter((r) => {
				if (seenCourts.has(r.courtId)) return false;
				seenCourts.add(r.courtId);
				return true;
			})
			.slice(0, 3);

		const response: RecommendationsResponse = {
			recommendations: recommendations.slice(0, 20),
			topPicks
		};

		// 캐시 저장
		cache.set(cacheKey, { data: response, timestamp: Date.now() });

		return json(
			{ success: true, data: response },
			{ headers: { 'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=300' } }
		);
	} catch (error) {
		console.error('Recommendations API error:', error);
		return json(
			{ success: false, error: 'Failed to fetch recommendations' },
			{ status: 500, headers: { 'Cache-Control': 'no-store' } }
		);
	}
};
