import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { reservations, courts } from '$lib/server/db/schema';
import { eq, sql, and, gte, lte } from 'drizzle-orm';

interface TimeSlotStat {
	total: number;
	available: number;
	availableRate: number;
}

interface DayOfWeekStat {
	total: number;
	available: number;
	availableRate: number;
}

interface StatsResponse {
	timeSlotStats: Record<string, TimeSlotStat>;
	dayOfWeekStats: Record<string, DayOfWeekStat>;
	popularTimeSlots: string[];
	leastCrowdedTimeSlots: string[];
	courtName?: string;
	period: string;
	dataRange: {
		from: string;
		to: string;
	};
}

const DAY_NAMES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_LABELS: Record<string, string> = {
	sun: '일',
	mon: '월',
	tue: '화',
	wed: '수',
	thu: '목',
	fri: '금',
	sat: '토'
};

// 캐시 (5분 TTL)
const cache = new Map<string, { data: StatsResponse; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5분

export const GET: RequestHandler = async ({ url }) => {
	try {
		const courtId = url.searchParams.get('courtId');
		const period = url.searchParams.get('period') || 'week';

		// 캐시 키 생성
		const cacheKey = `stats-${courtId || 'all'}-${period}`;
		const cached = cache.get(cacheKey);

		if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
			return json(
				{ success: true, data: cached.data },
				{ headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
			);
		}

		// 기간 설정
		const now = new Date();
		const startDate = new Date();
		const endDate = new Date();

		if (period === 'month') {
			startDate.setDate(startDate.getDate() - 30);
		} else {
			startDate.setDate(startDate.getDate() - 7);
		}
		endDate.setDate(endDate.getDate() + 14); // 미래 2주 포함

		// 기본 쿼리 조건
		const baseConditions = [
			gte(reservations.date, startDate),
			lte(reservations.date, endDate)
		];

		if (courtId) {
			baseConditions.push(eq(reservations.courtId, parseInt(courtId)));
		}

		// 시간대별 통계 쿼리
		const timeSlotResults = await db
			.select({
				startTime: reservations.startTime,
				total: sql<number>`count(*)::int`,
				available: sql<number>`COALESCE(sum(case when ${reservations.status} = 'available' then 1 else 0 end), 0)::int`
			})
			.from(reservations)
			.where(and(...baseConditions))
			.groupBy(reservations.startTime)
			.orderBy(reservations.startTime);

		// 요일별 통계 쿼리
		const dayOfWeekResults = await db
			.select({
				dayOfWeek: sql<number>`extract(dow from ${reservations.date})::int`,
				total: sql<number>`count(*)::int`,
				available: sql<number>`COALESCE(sum(case when ${reservations.status} = 'available' then 1 else 0 end), 0)::int`
			})
			.from(reservations)
			.where(and(...baseConditions))
			.groupBy(sql`extract(dow from ${reservations.date})`)
			.orderBy(sql`extract(dow from ${reservations.date})`);

		// 결과 가공
		const timeSlotStats: Record<string, TimeSlotStat> = {};
		for (const row of timeSlotResults) {
			const total = row.total ?? 0;
			const available = row.available ?? 0;
			const availableRate = total > 0 ? Math.round((available / total) * 100 * 10) / 10 : 0;
			timeSlotStats[row.startTime] = {
				total,
				available,
				availableRate
			};
		}

		const dayOfWeekStats: Record<string, DayOfWeekStat> = {};
		for (const row of dayOfWeekResults) {
			const dayName = DAY_NAMES[row.dayOfWeek];
			const total = row.total ?? 0;
			const available = row.available ?? 0;
			const availableRate = total > 0 ? Math.round((available / total) * 100 * 10) / 10 : 0;
			dayOfWeekStats[dayName] = {
				total,
				available,
				availableRate
			};
		}

		// 인기/한산 시간대 계산
		const sortedByAvailability = Object.entries(timeSlotStats)
			.sort((a, b) => a[1].availableRate - b[1].availableRate);

		const popularTimeSlots = sortedByAvailability
			.slice(0, 3)
			.map(([time]) => time);

		const leastCrowdedTimeSlots = sortedByAvailability
			.slice(-3)
			.reverse()
			.map(([time]) => time);

		// 코트 이름 조회
		let courtName: string | undefined;
		if (courtId) {
			const court = await db
				.select({ name: sql<string>`COALESCE(${courts.rawName}, ${courts.name})` })
				.from(courts)
				.where(eq(courts.id, parseInt(courtId)))
				.limit(1);
			courtName = court[0]?.name;
		}

		const response: StatsResponse = {
			timeSlotStats,
			dayOfWeekStats,
			popularTimeSlots,
			leastCrowdedTimeSlots,
			courtName,
			period,
			dataRange: {
				from: startDate.toISOString().split('T')[0],
				to: endDate.toISOString().split('T')[0]
			}
		};

		// 캐시 저장
		cache.set(cacheKey, { data: response, timestamp: Date.now() });

		return json(
			{ success: true, data: response },
			{ headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
		);
	} catch (error) {
		console.error('Stats API error:', error);
		return json(
			{ success: false, error: 'Failed to fetch statistics' },
			{ status: 500, headers: { 'Cache-Control': 'no-store' } }
		);
	}
};
