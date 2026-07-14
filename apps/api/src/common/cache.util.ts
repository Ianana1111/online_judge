import { Inject, Injectable } from "@nestjs/common";
import type Redis from "ioredis";
import { REDIS_CLIENT } from "./redis.providers";

/**
 * Thin get-or-compute cache over the shared Redis client, for expensive reads that are safe to
 * serve slightly stale (leaderboard, contest scoreboard) — not a general-purpose cache, and not
 * invalidated on write, just TTL-bounded. A cache miss/error always falls through to `compute()`
 * so a Redis hiccup degrades to "slower", never "broken".
 */
@Injectable()
export class CacheService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async getOrSet<T>(key: string, ttlSec: number, compute: () => Promise<T>): Promise<T> {
    try {
      const cached = await this.redis.get(key);
      if (cached !== null) return JSON.parse(cached) as T;
    } catch {
      // Redis unavailable or corrupt entry — fall through to compute() below.
    }

    const value = await compute();

    try {
      await this.redis.set(key, JSON.stringify(value), "EX", ttlSec);
    } catch {
      // Best-effort — a failed cache write shouldn't fail the request that already has its data.
    }

    return value;
  }
}
