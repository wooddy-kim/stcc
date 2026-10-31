import { describe, it, expect, vi } from 'vitest';
import { reservations, crawlLogs } from '../../db/schema';

const deleteMock = vi.fn();

vi.mock('../../db/client', () => ({
	db: {
		delete: (...args: unknown[]) => {
			deleteMock(...args);
			return {
				where: () => ({
					returning: () => Promise.resolve([{ id: 1 }, { id: 2 }])
				})
			};
		}
	}
}));

import { cleanupOldData } from '../cleanup-service';

describe('cleanupOldData', () => {
	it('reservations/crawl_logs 두 테이블 삭제, 삭제 건수 반환', async () => {
		const result = await cleanupOldData(30);
		expect(result.deletedReservations).toBe(2);
		expect(result.deletedCrawlLogs).toBe(2);
		expect(deleteMock).toHaveBeenCalledTimes(2);
		expect(deleteMock).toHaveBeenCalledWith(reservations);
		expect(deleteMock).toHaveBeenCalledWith(crawlLogs);
	});
});
