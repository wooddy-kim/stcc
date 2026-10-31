import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/client';
import { courts, regions } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { CacheManager } from '$lib/utils/cache-manager';


// EnhancedCache를 사용한 캐싱
const cacheManager = CacheManager.getInstance();
const courtsCache = cacheManager.createCache('courts', {
	ttl: 300000, // 5분
	maxSize: 50,
	cleanupInterval: 60000 // 1분마다 정리
});

export const GET: RequestHandler = async ({ url }) => {
	try {
		const regionCode = url.searchParams.get('region');

		// 캐시 키 생성
		const cacheKey = regionCode || 'all';

		// 캐시 확인
		const cached = courtsCache.get(cacheKey);
		if (cached) {
			return json(cached, {
				headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' }
			});
		}

		let query = db
			.select({
				id: courts.id,
				name: sql<string>`COALESCE(${courts.rawName}, ${courts.name})`,
				address: courts.address,
				totalCourts: courts.totalCourts,
				slug: courts.slug,
				regionId: courts.regionId,
				regionCode: regions.code,
				regionName: regions.name,
				// 테니스장 상세 정보
				imageUrl: courts.imageUrl,
				reservationUrl: courts.reservationUrl,
				operatingPolicy: courts.operatingPolicy,
				pricingInfo: courts.pricingInfo
			})
			.from(courts)
			.leftJoin(regions, eq(courts.regionId, regions.id))
			.where(eq(courts.isActive, true))
			.orderBy(courts.id);

		const result = await query;

		// Filter by region if specified
		const rawResult = regionCode
			? result.filter((court) => court.regionCode === regionCode)
			: result;

		// naverMapUrl을 address 기반으로 동적 생성
		const filteredResult = rawResult.map((court) => ({
			...court,
			naverMapUrl: court.address
				? `https://map.naver.com/v5/search/${encodeURIComponent(court.address)}`
				: null
		}));

		const response = {
			success: true,
			data: filteredResult
		};

		// 캐시에 저장
		courtsCache.set(cacheKey, response);

		return json(response, {
			headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' }
		});
	} catch (error) {
		console.error('Failed to fetch courts:', error);
		return json(
			{
				success: false,
				error: 'Failed to fetch courts'
			},
			{ status: 500, headers: { 'Cache-Control': 'no-store' } }
		);
	}
};
