import { describe, it, expect } from 'vitest';
import {
	kstNow,
	addDays,
	chipOf,
	isChipPast,
	defaultSelection,
	keepOrResetHour,
	faceCount,
	regionShortName,
	openSlots,
	freeHours,
	availabilityAt,
	buildTable,
	chipCounts,
	formatFreeRanges,
	timetableDays,
	barBlocks,
	dateRange,
	MAX_RANGE_DAYS,
	MAX_DAYS_AHEAD
} from '../time-first';

describe('kstNow', () => {
	it('UTC 15:30은 KST 다음날 00:30', () => {
		expect(kstNow(new Date('2026-10-25T15:30:00Z'))).toEqual({ date: '2026-10-26', minutes: 30 });
	});
});

describe('addDays', () => {
	it('월 경계를 넘긴다', () => {
		expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
	});
	it('음수도 된다', () => {
		expect(addDays('2026-11-01', -1)).toBe('2026-10-31');
	});
});

describe('chipOf', () => {
	it.each([
		['06:00', 6],
		['07:00', 6],
		['13:00', 12],
		['15:00', 14],
		['20:00', 20],
		['21:00', 20],
		['05:00', 6]
	])('%s → %i', (t, h) => {
		expect(chipOf(t)).toBe(h);
	});
});

describe('defaultSelection', () => {
	it('19:48 → 오늘 20시', () => {
		expect(defaultSelection({ date: '2026-10-25', minutes: 19 * 60 + 48 })).toEqual({
			date: '2026-10-25',
			hour: 20
		});
	});
	it('18:00 정각이면 18시는 이미 시작했으므로 20시', () => {
		expect(defaultSelection({ date: '2026-10-25', minutes: 18 * 60 })).toEqual({
			date: '2026-10-25',
			hour: 20
		});
	});
	it('20:00 이후면 내일 6시', () => {
		expect(defaultSelection({ date: '2026-10-25', minutes: 20 * 60 })).toEqual({
			date: '2026-10-26',
			hour: 6
		});
	});
	it('새벽 01:00이면 오늘 6시', () => {
		expect(defaultSelection({ date: '2026-10-26', minutes: 60 })).toEqual({
			date: '2026-10-26',
			hour: 6
		});
	});
});

describe('isChipPast / keepOrResetHour', () => {
	const now = { date: '2026-10-25', minutes: 15 * 60 };

	it('오늘 14시는 지났고 16시와 내일 14시는 아니다', () => {
		expect(isChipPast('2026-10-25', 14, now)).toBe(true);
		expect(isChipPast('2026-10-25', 16, now)).toBe(false);
		expect(isChipPast('2026-10-26', 14, now)).toBe(false);
	});
	it('다른 날로 넘기면 고른 시간을 유지한다', () => {
		expect(keepOrResetHour('2026-10-26', 8, now)).toBe(8);
	});
	it('오늘로 돌아왔는데 지난 시간이면 기본값으로 돌린다', () => {
		expect(keepOrResetHour('2026-10-25', 8, now)).toBe(16);
	});
	it('오늘 칩이 모두 지났으면 고른 시간을 그대로 둔다', () => {
		expect(keepOrResetHour('2026-10-25', 8, { date: '2026-10-25', minutes: 21 * 60 })).toBe(8);
	});
});

describe('faceCount', () => {
	it.each([
		['1,2,3', 3],
		['B, C', 2],
		['D', 1],
		['장애인', 1],
		[null, null],
		['', null],
		[' , ', null]
	])('%s → %s', (s, n) => {
		expect(faceCount(s)).toBe(n);
	});
});

describe('regionShortName', () => {
	it.each([
		['용인시', '용인'],
		['강남구', '강남'],
		['수원', '수원']
	])('%s → %s', (a, b) => {
		expect(regionShortName(a)).toBe(b);
	});
});

describe('보드', () => {
	const s = (
		courtId: number,
		startTime: string,
		endTime: string,
		availableCourts: string | null = '1',
		status = 'available'
	) => ({ courtId, startTime, endTime, status, availableCourts });
	const now = { date: '2026-10-25', minutes: 15 * 60 };

	it('openSlots: 오늘은 이미 시작한 슬롯·reserved를 빼고, 내일은 available 전부', () => {
		const rows = [
			s(1, '14:00', '16:00'),
			s(1, '16:00', '18:00'),
			s(1, '18:00', '20:00', '1', 'reserved')
		];
		expect(openSlots(rows, '2026-10-25', now).map((r) => r.startTime)).toEqual(['16:00']);
		expect(openSlots(rows, '2026-10-26', now)).toHaveLength(2);
	});

	it('freeHours: 2시간 블록은 두 칸을 채운다', () => {
		expect(freeHours([s(1, '08:00', '10:00'), s(1, '20:00', '22:00')])).toEqual([8, 9, 20, 21]);
	});

	it('availabilityAt: 같은 칩의 12·13시 중 면 수가 큰 쪽', () => {
		expect(
			availabilityAt([s(1, '12:00', '13:00', '1'), s(1, '13:00', '14:00', 'B, C')], 12)
		).toEqual({ faces: 2 });
	});

	it('availabilityAt: 면 수를 모르면 faces null, 슬롯이 없으면 null', () => {
		expect(availabilityAt([s(1, '18:00', '20:00', null)], 18)).toEqual({ faces: null });
		expect(availabilityAt([s(1, '18:00', '20:00')], 8)).toBeNull();
	});

	it('chipCounts: 칩마다 빈 코트 수', () => {
		expect(
			chipCounts(
				[{ id: 1 }, { id: 2 }],
				[s(1, '18:00', '20:00'), s(2, '19:00', '20:00'), s(2, '08:00', '10:00')]
			)
		).toMatchObject({ 8: 1, 18: 2, 20: 0 });
	});

	it('formatFreeRanges: 연속 칸을 묶는다', () => {
		expect(formatFreeRanges([6, 7, 8, 9, 18, 19])).toBe('6~10시, 18~20시 가능');
		expect(formatFreeRanges([])).toBe('빈 시간 없음');
	});
});

describe('수집 정보 없음 구분', () => {
	const s = (courtId: number, startTime: string, endTime: string) => ({
		courtId,
		startTime,
		endTime,
		status: 'available',
		availableCourts: '1'
	});
	it('MAX_DAYS_AHEAD는 용인 크롤러 수집 범위(오늘~13일 뒤)와 같다', () => {
		expect(MAX_DAYS_AHEAD).toBe(13);
	});
	it('timetableDays: 날짜별 남은 슬롯과 수집 여부', () => {
		const now = { date: '2026-10-25', minutes: 15 * 60 };
		const rows = [
			{ ...s(1, '14:00', '16:00'), day: '2026-10-25' },
			{ ...s(1, '08:00', '10:00'), day: '2026-10-26', status: 'reserved' }
		];
		const days = timetableDays(rows, now, 3);
		expect(days.map((d) => [d.day, d.slots.length, d.reported])).toEqual([
			['2026-10-25', 0, true],
			['2026-10-26', 0, true],
			['2026-10-27', 0, false]
		]);
	});
});

describe('buildTable', () => {
	const s = (courtId: number, startTime: string, endTime: string, availableCourts = '1') => ({
		courtId,
		startTime,
		endTime,
		status: 'available',
		availableCourts
	});
	const courts = [
		{ id: 1, name: '여울', regionCode: 'hw' },
		{ id: 2, name: '백암', regionCode: 'yi' },
		{ id: 3, name: '기흥', regionCode: 'yi' },
		{ id: 4, name: '망포', regionCode: 'sw' }
	];
	const regions = ['sw', 'yi', 'hw'];

	it('관심 코트 → 지역 순서 → 이름순으로 고정, 가능 여부와 무관', () => {
		const t = buildTable(
			courts,
			[s(1, '18:00', '20:00', '1,2,3')],
			18,
			[2],
			regions,
			new Set([1, 2, 3, 4])
		);
		expect(t.map((sec) => [sec.key, sec.rows.map((r) => r.court.id)])).toEqual([
			['favorites', [2]],
			['sw', [4]],
			['yi', [3]],
			['hw', [1]]
		]);
	});

	it('시간을 바꿔도 순서가 같다', () => {
		const slots = [s(1, '18:00', '20:00'), s(3, '08:00', '10:00')];
		const ids = (h: number) =>
			buildTable(courts, slots, h, [], regions, new Set([1, 2, 3, 4])).flatMap((sec) =>
				sec.rows.map((r) => r.court.id)
			);
		expect(ids(8)).toEqual(ids(18));
	});

	it('상태: 가능(면 수) / 마감 / 정보 없음', () => {
		const t = buildTable(
			courts,
			[s(1, '18:00', '20:00', '1,2,3')],
			18,
			[],
			regions,
			new Set([1, 3])
		);
		const byId = new Map(t.flatMap((sec) => sec.rows).map((r) => [r.court.id, r.status]));
		expect(byId.get(1)).toEqual({ kind: 'open', faces: 3 });
		expect(byId.get(3)).toEqual({ kind: 'closed' });
		expect(byId.get(4)).toEqual({ kind: 'unknown' });
	});

	it('빈 섹션은 만들지 않는다', () => {
		const t = buildTable([courts[0]], [], 18, [], regions, new Set([1]));
		expect(t.map((sec) => sec.key)).toEqual(['hw']);
	});
});

describe('barBlocks', () => {
	const s = (startTime: string, endTime: string, availableCourts: string | null) => ({
		courtId: 1,
		startTime,
		endTime,
		status: 'available',
		availableCourts
	});
	it('슬롯마다 막대 열 위치·폭과 면 수·면 이름', () => {
		expect(barBlocks([s('08:00', '10:00', '1,2,3'), s('13:00', '14:00', 'B, C')])).toEqual([
			{ col: 3, span: 2, faces: 3, names: ['1', '2', '3'] },
			{ col: 8, span: 1, faces: 2, names: ['B', 'C'] }
		]);
	});
	it('면 정보가 없으면 faces null, names 빈 배열', () => {
		expect(barBlocks([s('20:00', '22:00', null)])).toEqual([
			{ col: 15, span: 2, faces: null, names: [] }
		]);
	});
	it('막대 범위(6~22시) 밖은 잘라낸다', () => {
		expect(barBlocks([s('05:00', '07:00', '1'), s('21:00', '23:00', '1')])).toEqual([
			{ col: 1, span: 1, faces: 1, names: ['1'] },
			{ col: 16, span: 1, faces: 1, names: ['1'] }
		]);
	});
});

describe('dateRange', () => {
	it('시작~끝 날짜를 포함해 나열한다', () => {
		expect(dateRange('2026-10-30', '2026-11-02')).toEqual([
			'2026-10-30',
			'2026-10-31',
			'2026-11-01',
			'2026-11-02'
		]);
	});
	it('끝이 시작보다 앞이면 시작 하루만', () => {
		expect(dateRange('2026-10-30', '2026-10-01')).toEqual(['2026-10-30']);
	});
	it('너무 길면 MAX_RANGE_DAYS로 자른다', () => {
		expect(dateRange('2026-10-01', '2027-12-31')).toHaveLength(MAX_RANGE_DAYS + 1);
	});
});
