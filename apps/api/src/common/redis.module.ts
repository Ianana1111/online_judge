import { Global, Module } from "@nestjs/common";
import { CacheService } from "./cache.util";
import { JUDGE_QUEUE, REDIS_CLIENT, judgeQueueProvider, redisClientProvider } from "./redis.providers";

@Global()
@Module({
  providers: [redisClientProvider, judgeQueueProvider, CacheService],
  exports: [REDIS_CLIENT, JUDGE_QUEUE, CacheService],
})
export class RedisModule {}
