/**
 * 홈 "시간 먼저" 화면의 순수 로직.
 *
 * 날짜는 전부 KST 기준 'YYYY-MM-DD' 문자열로 다룬다. reservations.date는 naive timestamp라
 * 브라우저에서 new Date()로 되읽으면 로컬 타임존만큼 밀린다.
 */

/** 시간 칩. 대부분 코트가 2시간 블록(06, 08, …, 20)이라 2시간 간격이다. */
export const CHIP_HOURS: readonly number[] = [6, 8, 10, 12, 14, 16, 18, 20];
/** 하루 막대의 시간 칸 */
export const BAR_HOURS: readonly number[] = Array.from({ length: 16 }, (_, i) => 6 + i);
/**
 * 날짜를 앞으로 넘길 수 있는 최대 일수.
 * 용인 크롤러의 먼 날 수집 범위(YONGIN_FAR_HORIZON_DAYS = 31일 = 오늘~30일 뒤)에 맞춘다.
 * 코트마다 예약 창이 달라 뒤쪽은 비기 쉬우므로, 시간표는 수집된 마지막 날까지만 그린다(timetableDays).
 */
export const MAX_DAYS_AHEAD = 30;

export interface KstNow {
	/** 'YYYY-MM-DD' */
	date: string;
	/** 자정부터 지난 분 */
	minutes: number;
}

export function kstNow(now: Date = new Date()): KstNow {
	const iso = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString();
	return {
		date: iso.slice(0, 10),
		minutes: Number(iso.slice(11, 13)) * 60 + Number(iso.slice(14, 16))
	};
}

export function addDays(date: string, n: number): string {
	const [y, m, d] = date.split('-').map(Number);
	return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** 날짜 띠가 아무리 길어도 이 이상은 그리지 않는다 (크롤러는 최대 2개월 수집) */
export const MAX_RANGE_DAYS = 62;

/** from ~ to 날짜를 포함해 나열. to가 앞서면 from 하루만. */
export function dateRange(from: string, to: string): string[] {
	const days = [from];
	while (days.length <= MAX_RANGE_DAYS && days[days.length - 1] < to) {
		days.push(addDays(days[days.length - 1], 1));
	}
	return days;
}

function startMinutes(time: string): number {
	const [h, m] = time.split(':').map(Number);
	return h * 60 + (m || 0);
}

/** 시작 시각이 속한 칩. 칩 H는 [H, H+2)이고, 범위 밖은 양 끝 칩에 넣는다. */
export function chipOf(startTime: string): number {
	const h = Math.floor(startMinutes(startTime) / 60);
	const first = CHIP_HOURS[0];
	const last = CHIP_HOURS[CHIP_HOURS.length - 1];
	return Math.min(last, Math.max(first, first + Math.floor((h - first) / 2) * 2));
}

/** 오늘 칩 중 이미 시작한 것 */
export function isChipPast(date: string, hour: number, now: KstNow): boolean {
	return date === now.date && hour * 60 <= now.minutes;
}

/** 현재 이후 시작하는 가장 가까운 칩. 오늘 남은 칩이 없으면 내일 첫 칩. */
export function defaultSelection(now: KstNow): { date: string; hour: number } {
	const next = CHIP_HOURS.find((h) => h * 60 > now.minutes);
	return next !== undefined
		? { date: now.date, hour: next }
		: { date: addDays(now.date, 1), hour: CHIP_HOURS[0] };
}

/** 날짜를 바꿀 때 고른 시간을 유지하되, 오늘의 지난 칩이면 기본값으로 돌린다. */
export function keepOrResetHour(date: string, hour: number, now: KstNow): number {
	if (!isChipPast(date, hour, now)) return hour;
	const fallback = defaultSelection(now);
	return fallback.date === date ? fallback.hour : hour;
}

/** availableCourts("1,2,3", "B, C", "장애인")의 면 수. 비어 있으면 모름(null). */
export function faceCount(availableCourts: string | null): number | null {
	if (!availableCourts) return null;
	const n = availableCourts.split(',').filter((s) => s.trim()).length;
	return n > 0 ? n : null;
}

/** "용인시" → "용인" */
export function regionShortName(name: string): string {
	return name.length > 2 ? name.replace(/[시군구]$/, '') : name;
}

export interface Slot {
	courtId: number | null;
	startTime: string;
	endTime: string;
	status: string;
	availableCourts: string | null;
}

/** 선택 시간에 비어 있음. faces가 null이면 면 수를 모른다. */
export interface Availability {
	faces: number | null;
}

/** 선택 시간의 상태: 가능 / 마감 / 그 날짜 예약 정보가 수집되지 않음 */
export type RowStatus =
	| { kind: 'open'; faces: number | null }
	| { kind: 'closed' }
	| { kind: 'unknown' };

export interface TableRow<C> {
	court: C;
	status: RowStatus;
	/** 그 코트의 남은 빈 슬롯 */
	slots: Slot[];
}

export interface TableSection<C> {
	/** 'favorites' 또는 지역 코드 */
	key: string;
	rows: TableRow<C>[];
}

/** 예약 가능하고 아직 시작하지 않은 슬롯 (rows는 모두 date 날짜의 것) */
export function openSlots<S extends Slot>(rows: S[], date: string, now: KstNow): S[] {
	return rows.filter(
		(r) => r.status === 'available' && (date > now.date || startMinutes(r.startTime) > now.minutes)
	);
}

/** 막대에서 빈 칸으로 칠할 시간들 */
export function freeHours(slots: Slot[]): number[] {
	return BAR_HOURS.filter((h) =>
		slots.some((s) => startMinutes(s.startTime) <= h * 60 && h * 60 < startMinutes(s.endTime))
	);
}

export function availabilityAt(slots: Slot[], hour: number): Availability | null {
	const inChip = slots.filter((s) => chipOf(s.startTime) === hour);
	if (inChip.length === 0) return null;
	const counts = inChip
		.map((s) => faceCount(s.availableCourts))
		.filter((n): n is number => n !== null);
	return { faces: counts.length > 0 ? Math.max(...counts) : null };
}

function groupByCourt(slots: Slot[]): Map<number, Slot[]> {
	const map = new Map<number, Slot[]>();
	for (const s of slots) {
		if (s.courtId == null) continue;
		const list = map.get(s.courtId);
		if (list) list.push(s);
		else map.set(s.courtId, [s]);
	}
	return map;
}

/**
 * 코트를 항상 전부, 고정된 순서로 보여 준다: ★ 관심 코트 → 지역(regionOrder 순) → 이름순.
 * 시간·날짜를 바꿔도 줄이 움직이지 않게 가능 여부는 순서에 쓰지 않는다.
 * slots는 openSlots를 거친 것, reported는 그 날짜에 행(상태 무관)이 있는 코트.
 */
export function buildTable<C extends { id: number; name: string; regionCode: string | null }>(
	courts: C[],
	slots: Slot[],
	hour: number,
	favoriteIds: number[],
	regionOrder: string[],
	reported: Set<number>
): TableSection<C>[] {
	const byCourt = groupByCourt(slots);
	const toRow = (court: C): TableRow<C> => {
		const own = byCourt.get(court.id) ?? [];
		const at = availabilityAt(own, hour);
		const status: RowStatus = at
			? { kind: 'open', faces: at.faces }
			: reported.has(court.id)
				? { kind: 'closed' }
				: { kind: 'unknown' };
		return { court, status, slots: own };
	};
	const sorted = [...courts].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
	const sections: TableSection<C>[] = [
		{ key: 'favorites', rows: sorted.filter((c) => favoriteIds.includes(c.id)).map(toRow) },
		...regionOrder.map((code) => ({
			key: code,
			rows: sorted.filter((c) => c.regionCode === code && !favoriteIds.includes(c.id)).map(toRow)
		}))
	];
	return sections.filter((sec) => sec.rows.length > 0);
}

/** 칩마다 빈 코트 수 */
export function chipCounts(courts: { id: number }[], slots: Slot[]): Record<number, number> {
	const ids = new Set(courts.map((c) => c.id));
	const counts: Record<number, number> = {};
	for (const h of CHIP_HOURS) {
		const open = new Set(
			slots
				.filter((s) => s.courtId != null && ids.has(s.courtId) && chipOf(s.startTime) === h)
				.map((s) => s.courtId)
		);
		counts[h] = open.size;
	}
	return counts;
}

/** [6,7,8,9,18,19] → '6~10시, 18~20시 가능' (막대의 텍스트 대체) */
export function formatFreeRanges(hours: number[]): string {
	if (hours.length === 0) return '빈 시간 없음';
	const ranges: [number, number][] = [];
	for (const h of [...hours].sort((a, b) => a - b)) {
		const last = ranges[ranges.length - 1];
		if (last && last[1] === h) last[1] = h + 1;
		else ranges.push([h, h + 1]);
	}
	return ranges.map(([a, b]) => `${a}~${b}시`).join(', ') + ' 가능';
}

export interface TimetableDay<S> {
	day: string;
	/** 남은 예약 가능 슬롯 */
	slots: S[];
	/** 그 날짜의 행이 하나라도 있는지 (없으면 수집 안 됨) */
	reported: boolean;
}

/** 코트 한 곳의 오늘부터 count일치. rows의 day는 API가 준 'YYYY-MM-DD'. */
export function timetableDays<S extends Slot & { day: string }>(
	rows: S[],
	now: KstNow,
	count: number
): TimetableDay<S>[] {
	const days = Array.from({ length: count }, (_, i) => {
		const day = addDays(now.date, i);
		const own = rows.filter((r) => r.day === day);
		return { day, slots: openSlots(own, day, now), reported: own.length > 0 };
	});
	// 예약 창이 짧은 코트가 뒤쪽을 "예약 정보 없음"으로 길게 채우지 않게 자른다
	while (days.length > 0 && !days[days.length - 1].reported) days.pop();
	return days;
}

export interface BarBlock {
	/** 막대 그리드의 시작 열 (1 = 6시) */
	col: number;
	/** 차지하는 칸 수 (시간 단위) */
	span: number;
	faces: number | null;
	/** 면 이름 ("1,2,3" → ['1','2','3']) */
	names: string[];
}

/** 빈 슬롯을 막대 위 블록으로. 막대 범위(6~22시) 밖은 잘라낸다. */
export function barBlocks(slots: Slot[]): BarBlock[] {
	const first = BAR_HOURS[0];
	const end = BAR_HOURS[BAR_HOURS.length - 1] + 1;
	return slots.flatMap((s) => {
		const from = Math.max(first, Math.floor(startMinutes(s.startTime) / 60));
		const to = Math.min(end, Math.ceil(startMinutes(s.endTime) / 60));
		if (to <= from) return [];
		const names = (s.availableCourts ?? '')
			.split(',')
			.map((n) => n.trim())
			.filter(Boolean);
		return [{ col: from - first + 1, span: to - from, faces: faceCount(s.availableCourts), names }];
	});
}
