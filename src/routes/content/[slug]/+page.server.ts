import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/client';
import { tips } from '$lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { renderMarkdown } from '$lib/server/markdown';

type TipData = {
	tip: {
		title: string;
		slug: string;
		category: string;
		difficulty: string;
		lastUpdated: string | null;
		content: string;
		rawContent: string;
		excerpt: string | null;
		readingTime: number | null;
	};
	relatedPosts: Array<{
		title: string;
		slug: string;
		category: string;
		difficulty: string;
		lastUpdated: string | null;
		excerpt: string | null;
		readingTime: number | null;
	}>;
};

const cache = new Map<string, { data: TipData; timestamp: number }>();
const CACHE_TTL = 300_000;

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	setHeaders({ 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' });

	const cached = cache.get(params.slug);
	if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
		return cached.data;
	}

	const rows = await db
		.select()
		.from(tips)
		.where(and(eq(tips.slug, params.slug), eq(tips.isPublished, true)));

	if (rows.length === 0) {
		throw error(404, 'Not found');
	}

	const tip = rows[0];

	const allInCategory = await db
		.select({
			title: tips.title,
			slug: tips.slug,
			category: tips.category,
			difficulty: tips.difficulty,
			lastUpdated: tips.lastUpdated,
			excerpt: tips.excerpt,
			readingTime: tips.readingTime
		})
		.from(tips)
		.where(and(eq(tips.isPublished, true), eq(tips.category, tip.category)))
		.orderBy(desc(tips.lastUpdated));

	const relatedPosts = allInCategory.filter((t) => t.slug !== params.slug).slice(0, 3);

	const data = {
		tip: {
			title: tip.title,
			slug: tip.slug,
			category: tip.category,
			difficulty: tip.difficulty,
			lastUpdated: tip.lastUpdated,
			content: renderMarkdown(tip.htmlContent),
			rawContent: tip.rawContent,
			excerpt: tip.excerpt,
			readingTime: tip.readingTime
		},
		relatedPosts
	};
	cache.set(params.slug, { data, timestamp: Date.now() });
	return data;
};
