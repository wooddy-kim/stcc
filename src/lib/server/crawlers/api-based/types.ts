/**
 * API 크롤러 전용 타입 정의
 */
import type { RawReservation } from '../types';

/**
 * 용인시 API 응답 구조
 */
export interface YonginApiResponse {
	resveTmList?: YonginTimeSlot[]; // 예약 가능한 시간대
	fcltRceptRsvctmTime?: YonginReservedSlot[]; // 예약 완료된 시간대
}

export interface YonginTimeSlot {
	timeContent: string; // "8:00 ~ 10:00"
}

export interface YonginReservedSlot {
	useTm: string; // "8:00 ~ 10:00"
	rsvctmStts: string; // "RESVECOMPT"
}

/**
 * 화성시 API 응답 구조
 */
export interface HwaseongApiResponse {
	useCntList?: HwaseongTimeSlot[];
}

export interface HwaseongTimeSlot {
	sorDate: string; // "2025-01-15"
	stadiumBeginHm: string; // "08:00"
	stadiumEndHm: string; // "10:00"
	applyStatusCd: string | null; // null이면 예약 가능
}

/**
 * 월별 코트 ID 매핑
 * 예: { '2025-01': { 10744: 'A', 10743: 'B' }, '2025-02': { 11132: 'A', 11131: 'B' } }
 */
export type MonthlyCourtMappings = Record<string, Record<number, string>>;

/**
 * 시설별 설정 인터페이스
 */
export interface YonginFacilityConfig {
	crawlerName: string; // "YonginCrawler"
	displayName: string; // "용인시립골드테니스장"
	facilityKey: string; // DB에서 동적으로 결정 (예: 'YONGIN', 'NAMSAN')
	courtMappings?: Record<number, string>; // DEPRECATED, 하위 호환용 (optional)
	monthlyCourtMappings?: MonthlyCourtMappings; // seed 용도로만 사용, 런타임은 DB
	apiUrl: string;
	monthsToFetch?: number; // 기본값: 2
	batchSize?: number; // 기본값: 10
	sortMode?: 'numeric' | 'alpha'; // 코트 번호 정렬 방식 (기본: 'numeric')
}

export interface HwaseongFacilityConfig {
	crawlerName: string; // "YeoulCrawler"
	displayName: string; // "화성 여울공원 테니스장"
	facilityKey: string; // DB에서 동적으로 결정 (예: 'YEOUL', 'WANGBAESAN')
	courtMappings?: Record<number, string>; // seed 용도로만 사용, 런타임은 DB
	apiUrl: string;
	monthsToFetch?: number; // 기본값: 2
}

/**
 * fetch 재시도 옵션
 */
export interface RetryOptions {
	maxRetries: number; // 기본값: 3
	baseDelay: number; // 기본값: 1000ms
	timeout: number; // 기본값: 15000ms
}

/**
 * 날짜/시간 범위
 */
export interface TimeRange {
	start: string; // "08:00"
	end: string; // "10:00"
}
