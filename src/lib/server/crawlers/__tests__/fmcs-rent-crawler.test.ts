import { describe, it, expect, vi } from 'vitest';

vi.mock('../../db/client', () => ({ db: {} }));

import { parseFmcsSlots } from '../api-based/fmcs-rent-crawler';

const slot = (use_yn: string, rent_no: number) => ({
	date: '20261102',
	start_time: '06:00',
	end_time: '08:00',
	use_yn,
	rent_no
});

describe('parseFmcsSlots', () => {
	it('N은 예약가능, Y(rent_no>0)·E는 예약완료로 변환하고 날짜를 YYYY-MM-DD로 바꾼다', () => {
		const result = parseFmcsSlots([slot('N', 0), slot('Y', 925050), slot('E', 0)], '군포', 61);
		expect(result.map((r) => r.status)).toEqual(['available', 'reserved', 'reserved']);
		expect(result[0]).toMatchObject({
			date: '2026-11-02',
			startTime: '06:00',
			endTime: '08:00',
			courtId: 61
		});
	});

	it('예약 창 밖(Y + rent_no=0)은 건너뛴다', () => {
		expect(parseFmcsSlots([slot('Y', 0)], '군포', 61)).toEqual([]);
	});
});
