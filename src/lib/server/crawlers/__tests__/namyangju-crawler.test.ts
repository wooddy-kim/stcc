import { describe, it, expect, vi } from 'vitest';

vi.mock('../../db/client', () => ({ db: {} }));

import { parseNyjDayList } from '../api-based/namyangju-crawler';

// 실제 응답(퇴계원 NYJ05/04/10, 2026-11)에서 잘라낸 일부. 뒤의 events 표는 무시해야 한다.
const fixture = `
<table class="rent_daylist_table_sports" summary="12월 시설예약일정 현황입니다.">
<thead><tr><th scope="col">일정</th><th scope="col">구분</th></tr></thead>
<tbody>
                      <tr>
                          <td rowspan="8">2026-11-02 (월)</td>
                        <td>1부 동2</td>
                        <td>07:00~ 09:00</td>
                        <td></td>
                        <td></td>
                        <td class="url_link">
                          <a href="https://www.nyj.go.kr/rent/rent/reservation/index/2026/11/02/2/NYJ05/04/10/Y/07000900/1735">
                            <img src="/rent/images/btn/btn_icon_reservation.gif" alt="예약가능" />
                          </a>
                          <input type="hidden" name="placecd" value="10" />
                        </td>
                      </tr>
                      <tr>
                        <td>3부 동2</td>
                        <td>11:00~ 13:00</td>
                        <td>테니스</td>
                        <td>즐테회</td>
<td><img src="/rent/images/btn/btn_icon_complete.gif" alt="예약완료" /></td>                      </tr>
                      <tr>
                        <td><span class="holiday_2">2026-11-03 (화)</span></td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td><img src="/rent/images/btn/btn_icon_holiday.gif" alt="휴관일" /></td>
                      </tr>
                      <tr>
                          <td rowspan="8">2026-11-04 (수)</td>
                        <td>1회</td>
                        <td>06:00~ 08:00</td>
                        <td>운동</td>
                        <td>개인</td>
<td><img src="/rent/images/btn/btn_icon_complete.gif" alt="예약완료" /></td>                      </tr>
                      <tr>
                        <td>2회</td>
                        <td>08:00~ 10:00</td>
                        <td>테니스 </td>
                        <td>지금 테니스클럽</td>
<td><img src="/rent/images/btn/btn_icon_complete.gif" alt="예약완료" /></td>                      </tr>
</tbody>
</table>
<table class="rent_daylist_table_events" summary="12월 시설예약일정 현황입니다.">
<tbody>
                      <tr>
                          <td rowspan="8">2026-11-05 (목)</td>
                        <td>1회</td>
                        <td>06:00~ 08:00</td>
                        <td></td>
                        <td></td>
<td><img src="/rent/images/btn/btn_icon_complete.gif" alt="예약완료" /></td>                      </tr>
</tbody>
</table>`;

describe('parseNyjDayList', () => {
	it('rowspan으로 묶인 날짜를 이어 쓰고 시간·상태를 변환한다 (휴관일·events 표 제외)', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const result = parseNyjDayList(fixture, '퇴계원', 10);

		expect(result.map((r) => [r.date, r.startTime, r.endTime, r.status])).toEqual([
			['2026-11-02', '07:00', '09:00', 'available'],
			['2026-11-02', '11:00', '13:00', 'reserved'],
			['2026-11-04', '06:00', '08:00', 'reserved'],
			['2026-11-04', '08:00', '10:00', 'reserved']
		]);
		expect(result[0]).toEqual({
			courtName: '퇴계원',
			courtNumber: '',
			courtId: 10,
			date: '2026-11-02',
			startTime: '07:00',
			endTime: '09:00',
			status: 'available'
		});
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('휴관일'));
		warn.mockRestore();
	});

	it('예약 정보가 없는 달은 빈 배열을 반환한다', () => {
		const empty = `<table class="rent_daylist_table_sports"><tbody>
<tr><td colspan="6">예약가능한 정보가 없습니다.</td><tr>        </tbody>
      </table>`;
		expect(parseNyjDayList(empty, '지금', 3)).toEqual([]);
	});

	it('표가 없으면 예외를 던진다', () => {
		expect(() => parseNyjDayList('<html></html>', '지금', 3)).toThrow();
	});
});
