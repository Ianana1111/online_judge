import { Global, Module } from "@nestjs/common";
import { CacheService } from "./cache.util";
import {
  JUDGE_QUEUE,
  REDIS_CLIENT,
  TEST_RUN_QUEUE,
  judgeQueueProvider,
  redisClientProvider,
  testRunQueueProvider,
} from "./redis.providers";

@Global()
@Module({
  providers: [redisClientProvider, judgeQueueProvider, testRunQueueProvider, CacheService],
  exports: [REDIS_CLIENT, JUDGE_QUEUE, TEST_RUN_QUEUE, CacheService],
})
export class RedisModule {}
