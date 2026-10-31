/**
 * cron 라우트 인증
 * cron-job.org가 보내는 Authorization: Bearer <CRON_SECRET> 헤더를 검증한다.
 */
import { error } from '@sveltejs/kit';

export function assertAuthorized(request: Request): void {
	const secret = process.env.CRON_SECRET;
	if (!secret) {
		throw error(500, 'CRON_SECRET not configured');
	}
	const header = request.headers.get('authorization');
	if (header !== `Bearer ${secret}`) {
		throw error(401, 'Unauthorized');
	}
}
