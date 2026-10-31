import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/client';
import { courts, regions } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

type RegionCount = { name: string; count: number };

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({ 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' });

	// 소개 페이지는 숫자 없이도 읽힌다 — 조회가 실패하면 숫자 블록만 숨긴다
	const regionCounts = await db
		.select({ name: regions.name, count: sql<number>`count(*)::int` })
		.from(courts)
		.innerJoin(regions, eq(courts.regionId, regions.id))
		.where(eq(courts.isActive, true))
		.groupBy(regions.id, regions.name)
		.orderBy(regions.id)
		.catch((err): RegionCount[] => {
			console.error('Failed to fetch region counts for about page:', err);
			return [];
		});

	return { regionCounts };
};
