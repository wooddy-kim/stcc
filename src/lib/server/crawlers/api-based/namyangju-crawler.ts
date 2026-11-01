import { HwaseongBaseCrawler } from './hwaseong-base-crawler';
import type { RawReservation } from '../types';

/**
 * 남양주시 통합예약 크롤러 (www.nyj.go.kr/rent, 로그인 불필요, EUC-KR HTML)
 * facilityKey = '{comcd}-{partcd}' (예: 'NYJ06-04'), court_api_mappings.apiCourtId = placecd
 * 고정 ID + 코트별 월 단위 조회라 화성 크롤러 흐름을 그대로 쓰고 요청·파싱만 바꾼다.
 */
export abstract class NamyangjuBaseCrawler extends HwaseongBaseCrawler {
	protected async requestCourtMonth(
		placeCd: number,
		year: number,
		month: number,
		signal: AbortSignal
	): Promise<RawReservation[]> {
		const [comcd, partcd] = this.config.facilityKey.split('-');
		const mm = String(month).padStart(2, '0');
		// 경로의 2 = 일자별 리스트 보기. 1일로 요청하면 그 달 달력 그리드 중 예약이 열린 날만 내려온다.
		const url = `${this.config.apiUrl}/${year}/${mm}/01/2/${comcd}/${partcd}/${placeCd}`;

		const response = await fetch(url, { signal });
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const html = new TextDecoder('euc-kr').decode(await response.arrayBuffer());
		// 달력 그리드에 걸친 앞뒤 달 날짜(예: 12월 요청 시 11/29~30)는 해당 월 요청에서 처리한다
		return parseNyjDayList(html, this.config.displayName, placeCd).filter((r) =>
			r.date.startsWith(`${year}-${mm}`)
		);
	}
}

const STATUS_BY_ALT: Record<string, RawReservation['status']> = {
	예약가능: 'available',
	예약완료: 'reserved'
};

/**
 * 일자별 리스트의 체육경기 표(rent_daylist_table_sports)를 파싱한다.
 * 날짜 셀은 rowspan으로 묶여 그룹 첫 행에만 있으므로 직전 날짜를 이어 쓴다.
 * 행 셀 순서: [날짜], 회차, 이용시간('09:00~ 11:00'), 행사명, 예약단체, 상태 이미지(alt). 예약단체는 저장하지 않는다.
 */
export function parseNyjDayList(
	html: string,
	courtName: string,
	placeCd: number
): RawReservation[] {
	const start = html.indexOf('class="rent_daylist_table_sports"');
	if (start === -1) {
		throw new Error('Invalid response: rent_daylist_table_sports 없음');
	}
	const table = html.slice(start, html.indexOf('</table>', start));

	const reservations: RawReservation[] = [];
	const unknownAlts = new Set<string>();
	let date = '';

	for (const [, row] of table.matchAll(/<tr>([\s\S]*?)<\/tr>/g)) {
		const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
		const dateMatch = cells[0]?.match(/(\d{4}-\d{2}-\d{2}) \(/);
		if (dateMatch) {
			date = dateMatch[1];
			cells.shift();
		}

		const alt = cells[4]?.match(/alt="([^"]+)"/)?.[1];
		if (!alt) continue; // '예약가능한 정보가 없습니다.' 같은 안내 행
		const status = STATUS_BY_ALT[alt];
		if (!status) {
			unknownAlts.add(alt); // 휴관일 등은 내보내지 않는다
			continue;
		}

		const time = cells[1].match(/(\d{2}:\d{2})~\s*(\d{2}:\d{2})/);
		if (!date || !time) continue;

		reservations.push({
			courtName,
			courtNumber: '',
			courtId: placeCd,
			date,
			startTime: time[1],
			endTime: time[2],
			status
		});
	}

	if (unknownAlts.size > 0) {
		console.warn(
			`  ⚠️ [${courtName}] 코트 ${placeCd} 알 수 없는 상태 제외: ${[...unknownAlts].join(', ')}`
		);
	}
	return reservations;
}
