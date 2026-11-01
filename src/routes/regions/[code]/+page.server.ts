import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/client';
import { courts, regions, reservations } from '$lib/server/db/schema';
import { and, asc, count, eq, gt, gte, inArray, isNotNull, lt, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	// DB 코드는 대소문자가 섞여 있다(yongin, GUNPO). URL은 소문자 하나로 통일한다.
	const code = params.code.toLowerCase();
	if (params.code !== code) redirect(301, `/regions/${code}`);

	setHeaders({ 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' });

	const [region] = await db
		.select({ id: regions.id, code: regions.code, name: regions.name })
		.from(regions)
		.where(sql`lower(${regions.code}) = ${code}`)
		.limit(1);
	if (!region) error(404, { message: `지역을 찾을 수 없습니다: ${params.code}` });

	const courtRows = await db
		.select({
			id: courts.id,
			name: sql<string>`COALESCE(${courts.rawName}, ${courts.name})`,
			slug: courts.slug,
			address: courts.address,
			totalCourts: courts.totalCourts
		})
		.from(courts)
		.where(and(eq(courts.regionId, region.id), eq(courts.isActive, true), isNotNull(courts.slug)))
		.orderBy(asc(courts.id));
	// 코트가 없는 지역은 얇은 페이지라 색인시키지 않는다
	if (courtRows.length === 0) error(404, { message: `테니스장이 없는 지역입니다: ${params.code}` });

	// 오늘 남은 빈 시간대 수. 홈(+page.server.ts)과 같은 KST 날짜·24시간 신선도 기준.
	const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
	const today = new Date(
		Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate())
	);
	const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
	const nowHHMM = kstNow.toISOString().slice(11, 16);

	// 보조 정보다 — 실패해도 코트 목록은 렌더되어야 한다
	const freeRows = await db
		.select({ courtId: reservations.courtId, free: count() })
		.from(reservations)
		.where(
			and(
				inArray(
					reservations.courtId,
					courtRows.map((c) => c.id)
				),
				gte(reservations.date, today),
				lt(reservations.date, tomorrow),
				eq(reservations.status, 'available'),
				gt(reservations.startTime, nowHHMM),
				sql`${reservations.crawledAt} > (now() at time zone 'UTC') - interval '24 hours'`
			)
		)
		.groupBy(reservations.courtId)
		.catch((err) => {
			console.error('Failed to fetch free slots for region page:', err);
			return [];
		});
	const freeByCourt = new Map(freeRows.map((r) => [r.courtId, r.free]));

	// 다른 지역으로 가는 링크 (코트가 있는 지역만)
	const otherRegions = await db
		.selectDistinct({ id: regions.id, code: regions.code, name: regions.name })
		.from(regions)
		.innerJoin(
			courts,
			and(eq(courts.regionId, regions.id), eq(courts.isActive, true), isNotNull(courts.slug))
		)
		.where(sql`${regions.id} <> ${region.id}`)
		.orderBy(asc(regions.id));

	return {
		region: { code, name: region.name },
		// 0은 "만석"과 "수집 안 됨"을 구분할 수 없어 화면에서는 0이면 표시하지 않는다
		courts: courtRows.map((c) => ({ ...c, freeToday: freeByCourt.get(c.id) ?? 0 })),
		otherRegions: otherRegions.map((r) => ({ code: r.code.toLowerCase(), name: r.name }))
	};
};
