import { describe, it, expect } from 'vitest';
import { ApiBaseCrawler } from '../api-based/api-base-crawler';
import { ErrorType } from '../types';
import type { CrawlResult } from '../types';

// 테스트 전용 최소 구체 클래스 - DB/Playwright 호출 없음
class TestApiCrawler extends ApiBaseCrawler {
	getCrawlerName() {
		return 'TestCrawler';
	}
	getTargetUrls() {
		return [];
	}
	async crawl(): Promise<CrawlResult> {
		return { success: true, source: 'test', reservations: [], recordsCount: 0, duration: 0 };
	}
	public exposedCategorizeError(e: unknown) {
		return this.categorizeError(e);
	}
}

const crawler = new TestApiCrawler();

describe('ApiBaseCrawler.categorizeError', () => {
	it('fetch 포함 에러 → NETWORK_ERROR', () => {
		const result = crawler.exposedCategorizeError(new Error('fetch failed'));
		expect(result.type).toBe(ErrorType.NETWORK_ERROR);
	});

	it('HTTP 포함 에러 → NETWORK_ERROR', () => {
		const result = crawler.exposedCategorizeError(new Error('HTTP 500: Internal Server Error'));
		expect(result.type).toBe(ErrorType.NETWORK_ERROR);
	});

	it('AbortError 포함 에러 → TIMEOUT_ERROR', () => {
		const result = crawler.exposedCategorizeError(new Error('AbortError: aborted'));
		expect(result.type).toBe(ErrorType.TIMEOUT_ERROR);
	});

	it('timeout 포함 에러 → TIMEOUT_ERROR', () => {
		const result = crawler.exposedCategorizeError(new Error('Connection timeout'));
		expect(result.type).toBe(ErrorType.TIMEOUT_ERROR);
	});

	it('JSON 포함 에러 → PARSING_ERROR', () => {
		const result = crawler.exposedCategorizeError(new Error('JSON parse error'));
		expect(result.type).toBe(ErrorType.PARSING_ERROR);
	});

	it('Invalid 포함 에러 → PARSING_ERROR', () => {
		const result = crawler.exposedCategorizeError(new Error('Invalid response'));
		expect(result.type).toBe(ErrorType.PARSING_ERROR);
	});

	it('알 수 없는 에러 → UNKNOWN_ERROR', () => {
		const result = crawler.exposedCategorizeError(new Error('Something unexpected'));
		expect(result.type).toBe(ErrorType.UNKNOWN_ERROR);
	});

	it('stack 필드가 포함된다', () => {
		const error = new Error('test error');
		const result = crawler.exposedCategorizeError(error);
		expect(result.stack).toBe(error.stack);
	});

	it('timestamp 필드가 없다 (타입 버그 수정 확인)', () => {
		const result = crawler.exposedCategorizeError(new Error('test'));
		expect((result as unknown as Record<string, unknown>).timestamp).toBeUndefined();
	});

	it('Error가 아닌 값도 처리한다', () => {
		const result = crawler.exposedCategorizeError('string error');
		expect(result.message).toBe('string error');
		expect(result.type).toBe(ErrorType.UNKNOWN_ERROR);
	});
});
