import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/client';
import { courts, regions, reservations } from '$lib/server/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

type CourtWithAvailability = { id: number; name: string; slug: string | null; latitude: number | null; longitude: number | null; regionName: string | null; availabilityStatus: 'available' | 'closed' | 'no_data'; availableSlotCount: number };
const cache = new Map<string, { data: { courts: CourtWithAvailability[] }; timestamp: number }>();
const CACHE_TTL = 60_000;

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({ 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' });

	const cacheKey = `map-${new Date().toISOString().slice(0, 10)}`;
	const cached = cache.get(cacheKey);
	if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
		return cached.data;
	}

	const now = new Date();
	const todayStart = new Date(now);
	todayStart.setHours(0, 0, 0, 0);
	const todayEnd = new Date(now);
	todayEnd.setHours(23, 59, 59, 999);

	const courtList = await db
		.select({
			id: courts.id,
			name: courts.name,
			slug: courts.slug,
			latitude: courts.latitude,
			longitude: courts.longitude,
			regionName: regions.name
		})
		.from(courts)
		.leftJoin(regions, eq(courts.regionId, regions.id))
		.where(eq(courts.isActive, true))
		.orderBy(courts.id);

	const todayReservations = await db
		.select({
			courtId: reservations.courtId,
			totalSlots: sql<number>`count(*)::int`,
			availableSlots: sql<number>`count(*) filter (where ${reservations.status} = 'available')::int`
		})
		.from(reservations)
		.where(and(gte(reservations.date, todayStart), lte(reservations.date, todayEnd)))
		.groupBy(reservations.courtId);

	const availabilityMap = new Map(todayReservations.map((r) => [r.courtId, r]));

	const courtsWithAvailability = courtList.map((court) => {
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
			...court,
			availabilityStatus,
			availableSlotCount
		};
	});

	const data = { courts: courtsWithAvailability };
	cache.set(cacheKey, { data, timestamp: Date.now() });
	return data;
};
