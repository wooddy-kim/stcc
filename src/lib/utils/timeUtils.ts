/**
 * Format a date as relative time in Korean
 * @param date - The date to format (can be Date object or date string)
 * @returns A relative time string in Korean based on the specified criteria
 */
export function formatRelativeTime(date: Date | string): string {
	// Handle case where date might be a string from API
	const dateObj = typeof date === 'string' ? new Date(date) : date;

	// Check if date is valid
	if (isNaN(dateObj.getTime())) {
		return '알 수 없음';
	}

	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
	const diffInMinutes = Math.floor(diffInSeconds / 60);
	const diffInHours = Math.floor(diffInMinutes / 60);
	const diffInDays = Math.floor(diffInHours / 24);

	// 0~10초: 방금 업데이트됨
	if (diffInSeconds < 10) {
		return '방금 업데이트됨';
	}
	// 10~60초: N초 전
	else if (diffInSeconds < 60) {
		return `1분 이내 업데이트됨`;
	}
	// 1~5분: 조금 전 업데이트됨
	else if (diffInMinutes < 5) {
		return '조금 전 업데이트됨';
	}
	// 5~60분: N분 전 업데이트됨
	else if (diffInMinutes < 60) {
		return `${diffInMinutes}분 전 업데이트됨`;
	}
	// 1시간 이상: N시간 전 업데이트됨 (최대 24시간)
	else if (diffInHours < 24) {
		return `${diffInHours}시간 전 업데이트됨`;
	}
	// 1일 이상: N일 전 업데이트됨
	else {
		return `${diffInDays}일 전 업데이트됨`;
	}
}

/**
 * Get the most recent crawl timestamp from a list of reservations
 * @param reservations - Array of reservation objects with crawledAt property
 * @returns The most recent crawl timestamp or null if none found
 */
export function getMostRecentCrawlTime(reservations: { crawledAt: Date | string | null }[]): Date | null {
	const validCrawledAtDates = reservations
		.map((r) => r.crawledAt)
		.filter((date): date is (Date | string) => date !== null)
		.map((date) => {
			// Convert string dates to Date objects
			if (typeof date === 'string') {
				return new Date(date);
			}
			return date;
		})
		.filter((date) => !isNaN(date.getTime())); // Filter out invalid dates

	if (validCrawledAtDates.length === 0) {
		return null;
	}

	return new Date(Math.max(...validCrawledAtDates.map((date) => date.getTime())));
}
