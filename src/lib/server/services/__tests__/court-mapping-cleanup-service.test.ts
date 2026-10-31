import { describe, it, expect, vi, beforeEach } from 'vitest';
import { courtApiMappings } from '../../db/schema';

const selectRows = vi.fn();
const deleteMock = vi.fn();

vi.mock('../../db/client', () => ({
	db: {
		select: () => ({
			from: () => ({
				where: () => Promise.resolve(selectRows())
			})
		}),
		delete: (...args: unknown[]) => {
			deleteMock(...args);
			return {
				where: () => ({
					returning: () => Promise.resolve(selectRows().map((r: { id: number }) => ({ id: r.id })))
				})
			};
		}
	}
}));

import {
	pruneStaleCourtMappings,
	summarizeByYearMonth,
	getCurrentYearMonth,
	assertValidYearMonth
} from '../court-mapping-cleanup-service';

const row = (id: number, yearMonth: string, facilityKey = 'YONGIN') => ({
	id,
	facilityKey,
	yearMonth,
	apiCourtId: 13000 + id,
	courtNumber: '1'
});

beforeEach(() => {
	selectRows.mockReset();
	deleteMock.mockReset();
});

describe('getCurrentYearMonth', () => {
	it('YYYY-MM 형식으로 현재 월을 반환한다', () => {
		expect(getCurrentYearMonth(new Date(2026, 7, 15))).toBe('2026-08');
		expect(getCurrentYearMonth(new Date(2026, 0, 1))).toBe('2026-01');
	});
});

describe('assertValidYearMonth', () => {
	it('올바른 형식은 통과한다', () => {
		expect(() => assertValidYearMonth('2026-08')).not.toThrow();
	});

	it.each(['STATIC', '2026-13', '2026-00', '2026-8', '', '20260801'])(
		'잘못된 형식 "%s"은 throw 한다',
		(bad) => {
			expect(() => assertValidYearMonth(bad)).toThrow(/YYYY-MM/);
		}
	);
});

describe('summarizeByYearMonth', () => {
	it('yearMonth별 건수를 오름차순으로 집계한다', () => {
		const result = summarizeByYearMonth([
			row(1, '2026-06'),
			row(2, '2026-05'),
			row(3, '2026-06'),
			row(4, '2026-01')
		]);
		expect(result).toEqual([
			{ yearMonth: '2026-01', count: 1 },
			{ yearMonth: '2026-05', count: 1 },
			{ yearMonth: '2026-06', count: 2 }
		]);
	});
});

describe('pruneStaleCourtMappings', () => {
	it('cutoff 이전 매핑을 삭제하고 건수/집계를 반환한다', async () => {
		selectRows.mockReturnValue([row(1, '2026-05'), row(2, '2026-06'), row(3, '2026-06')]);

		const result = await pruneStaleCourtMappings('2026-07');

		expect(deleteMock).toHaveBeenCalledTimes(1);
		expect(deleteMock).toHaveBeenCalledWith(courtApiMappings);
		expect(result.cutoff).toBe('2026-07');
		expect(result.deletedCount).toBe(3);
		expect(result.byYearMonth).toEqual([
			{ yearMonth: '2026-05', count: 1 },
			{ yearMonth: '2026-06', count: 2 }
		]);
		expect(result.rows).toHaveLength(3);
	});

	it('dry-run이면 삭제하지 않고 대상만 집계한다', async () => {
		selectRows.mockReturnValue([row(1, '2026-06')]);

		const result = await pruneStaleCourtMappings('2026-07', true);

		expect(deleteMock).not.toHaveBeenCalled();
		expect(result.deletedCount).toBe(0);
		expect(result.rows).toHaveLength(1);
		expect(result.byYearMonth).toEqual([{ yearMonth: '2026-06', count: 1 }]);
	});

	it('대상이 없으면 삭제를 호출하지 않는다', async () => {
		selectRows.mockReturnValue([]);

		const result = await pruneStaleCourtMappings('2026-07');

		expect(deleteMock).not.toHaveBeenCalled();
		expect(result.deletedCount).toBe(0);
		expect(result.byYearMonth).toEqual([]);
	});

	it('잘못된 cutoff는 삭제를 시도하지 않고 throw 한다', async () => {
		await expect(pruneStaleCourtMappings('STATIC')).rejects.toThrow(/YYYY-MM/);
		expect(deleteMock).not.toHaveBeenCalled();
	});
});
