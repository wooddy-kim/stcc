/**
 * Sort court numbers numerically (handles "1", "10", "2" correctly)
 * @param courts - Array of court number strings
 * @returns Sorted array
 */
export function sortCourtNumbers(courts: string[]): string[] {
	return [...courts].sort((a, b) => {
		const numA = parseInt(a, 10);
		const numB = parseInt(b, 10);
		return numA - numB;
	});
}

/**
 * Format court numbers for display (e.g., "1,3,5" -> "코트 1, 3, 5")
 * @param courtList - Comma-separated court numbers
 * @returns Formatted string for display
 */
export function formatCourtNumbers(courtList: string): string {
	if (!courtList) return '';
	return `코트 ${courtList.replace(/,/g, ', ')}`;
}
