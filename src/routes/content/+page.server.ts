import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/client';
import { tips } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

const cache = new Map<string, { data: { tips: unknown[] }; timestamp: number }>();
const CACHE_TTL = 300_000;

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({ 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' });

	const cached = cache.get('all');
	if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
		return cached.data;
	}

	const rows = await db
		.select({
			title: tips.title,
			slug: tips.slug,
			category: tips.category,
			difficulty: tips.difficulty,
			excerpt: tips.excerpt,
			readingTime: tips.readingTime,
			lastUpdated: tips.lastUpdated
		})
		.from(tips)
		.where(eq(tips.isPublished, true))
		.orderBy(desc(tips.lastUpdated));

	const data = { tips: rows };
	cache.set('all', { data, timestamp: Date.now() });
	return data;
};
