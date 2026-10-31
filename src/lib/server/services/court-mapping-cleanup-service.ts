/**
 * 만료된 월별 코트 매핑 정리 서비스
 * - court_api_mappings에서 cutoff(YYYY-MM) 이전 월별 매핑 삭제
 * - STATIC 매핑(화성·강남·군포 등 고정 코트 ID)은 항상 보존한다
 *
 * 크롤러는 오늘부터 monthsToFetch(기본 2)개월 범위만 조회하므로
 * 지난 달 이전 매핑은 다시 호출되지 않는다.
 */
import { db } from '../db/client.js';
import { courtApiMappings } from '../db/schema.js';
import { and, lt, ne } from 'drizzle-orm';

export const STATIC_YEAR_MONTH = 'STATIC';

export interface StaleMappingRow {
	id: number;
	facilityKey: string;
	yearMonth: string;
	apiCourtId: number;
	courtNumber: string;
}

export interface PruneResult {
	cutoff: string;
	deletedCount: number;
	/** yearMonth별 삭제 건수 (오름차순) */
	byYearMonth: Array<{ yearMonth: string; count: number }>;
	/** 삭제된(또는 dry-run 시 삭제 예정) 행 전체 — 백업용 */
	rows: StaleMappingRow[];
}

/**
 * 현재 월을 'YYYY-MM'으로 반환
 */
export function getCurrentYearMonth(now: Date = new Date()): string {
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * 'YYYY-MM' 형식 검증. 잘못된 값이면 throw 하여 전체 테이블 삭제를 방지한다.
 */
export function assertValidYearMonth(yearMonth: string): void {
	if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(yearMonth)) {
		throw new Error(`cutoff는 YYYY-MM 형식이어야 합니다: "${yearMonth}"`);
	}
}

/**
 * cutoff 이전 월별 매핑 조회 (STATIC 제외)
 */
export async function findStaleCourtMappings(
	cutoff: string = getCurrentYearMonth()
): Promise<StaleMappingRow[]> {
	assertValidYearMonth(cutoff);

	return await db
		.select({
			id: courtApiMappings.id,
			facilityKey: courtApiMappings.facilityKey,
			yearMonth: courtApiMappings.yearMonth,
			apiCourtId: courtApiMappings.apiCourtId,
			courtNumber: courtApiMappings.courtNumber
		})
		.from(courtApiMappings)
		.where(
			and(
				// 문자열 정렬상 'STATIC' > '2026-..' 이지만 collation에 의존하지 않도록 명시적으로 제외
				ne(courtApiMappings.yearMonth, STATIC_YEAR_MONTH),
				lt(courtApiMappings.yearMonth, cutoff)
			)
		);
}

/**
 * yearMonth별 건수 집계 (오름차순)
 */
export function summarizeByYearMonth(
	rows: StaleMappingRow[]
): Array<{ yearMonth: string; count: number }> {
	const counts = new Map<string, number>();
	for (const row of rows) {
		counts.set(row.yearMonth, (counts.get(row.yearMonth) ?? 0) + 1);
	}
	return [...counts.entries()]
		.map(([yearMonth, count]) => ({ yearMonth, count }))
		.sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));
}

/**
 * cutoff 이전 월별 매핑 삭제
 *
 * @param cutoff  기준 월 'YYYY-MM' (기본: 현재 월). 이 값보다 이전 월만 삭제한다.
 * @param dryRun  true면 삭제하지 않고 대상만 집계한다.
 */
export async function pruneStaleCourtMappings(
	cutoff: string = getCurrentYearMonth(),
	dryRun = false
): Promise<PruneResult> {
	assertValidYearMonth(cutoff);

	const rows = await findStaleCourtMappings(cutoff);
	const byYearMonth = summarizeByYearMonth(rows);

	if (dryRun || rows.length === 0) {
		return { cutoff, deletedCount: 0, byYearMonth, rows };
	}

	const deleted = await db
		.delete(courtApiMappings)
		.where(
			and(ne(courtApiMappings.yearMonth, STATIC_YEAR_MONTH), lt(courtApiMappings.yearMonth, cutoff))
		)
		.returning({ id: courtApiMappings.id });

	return { cutoff, deletedCount: deleted.length, byYearMonth, rows };
}
