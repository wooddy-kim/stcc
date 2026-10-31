import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { tips } from '$lib/server/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { CacheManager } from '$lib/utils/cache-manager';


const cacheManager = CacheManager.getInstance();
const tipsCache = cacheManager.createCache('tips', {
	ttl: 600000, // 10분
	maxSize: 30,
	cleanupInterval: 120000 // 2분마다 정리
});

interface TipListItem {
	title: string;
	slug: string;
	category: string;
	difficulty: string;
	lastUpdated: string | null;
	excerpt: string | null;
	readingTime: number | null;
}

export const GET: RequestHandler = async ({ url }) => {
	const type = url.searchParams.get('type') || 'random';

	try {
		if (type === 'list') {
			// 캐시 확인
			const cached = tipsCache.get('all') as TipListItem[] | undefined;
			if (cached) {
				return json(
					{ success: true, data: cached },
					{ headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
				);
			}

			const rows = await db
				.select({
					id: tips.id,
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

			const result: TipListItem[] = rows.map((row) => ({
				title: row.title,
				slug: row.slug,
				category: row.category,
				difficulty: row.difficulty,
				lastUpdated: row.lastUpdated,
				excerpt: row.excerpt,
				readingTime: row.readingTime
			}));

			tipsCache.set('all', result);

			return json(
				{ success: true, data: result },
				{ headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
			);
		} else if (type === 'detail') {
			const slug = url.searchParams.get('slug');
			if (!slug) {
				return json(
					{ success: false, error: 'Slug parameter required for detail view' },
					{ status: 400 }
				);
			}

			const cacheKey = `content-${slug}`;
			const cached = tipsCache.get(cacheKey);
			if (cached) {
				return json(
					{ success: true, data: cached },
					{ headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
				);
			}

			const rows = await db
				.select()
				.from(tips)
				.where(and(eq(tips.slug, slug), eq(tips.isPublished, true)));

			if (rows.length === 0) {
				return json({ success: false, error: 'Tip not found' }, { status: 404 });
			}

			const tip = rows[0];
			const result = { ...tip, content: tip.htmlContent };

			tipsCache.set(cacheKey, result);

			return json(
				{ success: true, data: result },
				{ headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
			);
		} else {
			// Default: random tip (Math.random() 사용 → CDN 캐싱 금지)
			const slugRows = await db
				.select({ slug: tips.slug })
				.from(tips)
				.where(eq(tips.isPublished, true));

			if (slugRows.length === 0) {
				return json({ success: false, error: 'No tips available' }, { status: 404 });
			}

			const randomSlug = slugRows[Math.floor(Math.random() * slugRows.length)].slug;

			const rows = await db
				.select()
				.from(tips)
				.where(and(eq(tips.slug, randomSlug), eq(tips.isPublished, true)));

			if (rows.length === 0) {
				return json({ success: false, error: 'No tips available' }, { status: 404 });
			}

			const tip = rows[0];
			const result = { ...tip, content: tip.htmlContent };

			return json(
				{ success: true, data: result },
				{ headers: { 'Cache-Control': 'private, no-store' } }
			);
		}
	} catch (error) {
		console.error('Failed to fetch tips:', error);
		return json({ success: false, error: 'Failed to fetch tips' }, { status: 500 });
	}
};
