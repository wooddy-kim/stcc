import type { Page } from 'playwright-core';
import { BaseCrawler } from './base-crawler';
import type { RawReservation } from './types';

/**
 * 수원 망포체육복합센터 테니스장 크롤러
 *
 * 사이트: https://mpsports.or.kr/base/facility/calendar1
 * 코트: A(옵션), B, C
 * 시간대: 06:00, 08:00, 10:00, 13:00, 15:00, 18:00, 20:00
 */
export class MangpoCrawler extends BaseCrawler {
	private baseUrl = 'https://mpsports.or.kr/base/facility/calendar1';
	private monthsToFetch = 2; // 현재 월 + 다음 달

	getCrawlerName(): string {
		return 'MangpoCrawler';
	}

	getTargetUrls(): string[] {
		const urls: string[] = [];
		const today = new Date();

		for (let i = 0; i < this.monthsToFetch; i++) {
			const targetDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
			const yearMonth = this.formatYearMonth(targetDate);
			const url = `${this.baseUrl}?yearMonthDay=${yearMonth}-01&menuLevel=2&menuNo=20&facilityCategoryNo=1`;
			urls.push(url);
		}

		return urls;
	}

	async extractReservations(page: Page): Promise<RawReservation[]> {
		const reservations: RawReservation[] = [];

		try {
			// 페이지 로딩 대기 (정확한 셀렉터 사용)
			await page.waitForSelector('.calendar', { timeout: 5000 });
			await page.waitForSelector('.calendar_table table', { timeout: 5000 });

			// 현재 월/년도 정보 가져오기
			const yearMonthSpans = await page.$$eval('.year_btn span', (spans) => {
				return spans.map((s) => s.textContent?.trim() || '');
			});
			// yearMonthSpans = ["2026.", "01"]
			const year = yearMonthSpans[0]
				? parseInt(yearMonthSpans[0].replace('.', ''))
				: new Date().getFullYear();
			const month = yearMonthSpans[1] ? parseInt(yearMonthSpans[1]) : new Date().getMonth() + 1;

			console.log(`  → ${year}년 ${month}월 데이터 추출 중...`);

			// 달력 테이블에서 모든 날짜 셀 가져오기 (평일 + 주말 포함)
			const dateCells = await page.$$('.calendar_table table tbody td.day');

			console.log(`  → ${dateCells.length}개 날짜 발견`);

			for (const cell of dateCells) {
				try {
					// 날짜 추출 (평일: span.day, 토요일: span.saturday, 일요일: span.sunday)
					let daySpan = await cell.$('div span.day');
					if (!daySpan) {
						daySpan = await cell.$('div span.saturday');
					}
					if (!daySpan) {
						daySpan = await cell.$('div span.sunday');
					}
					if (!daySpan) continue;

					const dayText = await daySpan.textContent();
					if (!dayText) continue;

					const dayNumber = parseInt(dayText.trim());
					if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 31) continue;

					// 해당 날짜의 모든 시간대 링크 가져오기
					const timeSlotsData = await cell.$$eval('ul li a', (elements) => {
						return elements.map((el) => ({
							text: el.textContent?.trim() || '',
							innerHTML: el.innerHTML || '',
							className: el.className || ''
						}));
					});

					// 시간대가 없으면 스킵
					if (timeSlotsData.length === 0) continue;

					// 날짜 포맷: YYYY-MM-DD
					const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;

					// 각 시간대 파싱
					for (const slotData of timeSlotsData) {
						const reservation = this.parseTimeSlot(slotData, dateStr);
						if (reservation) {
							reservations.push(reservation);
						}
					}
				} catch (error) {
					// 조용히 스킵 (빈 날짜 셀일 수 있음)
					continue;
				}
			}

			console.log(`  ✓ 추출 완료: ${reservations.length}건`);
		} catch (error) {
			console.error('❌ 예약 데이터 추출 실패:', error);
			throw error;
		}

		return reservations;
	}

	/**
	 * 시간대 슬롯 파싱
	 * 예시: "06:00 (B 1 / C 2)" → B/C 개별 예약 상태 파악
	 *
	 * 규칙:
	 * - class="c4" → 둘 다 예약 불가
	 * - class="c1" → B와 C를 개별적으로 확인
	 *   - <font color="red">B → B 예약됨
	 *   - <font color="red">C → C 예약됨
	 * - 하나라도 예약 가능하면 available
	 */
	private parseTimeSlot(
		slotData: { text: string; innerHTML: string; className: string },
		date: string
	): RawReservation | null {
		try {
			const { text, innerHTML, className } = slotData;

			// 시간 추출
			const timeMatch = text.match(/^(\d{2}:\d{2})/);
			if (!timeMatch) return null;

			const startTime = timeMatch[1];
			const endTime = this.calculateEndTime(startTime);

			// class='c4' → 둘 다 예약 불가
			if (className.includes('c4')) {
				return {
					courtName: '수원 망포체육복합센터',
					courtNumber: '',
					date,
					startTime,
					endTime,
					status: 'reserved',
					availableCourts: null
				};
			}

			// class='c1' (예약 가능 상태) → B와 C를 개별적으로 확인
			// B가 <font color="red">B로 시작하면 예약됨
			// C가 <font color="red">C로 시작하면 예약됨
			const isBRed = /<font color="red">\s*B\s/.test(innerHTML);
			const isCRed = /<font color="red">\s*C\s/.test(innerHTML);

			// 예약 가능한 코트 목록 생성
			const availableCourts: string[] = [];
			if (!isBRed) availableCourts.push('B');
			if (!isCRed) availableCourts.push('C');

			// 둘 다 예약 불가능한 경우 (예외 케이스)
			if (availableCourts.length === 0) {
				return {
					courtName: '수원 망포체육복합센터',
					courtNumber: '',
					date,
					startTime,
					endTime,
					status: 'reserved',
					availableCourts: null
				};
			}

			// 하나라도 예약 가능한 경우
			return {
				courtName: '수원 망포체육복합센터',
				courtNumber: '',
				date,
				startTime,
				endTime,
				status: 'available',
				availableCourts: availableCourts.join(', ') // "B, C" 형식 (쉼표+공백)
			};
		} catch (error) {
			console.warn('  ⚠️ 시간대 파싱 중 오류:', slotData.text, error);
			return null;
		}
	}

	/**
	 * 종료 시간 계산 (시작 시간 + 2시간)
	 */
	protected calculateEndTime(startTime: string): string {
		const [hours, minutes] = startTime.split(':').map(Number);
		const endHours = hours + 2;
		return `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
	}

	/**
	 * 날짜 포맷: YYYY-MM
	 */
	private formatYearMonth(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		return `${year}-${month}`;
	}
}
