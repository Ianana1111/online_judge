import { Global, Module } from "@nestjs/common";
import { CacheService } from "./cache.util";
import {
  JUDGE_LOCAL_QUEUE,
  JUDGE_REMOTE_QUEUE,
  REDIS_CLIENT,
  TEST_RUN_QUEUE,
  judgeLocalQueueProvider,
  judgeRemoteQueueProvider,
  redisClientProvider,
  testRunQueueProvider,
} from "./redis.providers";

@Global()
@Module({
  providers: [redisClientProvider, judgeLocalQueueProvider, judgeRemoteQueueProvider, testRunQueueProvider, CacheService],
  exports: [REDIS_CLIENT, JUDGE_LOCAL_QUEUE, JUDGE_REMOTE_QUEUE, TEST_RUN_QUEUE, CacheService],
})
export class RedisModule {}
