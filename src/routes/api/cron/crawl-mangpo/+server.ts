import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { waitUntil } from '@vercel/functions';
import { assertAuthorized } from '$lib/server/cron-auth';
import { runCrawl } from '$lib/server/crawlers/crawler-runner';

export const config = {
	regions: ['icn1'],
	maxDuration: 300,
	memory: 2048
};

export const GET: RequestHandler = async ({ request }) => {
	assertAuthorized(request);

	const work = runCrawl({ types: ['PLAYWRIGHT'] }).catch((err) => {
		console.error('[cron/crawl-mangpo] 백그라운드 크롤링 실패:', err);
	});

	if (process.env.VERCEL) {
		waitUntil(work);
	} else {
		await work;
	}

	return json(
		{ accepted: true, target: 'mangpo', startedAt: new Date().toISOString() },
		{ status: 202 }
	);
};
