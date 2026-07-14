import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
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
import { RedisModule } from "./common/redis.module";
import { RolesGuard } from "./common/roles.guard";
import { HealthController } from "./health.controller";
import { ProblemsModule } from "./problems/problems.module";
import { SubmissionsModule } from "./submissions/submissions.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    // In-memory throttler storage for this pass; swap for a Redis-backed store (e.g.
    // @nest-lab/throttler-storage-redis) before running multiple API replicas in production.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    RedisModule,
    AuthModule,
    ProblemsModule,
    SubmissionsModule,
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
