import { EnhancedCache, type CacheOptions, type CacheStats } from './enhanced-cache';

export class CacheManager {
	private static instance: CacheManager;
	private caches: Map<string, EnhancedCache<any>>;

	private constructor() {
		this.caches = new Map();
	}

	static getInstance(): CacheManager {
		if (!CacheManager.instance) {
			CacheManager.instance = new CacheManager();
		}
		return CacheManager.instance;
	}

	createCache<T>(name: string, options: CacheOptions): EnhancedCache<T> {
		const cache = new EnhancedCache<T>(options);
		this.caches.set(name, cache);
		return cache;
	}

	getCache<T>(name: string): EnhancedCache<T> | undefined {
		return this.caches.get(name);
	}

	deleteCache(name: string): boolean {
		const cache = this.caches.get(name);
		if (cache) {
			cache.destroy();
			return this.caches.delete(name);
		}
		return false;
	}

	clearAll(): void {
		for (const cache of this.caches.values()) {
			cache.destroy();
		}
		this.caches.clear();
	}

	getAllStats(): Record<string, CacheStats> {
		const stats: Record<string, CacheStats> = {};
		for (const [name, cache] of this.caches.entries()) {
			stats[name] = cache.getStats();
		}
		return stats;
	}

	// Reset stats for all caches
	resetAllStats(): void {
		for (const cache of this.caches.values()) {
			cache.resetStats();
		}
	}
}