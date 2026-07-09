import { Global, Module } from "@nestjs/common";
import { JUDGE_QUEUE, REDIS_CLIENT, judgeQueueProvider, redisClientProvider } from "./redis.providers";

@Global()
@Module({
  providers: [redisClientProvider, judgeQueueProvider],
  exports: [REDIS_CLIENT, JUDGE_QUEUE],
})
export class RedisModule {}
