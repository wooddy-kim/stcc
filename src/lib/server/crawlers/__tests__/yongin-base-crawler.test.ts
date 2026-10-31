import { describe, it, expect, vi } from 'vitest';

// DB 의존성 모킹 (DB 연결 없이 테스트)
vi.mock('../../db/client.js', () => ({ db: {} }));
vi.mock('../../db/schema.js', () => ({ courtApiMappings: {} }));

import { YonginBaseCrawler } from '../api-based/yongin-base-crawler';
import type { CrawlResult } from '../types';
import type { YonginFacilityConfig } from '../api-based/types';

const testConfig: YonginFacilityConfig = {
	crawlerName: 'TestYonginCrawler',
	displayName: '테스트 시설',
	facilityKey: 'YONGIN',
	apiUrl: 'https://example.com/api',
	monthsToFetch: 1,
	batchSize: 5
};

// 테스트 전용 최소 구체 클래스 - DB/Playwright 호출 없음
class TestYonginCrawler extends YonginBaseCrawler {
	constructor() {
		super(testConfig);
	}
	async crawl(): Promise<CrawlResult> {
		return { success: true, source: 'test', reservations: [], recordsCount: 0, duration: 0 };
	}
	public exposedParseTimeContent(timeContent: string) {
		return this.parseTimeContent(timeContent);
	}
}

const crawler = new TestYonginCrawler();

describe('YonginBaseCrawler.parseTimeContent', () => {
	it('"8:00 ~ 10:00" 파싱 → 패딩 적용', () => {
		expect(crawler.exposedParseTimeContent('8:00 ~ 10:00')).toEqual({
			start: '08:00',
			end: '10:00'
		});
	});

	it('"18:00 ~ 20:00" 파싱 → 두 자리 유지', () => {
		expect(crawler.exposedParseTimeContent('18:00 ~ 20:00')).toEqual({
			start: '18:00',
			end: '20:00'
		});
	});

	it('"9:00~11:00" (공백 없이) 파싱', () => {
		expect(crawler.exposedParseTimeContent('9:00~11:00')).toEqual({
			start: '09:00',
			end: '11:00'
		});
	});

	it('파싱 불가 문자열 → null 반환', () => {
		expect(crawler.exposedParseTimeContent('invalid')).toBeNull();
	});

	it('빈 문자열 → null 반환', () => {
		expect(crawler.exposedParseTimeContent('')).toBeNull();
	});
});
