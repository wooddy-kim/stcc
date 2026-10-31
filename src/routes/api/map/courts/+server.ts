import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { courts, regions, reservations } from '$lib/server/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { CacheManager } from '$lib/utils/cache-manager';

const cacheManager = CacheManager.getInstance();
const mapCourtsCache = cacheManager.createCache('map-courts', {
	ttl: 60000,
	maxSize: 20,
	cleanupInterval: 30000
});

export const GET: RequestHandler = async ({ url }) => {
	try {
		const dateParam = url.searchParams.get('date');
		const targetDate = dateParam ? new Date(dateParam) : new Date();

		const dayStart = new Date(targetDate);
		dayStart.setHours(0, 0, 0, 0);
		const dayEnd = new Date(targetDate);
		dayEnd.setHours(23, 59, 59, 999);

		const cacheKey = `map-courts-${dayStart.toISOString().slice(0, 10)}`;
		const cached = mapCourtsCache.get(cacheKey);
		if (cached) {
			return json(cached, {
				headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' }
			});
		}

		const courtList = await db
			.select({
				id: courts.id,
				name: sql<string>`COALESCE(${courts.rawName}, ${courts.name})`,
				slug: courts.slug,
				latitude: courts.latitude,
				longitude: courts.longitude,
				regionName: regions.name
			})
			.from(courts)
			.leftJoin(regions, eq(courts.regionId, regions.id))
			.where(eq(courts.isActive, true))
			.orderBy(courts.id);

		const dayReservations = await db
			.select({
				courtId: reservations.courtId,
				totalSlots: sql<number>`count(*)::int`,
				availableSlots: sql<number>`count(*) filter (where ${reservations.status} = 'available')::int`
			})
			.from(reservations)
			.where(and(gte(reservations.date, dayStart), lte(reservations.date, dayEnd)))
			.groupBy(reservations.courtId);

		const availabilityMap = new Map(dayReservations.map((r) => [r.courtId, r]));

		const data = courtList.map((court) => {
			const avail = availabilityMap.get(court.id);
			let availabilityStatus: 'available' | 'closed' | 'no_data';
			let availableSlotCount = 0;

			if (!avail || avail.totalSlots === 0) {
				availabilityStatus = 'no_data';
			} else if (avail.availableSlots > 0) {
				availabilityStatus = 'available';
				availableSlotCount = avail.availableSlots;
			} else {
				availabilityStatus = 'closed';
			}

			return {
				id: court.id,
				name: court.name,
				slug: court.slug,
				regionName: court.regionName,
				latitude: court.latitude,
				longitude: court.longitude,
				availabilityStatus,
				availableSlotCount
			};
		});

		const response = { success: true, data };
		mapCourtsCache.set(cacheKey, response);
		return json(response, {
			headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' }
		});
	} catch (error) {
		console.error('Failed to fetch map courts:', error);
		return json(
			{ success: false, error: 'Failed to fetch map courts' },
			{ status: 500, headers: { 'Cache-Control': 'no-store' } }
		);
	}
};
