export interface CacheOptions {
	ttl: number; // milliseconds
	maxSize: number;
	cleanupInterval?: number; // milliseconds
}

export interface CacheStats {
	hits: number;
	misses: number;
	evictions: number;
	currentSize: number;
}

interface CacheEntry<T> {
	data: T;
	expiry: number;
	lastAccessed: number;
}

export class EnhancedCache<T> {
	private cache: Map<string, CacheEntry<T>>;
	private options: CacheOptions;
	private stats: CacheStats;
	private cleanupTimer: NodeJS.Timeout | null;

	constructor(options: CacheOptions) {
		this.cache = new Map();
		this.options = {
			ttl: options.ttl,
			maxSize: options.maxSize,
			cleanupInterval: options.cleanupInterval || options.ttl
		};
		this.stats = {
			hits: 0,
			misses: 0,
			evictions: 0,
			currentSize: 0
		};
		this.cleanupTimer = null;

		// Start cleanup interval if specified
		if (this.options.cleanupInterval > 0) {
			this.cleanupTimer = setInterval(() => {
				this.cleanup();
			}, this.options.cleanupInterval);
		}
	}

	get(key: string): T | null {
		const entry = this.cache.get(key);

		if (!entry) {
			this.stats.misses++;
			return null;
		}

		// Check if entry is expired
		if (this.isExpired(entry)) {
			this.cache.delete(key);
			this.stats.misses++;
			return null;
		}

		// Update last accessed time for LRU
		entry.lastAccessed = Date.now();
		this.stats.hits++;
		return entry.data;
	}

	set(key: string, data: T): void {
		const now = Date.now();

		// Check if we need to evict an entry (LRU)
		if (this.cache.size >= this.options.maxSize) {
			this.evictLRU();
		}

		this.cache.set(key, {
			data,
			expiry: now + this.options.ttl,
			lastAccessed: now
		});

		this.stats.currentSize = this.cache.size;
	}

	delete(key: string): boolean {
		const result = this.cache.delete(key);
		if (result) {
			this.stats.currentSize = this.cache.size;
		}
		return result;
	}

	clear(): void {
		this.cache.clear();
		this.stats.currentSize = 0;
	}

	getStats(): CacheStats {
		return { ...this.stats };
	}

	resetStats(): void {
		this.stats = {
			hits: 0,
			misses: 0,
			evictions: 0,
			currentSize: this.cache.size
		};
	}

	private isExpired(entry: CacheEntry<T>): boolean {
		return Date.now() > entry.expiry;
	}

	private evictLRU(): void {
		let oldestKey: string | null = null;
		let oldestTime = Infinity;

		// Find the least recently used entry
		for (const [key, entry] of this.cache.entries()) {
			if (entry.lastAccessed < oldestTime) {
				oldestTime = entry.lastAccessed;
				oldestKey = key;
			}
		}

		// Remove the LRU entry
		if (oldestKey !== null) {
			this.cache.delete(oldestKey);
			this.stats.evictions++;
			this.stats.currentSize = this.cache.size;
		}
	}

	private cleanup(): void {
		const now = Date.now();
		let deletedCount = 0;

		for (const [key, entry] of this.cache.entries()) {
			if (now > entry.expiry) {
				this.cache.delete(key);
				deletedCount++;
			}
		}

		if (deletedCount > 0) {
			this.stats.currentSize = this.cache.size;
		}
	}

	// Clean up the timer when the cache is no longer needed
	destroy(): void {
		if (this.cleanupTimer) {
			clearInterval(this.cleanupTimer);
			this.cleanupTimer = null;
		}
	}
}