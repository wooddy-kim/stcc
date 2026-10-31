/**
 * 크롤러 타입 정의
 */

export interface RawReservation {
	courtName: string;
	courtNumber: string;
	courtId?: number;
	date: string;
	startTime: string;
	endTime: string;
	status: 'available' | 'reserved' | 'closed';
	availableCourts?: string | null;
}

export interface CrawlResult {
	success: boolean;
	source: string;
	reservations: RawReservation[];
	recordsCount: number;
	duration: number;
	error?: CrawlError;
}

export interface CrawlError {
	type: ErrorType;
	message: string;
	stack?: string;
}

export enum ErrorType {
	NETWORK_ERROR = 'NETWORK_ERROR',
	PARSING_ERROR = 'PARSING_ERROR',
	TIMEOUT_ERROR = 'TIMEOUT_ERROR',
	SELECTOR_NOT_FOUND = 'SELECTOR_NOT_FOUND',
	UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}
