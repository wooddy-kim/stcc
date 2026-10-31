import { BaseCrawler } from '../base-crawler';
import type { CrawlError, RawReservation } from '../types';
import { ErrorType } from '../types';
import type { RetryOptions } from './types';

/**
 * API 기반 크롤러 중간 추상 클래스
 * YonginBaseCrawler와 HwaseongBaseCrawler의 공통 로직을 제공
 */
export abstract class ApiBaseCrawler extends BaseCrawler {
	protected readonly defaultRetryOptions: RetryOptions = {
		maxRetries: 3,
		baseDelay: 1000,
		timeout: 15000
	};

	async extractReservations(): Promise<RawReservation[]> {
		throw new Error(`${this.getCrawlerName()} uses API-based crawling`);
	}

	protected categorizeError(error: unknown): CrawlError {
		const message = error instanceof Error ? error.message : String(error);
		const stack = error instanceof Error ? error.stack : undefined;
		let type = ErrorType.UNKNOWN_ERROR;
		if (message.includes('fetch') || message.includes('HTTP')) {
			type = ErrorType.NETWORK_ERROR;
		} else if (message.includes('JSON') || message.includes('Invalid')) {
			type = ErrorType.PARSING_ERROR;
		} else if (message.includes('AbortError') || message.includes('timeout')) {
			type = ErrorType.TIMEOUT_ERROR;
		}
		return { type, message, stack };
	}
}
