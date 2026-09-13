import { createRequestTracker } from "./common/runtime-config";
import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { ThrottlerStorageRedisService } from "@nest-lab/throttler-storage-redis";
import { AchievementsModule } from "./achievements/achievements.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { AssignmentsModule } from "./assignments/assignments.module";
import { AuthGuard } from "./auth/auth.guard";
import { AuthModule } from "./auth/auth.module";
import { BillingModule } from "./billing/billing.module";
import { ClassesModule } from "./classes/classes.module";
import { CollectionsModule } from "./collections/collections.module";
import { ContestsModule } from "./contests/contests.module";
import { CsrfGuard } from "./common/csrf.guard";
import { DiscussionsModule } from "./discussions/discussions.module";
import { LeaderboardModule } from "./leaderboard/leaderboard.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { PostsModule } from "./posts/posts.module";
import { REDIS_URL } from "./common/redis.providers";
import { RedisModule } from "./common/redis.module";
import { RolesGuard } from "./common/roles.guard";
import { HealthController } from "./health.controller";
import { OperationsModule } from "./operations/operations.module";
import { ProblemsModule } from "./problems/problems.module";
import { RunsModule } from "./runs/runs.module";
import { SubmissionsModule } from "./submissions/submissions.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 120 }],
      // Redis-backed storage (not the package default in-memory Map) so rate-limit counts are
      // shared across every API replica — an in-memory store would let a client simply get a
      // fresh budget on whichever replica happens to handle their next request.
      storage: new ThrottlerStorageRedisService(REDIS_URL),
      getTracker: createRequestTracker(),
    }),
    RedisModule,
    AuthModule,
    ProblemsModule,
    SubmissionsModule,
    RunsModule,
    ContestsModule,
    UsersModule,
    DiscussionsModule,
    AssignmentsModule,
    AnalyticsModule,
    ClassesModule,
    CollectionsModule,
    LeaderboardModule,
    BillingModule,
    NotificationsModule,
    AchievementsModule,
    PostsModule,
    OperationsModule,
  ],
  controllers: [HealthController],
  providers: [
    // Order matters: AuthGuard populates req.user before RolesGuard checks it.
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: CsrfGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
