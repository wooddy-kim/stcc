import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { courts, regions, tips } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

const site = 'https://courtnow.info';

export const GET: RequestHandler = async () => {
	// Static pages with optimized priorities and change frequencies
	const staticPages: Array<{
		url: string;
		priority: string;
		changefreq: string;
		lastmod?: string;
	}> = [
		{ url: '', priority: '1.0', changefreq: 'hourly' }, // Homepage - real-time reservation data
		{ url: '/map', priority: '0.8', changefreq: 'daily' }, // 지도 페이지 - 코트 현황 표시
		{ url: '/about', priority: '0.6', changefreq: 'monthly' },
		{ url: '/content', priority: '0.8', changefreq: 'weekly' }, // Tips listing page
		{ url: '/stats', priority: '0.8', changefreq: 'daily' }, // Statistics page - updated frequently
		{ url: '/glossary', priority: '0.6', changefreq: 'monthly' }, // Tennis glossary
		{ url: '/faq', priority: '0.7', changefreq: 'monthly' }, // FAQ page
		{ url: '/contact', priority: '0.5', changefreq: 'yearly' },
		{ url: '/pwa-guide', priority: '0.4', changefreq: 'yearly' }, // PWA installation guide
		{ url: '/terms', priority: '0.3', changefreq: 'yearly' },
		{ url: '/privacy', priority: '0.3', changefreq: 'yearly' }
	];

	// Fetch court pages from database
	const courtPages: Array<{ url: string; priority: string; changefreq: string; lastmod?: string }> =
		[];
	try {
		const courtsData = await db
			.select({ slug: courts.slug, regionCode: regions.code })
			.from(courts)
			.leftJoin(regions, eq(courts.regionId, regions.id))
			.where(eq(courts.isActive, true));

		// 시 단위 페이지 — 슬러그 있는 활성 코트가 하나라도 있는 지역만 (/regions/[code]가 404를 내지 않는 조건과 같다)
		const regionCodes = new Set(
			courtsData
				.filter((c) => c.slug && c.regionCode)
				.map((c) => (c.regionCode as string).toLowerCase())
		);
		courtPages.push(
			...[...regionCodes].map((code) => ({
				url: `/regions/${code}`,
				priority: '0.9',
				changefreq: 'daily'
			}))
		);

		courtPages.push(
			...courtsData
				.filter((court) => court.slug) // Only include courts with slug
				.map((court) => ({
					url: `/courts/${court.slug}`,
					priority: '0.9', // Very high priority for court detail pages
					changefreq: 'weekly'
				}))
		);
	} catch (error) {
		console.error('Failed to fetch courts for sitemap:', error);
	}

	// Fetch tip pages from database
	let tipPages: Array<{ url: string; priority: string; changefreq: string; lastmod?: string }> = [];
	try {
		const tipsData = await db
			.select({ slug: tips.slug, lastUpdated: tips.lastUpdated })
			.from(tips)
			.where(eq(tips.isPublished, true));
		tipPages = tipsData.map((tip) => ({
			url: `/content/${tip.slug}`,
			priority: '0.7',
			changefreq: 'monthly',
			lastmod: tip.lastUpdated ?? undefined
		}));
	} catch (error) {
		console.error('Failed to fetch tips for sitemap:', error);
	}

	// Combine all pages
	const allPages = [...staticPages, ...courtPages, ...tipPages];

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
	.map((page) => {
		// lastmod를 매 요청 현재 시각으로 채우면 값이 계속 바뀌어
		// Google이 이 신호를 신뢰하지 않는다. 실제 갱신 시각이 없으면 생략한다.
		const lastmod = page.lastmod ? `\n\t\t<lastmod>${page.lastmod}</lastmod>` : '';
		return `	<url>
		<loc>${site}${page.url}</loc>${lastmod}
		<changefreq>${page.changefreq}</changefreq>
		<priority>${page.priority}</priority>
	</url>`;
	})
	.join('\n')}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600, s-maxage=3600'
		}
	});
};
