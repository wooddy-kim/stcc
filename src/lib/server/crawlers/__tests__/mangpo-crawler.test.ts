import { describe, it, expect } from 'vitest';
import { MangpoCrawler } from '../mangpo-crawler';

// 테스트 전용 최소 구체 클래스 - protected 메서드 노출
class TestMangpoCrawler extends MangpoCrawler {
	public exposedCalculateEndTime(startTime: string): string {
		return this.calculateEndTime(startTime);
	}
}

const crawler = new TestMangpoCrawler();

describe('MangpoCrawler.calculateEndTime', () => {
	it('"06:00" → "08:00" (+2시간)', () => {
		expect(crawler.exposedCalculateEndTime('06:00')).toBe('08:00');
	});

	it('"20:00" → "22:00"', () => {
		expect(crawler.exposedCalculateEndTime('20:00')).toBe('22:00');
	});

	it('"10:30" → "12:30"', () => {
		expect(crawler.exposedCalculateEndTime('10:30')).toBe('12:30');
	});

	it('"00:00" → "02:00"', () => {
		expect(crawler.exposedCalculateEndTime('00:00')).toBe('02:00');
	});
});
