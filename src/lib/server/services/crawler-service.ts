/**
 * 크롤러 서비스
 * 크롤링한 데이터를 정규화하고 데이터베이스에 저장
 */
import { db } from '../db/client';
import { courts, crawlLogs } from '../db/schema';
import { sql } from 'drizzle-orm';
import type { RawReservation, CrawlResult } from '../crawlers/types';

export class CrawlerService {
	/**
	 * 크롤링 결과를 데이터베이스에 저장
	 */
	async saveReservations(crawlResult: CrawlResult): Promise<void> {
		const startTime = Date.now();

		try {
			console.log(`[CrawlerService] 저장 시작: ${crawlResult.recordsCount}건`);

			// 크롤링에 실패한 경우 로그만 저장
			if (!crawlResult.success) {
				await this.saveCrawlLog(crawlResult, 'failure');
				console.log(`[CrawlerService] 크롤링 실패 로그 저장 완료`);
				return;
			}

			// 모든 코트 정보를 미리 가져와서 Map으로 저장 (성능 최적화)
			const allCourts = await db.select().from(courts);
			const courtMap = new Map(allCourts.map((c) => [c.name, c.id]));

			// 배치 저장을 위한 준비
			const BATCH_SIZE = 100;
			let savedCount = 0;
			let skippedCount = 0;
			const crawledAt = new Date();

			// 배치 단위로 처리
			for (let i = 0; i < crawlResult.reservations.length; i += BATCH_SIZE) {
				const batch = crawlResult.reservations.slice(i, i + BATCH_SIZE);
				const batchRecords = [];

				for (const rawReservation of batch) {
					try {
						const courtId = courtMap.get(rawReservation.courtName);
						if (!courtId) {
							console.warn(`[CrawlerService] 코트를 찾을 수 없음: ${rawReservation.courtName}`);
							skippedCount++;
							continue;
						}

						const date = this.parseDate(rawReservation.date);
						const courtNumber = rawReservation.courtNumber || null;

						batchRecords.push({
							courtId,
							courtNumber,
							availableCourts: rawReservation.availableCourts || rawReservation.courtNumber || null,
							date,
							startTime: rawReservation.startTime,
							endTime: rawReservation.endTime,
							status: rawReservation.status,
							crawledAt,
							updatedAt: crawledAt
						});
					} catch (error) {
						console.warn(`[CrawlerService] 예약 파싱 실패:`, rawReservation, error);
						skippedCount++;
					}
				}

				// 배치 삽입 (벌크 업서트)
				if (batchRecords.length > 0) {
					try {
						// PostgreSQL의 ON CONFLICT DO UPDATE를 사용한 벌크 업서트
						const values = batchRecords
							.map(
								(record) =>
									`(${record.courtId}, '${record.date.toISOString()}', '${record.startTime}', '${record.endTime}', '${record.status}', ${record.courtNumber ? `'${record.courtNumber}'` : 'NULL'}, ${record.availableCourts ? `'${record.availableCourts}'` : 'NULL'}, '${crawledAt.toISOString()}', '${crawledAt.toISOString()}')`
							)
							.join(',');

						const query = sql.raw(`
							INSERT INTO reservations (court_id, date, start_time, end_time, status, court_number, available_courts, crawled_at, updated_at)
							VALUES ${values}
							ON CONFLICT (court_id, date, start_time) 
							DO UPDATE SET
								status = EXCLUDED.status,
								court_number = EXCLUDED.court_number,
								available_courts = EXCLUDED.available_courts,
								crawled_at = EXCLUDED.crawled_at,
								updated_at = EXCLUDED.updated_at
						`);

						await db.execute(query);
						savedCount += batchRecords.length;
						console.log(`[CrawlerService] 진행: ${savedCount}/${crawlResult.recordsCount}건`);
					} catch (error) {
						console.error(`[CrawlerService] 배치 저장 실패:`, error);
						skippedCount += batchRecords.length;
					}
				}
			}

			console.log(`[CrawlerService] 저장 완료: ${savedCount}건 성공, ${skippedCount}건 스킵`);

			// 크롤링 로그 저장
			await this.saveCrawlLog(
				{
					...crawlResult,
					recordsCount: savedCount,
					duration: Date.now() - startTime
				},
				'success'
			);
		} catch (error) {
			console.error('[CrawlerService] 저장 중 에러:', error);
			throw error;
		}
	}

	/**
	 * 크롤링 로그 저장
	 */
	private async saveCrawlLog(
		crawlResult: CrawlResult,
		status: 'success' | 'failure'
	): Promise<void> {
		await db.insert(crawlLogs).values({
			source: crawlResult.source,
			status,
			recordsCount: crawlResult.recordsCount,
			duration: crawlResult.duration,
			errorMessage: crawlResult.error?.message || null
		});
	}

	/**
	 * 날짜 문자열을 Date 객체로 변환 (UTC 기준 자정)
	 * @param dateStr "YYYY-MM-DD" 형식
	 */
	private parseDate(dateStr: string): Date {
		const [year, month, day] = dateStr.split('-').map(Number);
		// UTC 기준 자정으로 생성하여 타임존 이슈 방지
		return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
	}

}
