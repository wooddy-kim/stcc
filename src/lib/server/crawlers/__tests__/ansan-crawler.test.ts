import { describe, it, expect, vi } from 'vitest';

vi.mock('../../db/client', () => ({ db: {} }));

import { parseAnsanResponse, type AnsanApiResponse } from '../api-based/ansan-crawler';

// 2026-11-01 실제 응답(searchSisul=111)에서 08-10 시간대만 추린 것 + 휴무·타 시설 행 추가
const fixture = (): AnsanApiResponse => ({
	flag: true,
	todayStr: '2026-11-01',
	cols: [{ fullDate: '2026-10-31' }, { fullDate: '2026-11-01' }, { fullDate: '2026-11-02' }],
	rows: [
		{ sisulNum: 111, timeNum: 970, timeName: '해양연구원(임시)테니스장 1코트(08-10)' },
		{ sisulNum: 111, timeNum: 972, timeName: '해양연구원(임시)테니스장 3코트(08-10)' },
		{ sisulNum: 111, timeNum: 973, timeName: '해양연구원(임시)테니스장 4코트(08-10)' },
		{ sisulNum: 111, timeNum: 999, timeName: '해양연구원 야간' },
		{ sisulNum: 87, timeNum: 455, timeName: '각골테니스장 1코트(08-10)' }
	],
	revdata: [
		{ sisulNum: 111, timeNum: 970, reservationDay: '2026-11-01' },
		{ sisulNum: 111, timeNum: 972, reservationDay: '2026-11-01' },
		{ sisulNum: 111, timeNum: 973, reservationDay: '2026-11-01' },
		{ sisulNum: 111, timeNum: 973, reservationDay: '2026-11-02' }
	],
	offdays: []
});

describe('parseAnsanResponse', () => {
	it('예약 안 된 코트만 모아 (날짜, 시작시간)별 1건으로 만든다', () => {
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		const result = parseAnsanResponse(fixture(), 111, '안산 해양연구원');

		expect(result).toEqual([
			{
				courtName: '안산 해양연구원',
				courtNumber: '',
				date: '2026-11-01',
				startTime: '08:00',
				endTime: '10:00',
				status: 'reserved'
			},
			{
				courtName: '안산 해양연구원',
				courtNumber: '1,3',
				date: '2026-11-02',
				startTime: '08:00',
				endTime: '10:00',
				status: 'available'
			}
		]);
	});

	it('todayStr 이전 날짜는 건너뛴다 (revdata에 없어도 예약가능으로 내보내지 않음)', () => {
		const result = parseAnsanResponse(fixture(), 111, '안산');
		expect(result.map((r) => r.date)).not.toContain('2026-10-31');
	});

	it('해당 시설 휴무일은 내보내지 않는다', () => {
		const data = fixture();
		data.offdays = [
			{ sisulNum: 111, offdayDate: '2026-11-02' },
			{ sisulNum: 5, offdayDate: '2026-11-01' }
		];
		expect(parseAnsanResponse(data, 111, '안산').map((r) => r.date)).toEqual(['2026-11-01']);
	});

	it('timeName 형식이 다르면 경고 후 그 행만 건너뛴다', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		parseAnsanResponse(fixture(), 111, '안산');
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('해양연구원 야간'));
	});

	it('flag:false(예약 가능일 아님)는 빈 결과', () => {
		expect(
			parseAnsanResponse({ flag: false, msg: '아직 잔여석 예약 가능일이 아닙니다.' }, 111, '안산')
		).toEqual([]);
	});

	it('flag:true인데 rows가 없으면 오류', () => {
		expect(() => parseAnsanResponse({ flag: true }, 111, '안산')).toThrow('Invalid');
	});
});
