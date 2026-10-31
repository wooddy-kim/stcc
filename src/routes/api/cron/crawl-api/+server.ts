import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { waitUntil } from '@vercel/functions';
import { assertAuthorized } from '$lib/server/cron-auth';
import { runCrawl } from '$lib/server/crawlers/crawler-runner';

export const config = {
	regions: ['icn1'],
	maxDuration: 300
};

const DEFAULT_YONGIN_GROUPS = 2;

/**
 * 용인은 origin이 Vercel IP를 약 2.6 req/s로 조인다(2026-08-10 측정). 한 회차에 전
 * 시설을 돌면 크롤 데드라인을 넘기므로, 크론을 시각을 달리해 두 번 호출하고 회차마다
 * 절반씩 맡는다: `?group=0`, `?group=1`.
 *
 * 화성은 제약이 없고 68요청이면 끝나므로 매 회차 전부 돈다. group을 안 주면
 * (CLI·수동 실행) 예전처럼 전부 돈다.
 */
export const GET: RequestHandler = async ({ request, url }) => {
	assertAuthorized(request);

	const groups = Math.max(Number(url.searchParams.get('groups') ?? DEFAULT_YONGIN_GROUPS), 1);
	const rawIndex = Number(url.searchParams.get('group'));
	const yonginGroup =
		Number.isInteger(rawIndex) && rawIndex >= 0
			? { index: rawIndex % groups, total: groups }
			: undefined;

	// 반드시 순차로 돈다. runCrawl은 저장 직렬화 limiter를 호출마다 새로 만들므로,
	// 동시에 두 번 부르면 저장이 병렬이 되어 커넥션 1개(max:1)에서 영구히 멈춘다.
	// 화성이 10초쯤에 먼저 끝나 저장까지 마치고, 그 뒤 용인이 돈다(최대 180초).
	const work = (async () => {
		await runCrawl({ types: ['HWASEONG_API'] });
		await runCrawl({ types: ['YONGIN_API'], group: yonginGroup });
	})().catch((err) => {
		console.error('[cron/crawl-api] 백그라운드 크롤링 실패:', err);
	});

	if (process.env.VERCEL) {
		waitUntil(work);
	} else {
		await work;
	}

	return json(
		{
			accepted: true,
			target: 'api',
			yonginGroup: yonginGroup ?? 'all',
			startedAt: new Date().toISOString()
		},
		{ status: 202 }
	);
};
