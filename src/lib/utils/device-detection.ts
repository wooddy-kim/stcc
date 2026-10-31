/**
 * Device detection utility for PWA installation guide
 * Detects OS, browser, and device type
 */

export interface DeviceInfo {
	os: 'ios' | 'android' | 'other';
	browser: 'safari' | 'chrome' | 'firefox' | 'edge' | 'other';
	isMobile: boolean;
	isStandalone: boolean; // Already installed as PWA
}

/**
 * Detect device OS, browser, and type
 * Returns DeviceInfo object with detection results
 */
export function detectDevice(): DeviceInfo {
	// Server-side rendering fallback
	if (typeof window === 'undefined') {
		return {
			os: 'other',
			browser: 'other',
			isMobile: false,
			isStandalone: false
		};
	}

	const userAgent = navigator.userAgent.toLowerCase();

	// Check if already installed as PWA
	const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

	// OS detection
	const isIOS = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
	const isAndroid = /android/.test(userAgent);
	const os = isIOS ? 'ios' : isAndroid ? 'android' : 'other';

	// Browser detection
	const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
	const isChrome = /chrome/.test(userAgent) && !/edge|edg/.test(userAgent);
	const isFirefox = /firefox/.test(userAgent);
	const isEdge = /edge|edg/.test(userAgent);
	const browser = isSafari
		? 'safari'
		: isChrome
			? 'chrome'
			: isFirefox
				? 'firefox'
				: isEdge
					? 'edge'
					: 'other';

	// Mobile detection
	const isMobile = /mobile|tablet|android|ipad|iphone|ipod/.test(userAgent);

	return {
		os,
		browser,
		isMobile,
		isStandalone
	};
}

/**
 * Get the default tab based on detected OS
 */
export function getDefaultTab(): 'ios' | 'android' {
	const device = detectDevice();
	return device.os === 'android' ? 'android' : 'ios';
}
