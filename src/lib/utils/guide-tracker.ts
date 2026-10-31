/**
 * 가이드 팝업 표시 여부 추적 유틸리티
 * localStorage를 사용하여 사용자가 가이드를 이미 봤는지 추적합니다.
 */

const GUIDE_KEY = 'courtnow_guide_shown';
const GUIDE_VERSION = '1'; // 가이드 버전 (새 가이드 배포 시 변경)

/**
 * 사용자가 이미 가이드를 봤는지 확인
 */
export function hasSeenGuide(): boolean {
	if (typeof window === 'undefined') return true;
	const stored = localStorage.getItem(GUIDE_KEY);
	// 버전이 일치하는 경우에만 true 반환
	return stored === GUIDE_VERSION;
}

/**
 * 가이드를 봤음을 표시
 */
export function markGuideAsShown(): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(GUIDE_KEY, GUIDE_VERSION);
}

/**
 * 가이드 표시 상태 초기화 (다시 보기용)
 */
export function resetGuide(): void {
	if (typeof window === 'undefined') return;
	localStorage.removeItem(GUIDE_KEY);
}
