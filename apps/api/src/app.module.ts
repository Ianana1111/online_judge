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
      // Distinguish requesters by their real client IP rather than the default `req.ip`, which —
      // without Express's `trust proxy` configured — is just the immediate socket peer: on
      // Railway, that peer is their own edge proxy, identical for every request that reaches this
      // service. Every visitor was silently sharing one rate-limit bucket: the global 120 req/min
      // cap was one person's budget for the whole platform, and one attacker probing the 10/min
      // login limit locked out every real user at the same time.
      //
      // This deliberately isn't `app.set("trust proxy", N)` for some guessed hop count N.
      // Railway's own community explicitly documents that hop count as unstable/undocumented —
      // getting N wrong either reintroduces this exact bug (too low) or lets a client spoof their
      // own X-Forwarded-For entry to pick any IP they like, poisoning someone else's bucket (too
      // high). Railway does document one header as an explicit "single source of truth for the
      // connecting IP" set by their own edge, immune to client spoofing: X-Real-IP. Local dev has
      // no proxy in front at all, so the raw socket address is already correct there.
      getTracker: (req) => {
        const realIp = req.headers?.["x-real-ip"];
        if (typeof realIp === "string" && realIp.length > 0) return realIp;
        return req.socket?.remoteAddress ?? req.ip ?? "unknown";
      },
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
