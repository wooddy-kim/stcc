import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/client';
import { courts, regions, tips } from '$lib/server/db/schema';
import { eq, sql, desc } from 'drizzle-orm';
import { renderMarkdown } from '$lib/server/markdown';

type RelatedTip = {
	title: string;
	slug: string;
	category: string;
	readingTime: number | null;
};

type CourtData = {
	court: {
		id: number;
		name: string;
		address: string | null;
		totalCourts: number | null;
		slug: string | null;
		imageUrl: string | null;
		reservationUrl: string | null;
		operatingPolicy: string | null;
		pricingInfo: string | null;
		surfaceType: string | null;
		facilities: string | null;
		parkingInfo: string | null;
		transitInfo: string | null;
		regionId: number | null;
		regionCode: string | null;
		regionName: string | null;
		naverMapUrl: string | null;
	};
	relatedTips: RelatedTip[];
};

const cache = new Map<string, { data: CourtData; timestamp: number }>();
const CACHE_TTL = 60_000;

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	setHeaders({ 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' });
	const { slug } = params;

	const cached = cache.get(slug);
	if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
		return cached.data;
	}

	try {
		// Fetch court data from database by slug
		const courtData = await db
			.select({
				id: courts.id,
				name: sql<string>`COALESCE(${courts.rawName}, ${courts.name})`,
				address: courts.address,
				totalCourts: courts.totalCourts,
				slug: courts.slug,
				imageUrl: courts.imageUrl,
				reservationUrl: courts.reservationUrl,
				operatingPolicy: courts.operatingPolicy,
				pricingInfo: courts.pricingInfo,
				surfaceType: courts.surfaceType,
				facilities: courts.facilities,
				parkingInfo: courts.parkingInfo,
				transitInfo: courts.transitInfo,
				regionId: courts.regionId,
				regionCode: regions.code,
				regionName: regions.name
			})
			.from(courts)
			.leftJoin(regions, eq(courts.regionId, regions.id))
			.where(eq(courts.slug, slug))
			.limit(1);

		// If court not found, return 404
		if (!courtData || courtData.length === 0) {
			throw error(404, {
				message: `테니스장을 찾을 수 없습니다: ${slug}`
			});
		}

		const court = courtData[0];

		// 코트와 글을 잇는 카테고리 근거가 DB에 없으므로 최신 3개를 링크한다.
		// 목적은 고립된 글로 내부 링크를 흘려보내는 것이다.
		// 글 링크는 보조 콘텐츠다 — 조회가 실패해도 코트 페이지는 정상 렌더되어야 한다.
		// (sitemap.xml/+server.ts가 쓰는 것과 같은 패턴)
		let relatedTips: RelatedTip[] = [];
		let relatedTipsFetchFailed = false;
		try {
			relatedTips = await db
				.select({
					title: tips.title,
					slug: tips.slug,
					category: tips.category,
					readingTime: tips.readingTime
				})
				.from(tips)
				.where(eq(tips.isPublished, true))
				.orderBy(desc(tips.lastUpdated))
				.limit(3);
		} catch (err) {
			console.error('Failed to fetch related tips for court page:', err);
			relatedTipsFetchFailed = true;
		}

		const data = {
			court: {
				...court,
				// 본문이 SSR HTML에 포함되어야 색인과 AdSense 문맥 매칭이 동작한다.
				// renderMarkdown은 null/빈 문자열에 ''를 반환하므로
				// 페이지의 {#if court.operatingPolicy} 가드가 그대로 유효하다.
				operatingPolicy: renderMarkdown(court.operatingPolicy),
				pricingInfo: renderMarkdown(court.pricingInfo),
				parkingInfo: renderMarkdown(court.parkingInfo),
				transitInfo: renderMarkdown(court.transitInfo),
				naverMapUrl: court.address
					? `https://map.naver.com/v5/search/${encodeURIComponent(court.address)}`
					: null
			},
			relatedTips
		};
		// 글 조회가 실패해 relatedTips가 빈 배열로 채워진 경우, 이 결과를 캐시하면
		// CDN이 최대 1시간 동안 "글 없음" 페이지를 서빙하게 된다 — 다음 요청이 재시도하도록
		// 캐시를 건너뛴다. 응답 헤더(s-maxage 등)는 그대로 둔다.
		if (!relatedTipsFetchFailed) {
			cache.set(slug, { data, timestamp: Date.now() });
		}
		return data;
	} catch (err) {
		// If it's already an error object, rethrow
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		// Otherwise, log and return 500
		console.error(`Error loading court detail for slug ${slug}:`, err);
		throw error(500, {
			message: '테니스장 정보를 불러오는 중 오류가 발생했습니다.'
		});
	}
};
