import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { reservations, courts } from '$lib/server/db/schema';
import { eq, and, gte, lte, inArray, sql } from 'drizzle-orm';
import { CacheManager } from '$lib/utils/cache-manager';

/** 이 시간 안에 수집된 행만 보여 준다 */
const STALE_AFTER_HOURS = 24;

// EnhancedCache를 사용한 캐싱
const cacheManager = CacheManager.getInstance();
const reservationCache = cacheManager.createCache('reservations', {
	ttl: 60000, // 60초
	maxSize: 100,
	cleanupInterval: 30000 // 30초마다 정리
});

function parseDateString(dateStr: string): Date | null {
	try {
		const date = new Date(dateStr);
		return isNaN(date.getTime()) ? null : date;
	} catch {
		return null;
	}
}

export const GET: RequestHandler = async ({ url }) => {
	const courtIdsParam = url.searchParams.get('courtIds');
	const startDateParam = url.searchParams.get('startDate');
	const endDateParam = url.searchParams.get('endDate');

	// Improved cache key generation (order-independent)
	const cacheKeyParams = {
		courtIds: courtIdsParam,
		startDate: startDateParam,
		endDate: endDateParam
	};
	const cacheKey = JSON.stringify(cacheKeyParams);

	// 캐시 확인
	const cached = reservationCache.get(cacheKey);
	if (cached) {
		return json(cached, {
			headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' }
		});
	}

	try {
		// Parse court IDs
		const courtIds = courtIdsParam
			? courtIdsParam
					.split(',')
					.map(Number)
					.filter((id) => !isNaN(id))
			: [];

		// Parse dates - 항상 현재일 이후만 조회 (KST 기준)
		const now = new Date();
		const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
		const today = new Date(
			Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate())
		);

		const requestedStart = startDateParam ? parseDateString(startDateParam) : null;
		const startDate = requestedStart && requestedStart > today ? requestedStart : today;

		const endDate = endDateParam
			? parseDateString(endDateParam)
			: (() => {
					const date = new Date();
					date.setDate(date.getDate() + 7);
					return date;
				})();

		// Build query conditions
		const conditions = [
			eq(courts.isActive, true),
			// 오래 갱신되지 않은 행은 실제 예약 상태와 다를 수 있다(수동 백필로만 채워진 먼 날짜,
			// 크롤 장애). 보여 주지 않고 화면에서 "정보 없음"으로 처리되게 한다.
			// crawled_at은 UTC 기준 naive timestamp로 저장된다.
			sql`${reservations.crawledAt} > (now() at time zone 'UTC') - make_interval(hours => ${STALE_AFTER_HOURS})`
		];

		if (courtIds.length > 0) {
			conditions.push(inArray(reservations.courtId, courtIds));
		}

		if (startDate) {
			conditions.push(gte(reservations.date, startDate));
		}

		if (endDate) {
			conditions.push(lte(reservations.date, endDate));
		}

		// Fetch reservations with court info
		const result = await db
			.select({
				id: reservations.id,
				courtId: reservations.courtId,
				courtName: sql<string>`COALESCE(${courts.rawName}, ${courts.name})`,
				courtNumber: reservations.courtNumber,
				availableCourts: reservations.availableCourts,
				date: reservations.date,
				startTime: reservations.startTime,
				endTime: reservations.endTime,
				status: reservations.status,
				crawledAt: reservations.crawledAt,
				reservationUrl: courts.reservationUrl,
				// 브라우저가 date(naive timestamp)를 되읽으면 로컬 타임존만큼 밀리므로 날짜 문자열을 함께 준다
				day: sql<string>`to_char(${reservations.date}, 'YYYY-MM-DD')`
			})
			.from(reservations)
			.leftJoin(courts, eq(reservations.courtId, courts.id))
			.where(and(...conditions))
			.orderBy(reservations.date, reservations.startTime);

		// Calculate statistics
		const totalCount = result.length;
		const availableCount = result.filter((r) => r.status === 'available').length;

		const response = {
			success: true,
			data: result,
			meta: {
				totalCount,
				availableCount
			}
		};

		// 캐시에 저장
		reservationCache.set(cacheKey, response);

		return json(response, {
			headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' }
		});
	} catch (error) {
		console.error('Failed to fetch reservations:', error);
		return json(
			{
				success: false,
				error: 'Failed to fetch reservations'
			},
			{ status: 500, headers: { 'Cache-Control': 'no-store' } }
		);
	}
};
