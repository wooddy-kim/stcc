import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/client';
import { redirect } from '@sveltejs/kit';
import { courts, regions, reservations, tips } from '$lib/server/db/schema';
import { and, eq, gte, sql, desc } from 'drizzle-orm';

type CourtEntry = {
	id: number;
	name: string;
	slug: string | null;
	address: string | null;
	regionName: string | null;
	regionCode: string | null;
	totalCourts: number | null;
};
type RegionEntry = { code: string; name: string };
type TipEntry = { title: string; slug: string; category: string; difficulty: string };
type HomeData = {
	courts: CourtEntry[];
	regions: RegionEntry[];
	/** 최근 24시간 안에 수집된 데이터가 있는 마지막 날짜 ('YYYY-MM-DD'). 날짜 띠의 끝. */
	lastDay: string | null;
	tips: TipEntry[];
};

const cache = new Map<string, { data: HomeData; timestamp: number }>();
const CACHE_TTL = 60_000;

export const load: PageServerLoad = async ({ url, setHeaders }) => {
	// 예전 홈은 ?courtId=로 코트 하나를 보여 줬다. 그 역할은 코트 상세의 시간표로 옮겼으므로
	// 북마크·외부 링크는 상세로 보낸다.
	const courtIdParam = url.searchParams.get('courtId');
	// 자릿수 제한: int4 범위를 넘는 값은 DB가 에러를 내 홈 전체가 500이 된다
	if (courtIdParam && /^\d{1,9}$/.test(courtIdParam)) {
		const [target] = await db
			.select({ slug: courts.slug })
			.from(courts)
			.where(eq(courts.id, Number(courtIdParam)))
			.limit(1);
		if (target?.slug) {
			// 예전 지도 링크의 ?date=를 넘겨 상세에서 그 날짜를 강조한다
			const date = url.searchParams.get('date');
			const query = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? `?date=${date}` : '';
			redirect(301, `/courts/${target.slug}${query}`);
		}
	}

	setHeaders({ 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' });

	const cached = cache.get('all');
	if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
		return cached.data;
	}

	const courtsQuery = db
		.select({
			id: courts.id,
			name: sql<string>`COALESCE(${courts.rawName}, ${courts.name})`,
			slug: courts.slug,
			address: courts.address,
			regionName: regions.name,
			regionCode: regions.code,
			totalCourts: courts.totalCourts
		})
		.from(courts)
		.leftJoin(regions, eq(courts.regionId, regions.id))
		.where(eq(courts.isActive, true));

	// 지역 탭. 예정 슬롯이 있는 지역만 (크롤러 없는 지역은 탭이 생기지 않는다).
	const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
	const today = new Date(
		Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate())
	);
	const regionsQuery = db
		.selectDistinct({ id: regions.id, code: regions.code, name: regions.name })
		.from(regions)
		.innerJoin(courts, and(eq(courts.regionId, regions.id), eq(courts.isActive, true)))
		.innerJoin(reservations, eq(reservations.courtId, courts.id))
		.where(gte(reservations.date, today))
		.orderBy(regions.id);

	// /api/reservations의 신선도 기준(24시간)과 맞춘다
	const lastDayQuery = db
		.select({ day: sql<string | null>`to_char(max(${reservations.date}), 'YYYY-MM-DD')` })
		.from(reservations)
		.where(
			and(
				gte(reservations.date, today),
				sql`${reservations.crawledAt} > (now() at time zone 'UTC') - interval '24 hours'`
			)
		);

	// 게이트웨이 컴포넌트용. 클라이언트 fetch를 없애 글 링크가 SSR HTML에 들어가게 한다.
	// tips는 보조 콘텐츠다 — 조회가 실패해도 홈페이지(코트 현황 + 광고)는 정상 렌더되어야 한다.
	// (courts/[slug]/+page.server.ts, sitemap.xml/+server.ts와 같은 패턴)
	const tipsQuery = db
		.select({
			title: tips.title,
			slug: tips.slug,
			category: tips.category,
			difficulty: tips.difficulty
		})
		.from(tips)
		.where(eq(tips.isPublished, true))
		.orderBy(desc(tips.lastUpdated))
		.limit(6)
		.catch((err): TipEntry[] => {
			console.error('Failed to fetch tips for home page:', err);
			return [];
		});

	// courts 조회는 의도적으로 catch하지 않는다 — 코트 목록 없이는 홈페이지가 렌더될 수
	// 없으므로, 실패 시 지금과 동일하게 SvelteKit이 500으로 처리하도록 그대로 전파한다.
	const [courtsData, regionRows, lastDayRows, tipsData] = await Promise.all([
		courtsQuery,
		regionsQuery,
		lastDayQuery,
		tipsQuery
	]);

	const data: HomeData = {
		courts: courtsData,
		regions: regionRows.map(({ code, name }) => ({ code, name })),
		lastDay: lastDayRows[0]?.day ?? null,
		tips: tipsData
	};
	cache.set('all', { data, timestamp: Date.now() });
	return data;
};
