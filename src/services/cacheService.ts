import * as crypto from 'crypto';

export class CacheService {
    private cache: Map<string, CacheEntry>;
    private readonly TTL = 1000 * 60 * 60; // 1 hora

    constructor() {
        this.cache = new Map();
    }

    async getOrSet<T>(key: string, generator: () => Promise<T>): Promise<T> {
        const hash = this.hashKey(key);
        const cached = this.cache.get(hash);

        if (cached && !this.isExpired(cached)) {
            return cached.value as T;
        }

        const value = await generator();
        this.cache.set(hash, {
            value,
            timestamp: Date.now()
        });

        return value;
    }

    private hashKey(key: string): string {
        return crypto.createHash('md5').update(key).digest('hex');
    }

    private isExpired(entry: CacheEntry): boolean {
        return Date.now() - entry.timestamp > this.TTL;
    }
}

interface CacheEntry {
    value: any;
    timestamp: number;
}
