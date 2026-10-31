/**
 * 오래된 데이터 정리 서비스
 * - retentionDays 이전 reservations(date 기준), crawl_logs(createdAt 기준) 삭제
 */
import { db } from '../db/client.js';
import { reservations, crawlLogs } from '../db/schema.js';
import { lt } from 'drizzle-orm';

export interface CleanupResult {
	deletedReservations: number;
	deletedCrawlLogs: number;
}

export async function cleanupOldData(retentionDays = 30): Promise<CleanupResult> {
	const cutoff = new Date();
	cutoff.setDate(cutoff.getDate() - retentionDays);
	cutoff.setHours(0, 0, 0, 0);

	const reservationsResult = await db
		.delete(reservations)
		.where(lt(reservations.date, cutoff))
		.returning({ id: reservations.id });

	const crawlLogsResult = await db
		.delete(crawlLogs)
		.where(lt(crawlLogs.createdAt, cutoff))
		.returning({ id: crawlLogs.id });

	return {
		deletedReservations: reservationsResult.length,
		deletedCrawlLogs: crawlLogsResult.length
	};
}
