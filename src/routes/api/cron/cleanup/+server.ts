import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { assertAuthorized } from '$lib/server/cron-auth';
import { cleanupOldData } from '$lib/server/services/cleanup-service';

export const config = {
	regions: ['icn1'],
	maxDuration: 60
};

export const GET: RequestHandler = async ({ request }) => {
	assertAuthorized(request);
	const result = await cleanupOldData();
	return json({ ok: true, ...result });
};
