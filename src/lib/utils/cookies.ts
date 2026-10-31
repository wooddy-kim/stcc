/**
 * Get a cookie value by name
 * @param name - The name of the cookie
 * @returns The cookie value or null if not found
 */
export function getCookie(name: string): string | null {
	if (typeof document === 'undefined') return null; // Server-side check

	const nameEQ = name + '=';
	const ca = document.cookie.split(';');

	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) === ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
	}

	return null;
}

/**
 * Set a cookie value
 * @param name - The name of the cookie
 * @param value - The value to set
 * @param days - Number of days until expiration (optional)
 */
export function setCookie(name: string, value: string, days?: number): void {
	if (typeof document === 'undefined') return; // Server-side check

	let expires = '';
	if (days) {
		const date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = '; expires=' + date.toUTCString();
	}

	document.cookie = name + '=' + (value || '') + expires + '; path=/';
}

/**
 * Delete a cookie by name
 * @param name - The name of the cookie to delete
 */
export function deleteCookie(name: string): void {
	if (typeof document === 'undefined') return; // Server-side check
	setCookie(name, '', -1);
}