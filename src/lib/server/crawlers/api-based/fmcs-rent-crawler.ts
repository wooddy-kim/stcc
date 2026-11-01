import { HwaseongBaseCrawler } from './hwaseong-base-crawler';
import type { RawReservation } from '../types';
import type { FmcsTimeSlot } from './types';

/**
 * SPOWISE FMCS 대관 API 크롤러 (군포도시공사)
 * facilityKey = '{comcd}-{part_cd}[-{접미사}]' (예: 'GUNPO02-14', 'UUC02-15-NAESON'), court_api_mappings.apiCourtId = place_cd
 * 접미사는 한 part를 여러 테니스장으로 나눌 때 키를 구분하는 용도로, 요청에는 쓰지 않는다.
 * 고정 ID + 코트별 월 단위 조회라 화성 크롤러 흐름을 그대로 쓰고 요청·파싱만 바꾼다.
 */
export abstract class FmcsRentBaseCrawler extends HwaseongBaseCrawler {
	protected async requestCourtMonth(
		placeCd: number,
		year: number,
		month: number,
		signal: AbortSignal
	): Promise<RawReservation[]> {
		const [companyCode, partCode] = this.config.facilityKey.split('-');
		const params = new URLSearchParams({
			company_code: companyCode,
			part_code: partCode,
			place_code: String(placeCd),
			base_date: `${year}${String(month).padStart(2, '0')}01`,
			rent_type: '1001'
		});

		const response = await fetch(`${this.config.apiUrl}?${params}`, { signal });
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data: unknown = await response.json();
		if (!Array.isArray(data)) {
			throw new Error('Invalid API response structure');
		}
		return parseFmcsSlots(data, this.config.displayName, placeCd);
	}
}

/**
 * use_yn: N=예약가능, Y=예약완료, E=마감.
 * 예약 창 밖의 날은 Y + rent_no=0으로 내려오므로 건너뛴다 (실제 예약은 rent_no > 0).
 */
export function parseFmcsSlots(
	slots: FmcsTimeSlot[],
	courtName: string,
	placeCd: number
): RawReservation[] {
	const reservations: RawReservation[] = [];
	for (const slot of slots) {
		if (!slot.date || !slot.start_time || !slot.end_time) continue;
		const available = slot.use_yn === 'N';
		if (!available && slot.use_yn === 'Y' && !slot.rent_no) continue;

		reservations.push({
			courtName,
			courtNumber: '',
			courtId: placeCd,
			date: `${slot.date.slice(0, 4)}-${slot.date.slice(4, 6)}-${slot.date.slice(6, 8)}`,
			startTime: slot.start_time,
			endTime: slot.end_time,
			status: available ? 'available' : 'reserved'
		});
	}
	return reservations;
}
