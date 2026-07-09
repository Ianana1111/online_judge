import { Controller, Get, Inject, ServiceUnavailableException } from "@nestjs/common";
import type Redis from "ioredis";
import { prisma } from "@oj/db";
import { Public } from "./common/decorators";
import { REDIS_CLIENT } from "./common/redis.providers";

@Controller("health")
export class HealthController {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  @Public()
  @Get()
  async check() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      await this.redis.ping();
      return { status: "ok" };
    } catch {
      throw new ServiceUnavailableException({ status: "error" });
    }
  }
}
