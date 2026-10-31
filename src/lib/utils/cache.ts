interface CacheEntry<T> {
	data: T;
	timestamp: number;
}

export class ClientCache<T> {
	private cache = new Map<string, CacheEntry<T>>();
	private ttl: number;
	private maxSize: number;

	constructor(ttlMs: number, maxSize: number = 10) {
		this.ttl = ttlMs;
		this.maxSize = maxSize;
	}

	get(key: string): T | null {
		const entry = this.cache.get(key);
		if (!entry) return null;

		if (Date.now() - entry.timestamp > this.ttl) {
			this.cache.delete(key);
			return null;
		}

		return entry.data;
	}

	set(key: string, data: T): void {
		// FIFO: 캐시가 가득 차면 가장 오래된 항목 제거
		if (this.cache.size >= this.maxSize) {
			const firstKey = this.cache.keys().next().value;
			if (firstKey) {
				this.cache.delete(firstKey);
			}
		}

		this.cache.set(key, {
			data,
			timestamp: Date.now()
		});
	}

	clear(): void {
		this.cache.clear();
	}

	cleanup(): void {
		const now = Date.now();
		for (const [key, entry] of this.cache.entries()) {
			if (now - entry.timestamp > this.ttl) {
				this.cache.delete(key);
			}
		}
	}
}
