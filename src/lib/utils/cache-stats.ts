import { CacheManager } from './cache-manager';

/**
 * 캐시 성능 모니터링을 위한 유틸리티 함수
 */

// 캐시 통계를 주기적으로 로그로 출력
export function startCacheMonitoring(intervalMs: number = 60000): NodeJS.Timeout {
	const cacheManager = CacheManager.getInstance();

	return setInterval(() => {
		const stats = cacheManager.getAllStats();
		console.log('=== Cache Statistics ===');
		for (const [cacheName, cacheStats] of Object.entries(stats)) {
			const hitRate = cacheStats.hits + cacheStats.misses > 0
				? (cacheStats.hits / (cacheStats.hits + cacheStats.misses) * 100).toFixed(2)
				: '0.00';

			console.log(`${cacheName}:`);
			console.log(`  Hits: ${cacheStats.hits}`);
			console.log(`  Misses: ${cacheStats.misses}`);
			console.log(`  Hit Rate: ${hitRate}%`);
			console.log(`  Evictions: ${cacheStats.evictions}`);
			console.log(`  Current Size: ${cacheStats.currentSize}`);
		}
		console.log('========================');
	}, intervalMs);
}

// 특정 캐시의 통계를 가져오는 함수
export function getCacheStats(cacheName: string) {
	const cacheManager = CacheManager.getInstance();
	const cache = cacheManager.getCache(cacheName);
	if (cache) {
		return cache.getStats();
	}
	return null;
}

// 모든 캐시의 통계를 가져오는 함수
export function getAllCacheStats() {
	const cacheManager = CacheManager.getInstance();
	return cacheManager.getAllStats();
}

// 캐시 통계를 초기화하는 함수
export function resetCacheStats() {
	const cacheManager = CacheManager.getInstance();
	cacheManager.resetAllStats();
}