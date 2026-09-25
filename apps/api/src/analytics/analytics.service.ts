import { Injectable } from "@nestjs/common";
import { prisma } from "@oj/db";
import type { RecordPageviewDto } from "@oj/shared";
import { isBotUserAgent, isSpamReferrer } from "./pageview-filters";

// Fixed taxonomy used to tag every scraped CPE problem's primary algorithmic topic (see
// packages/db/scripts/apply-topic-tags.ts). Kept here so analytics queries know which tag slugs
// are "topics" as opposed to other unrelated tags (e.g. the hand-seeded "warmup" tag).
export const TOPIC_SLUGS = [
  "math",
  "geometry",
  "string",
  "array",
  "sorting-searching",
  "greedy",
  "dp",
  "graph",
  "recursion-backtracking",
  "datastructure",
  "simulation",
  "adhoc",
] as const;

@Injectable()
export class AnalyticsService {
  /** CPE's own published "average correct count" per sitting — a difficulty/pass-rate signal
   * independent of our own platform's usage. */
  async avgCorrectTrend() {
    const contests = await prisma.contest.findMany({
      where: { kind: "CPE", avgCorrectCount: { not: null } },
      select: { slug: true, title: true, avgCorrectCount: true },
      orderBy: { slug: "asc" },
    });
    return contests.map((c) => ({
      date: c.slug.replace(/^cpe-/, ""),
      title: c.title,
      avgCorrectCount: c.avgCorrectCount,
    }));
  }

  /** Real CPE exam-taker answer stats (correct/incorrect/attempted), aggregated by problem
   * position (label A-G) across every sitting that published per-problem stats. Distinct from
   * topicPerformance() below: this is the actual historical exam population, not our own users. */
  async answerRateByLabel() {
    const rows = await prisma.contestProblem.findMany({
      where: { contest: { kind: "CPE" }, correct: { not: null } },
      select: { label: true, submissions: true, attempted: true, correct: true },
    });

    const grid: Record<
      string,
      { sittings: number; submissions: number; attempted: number; correct: number; incorrect: number }
    > = {};
    for (const r of rows) {
      const bucket = (grid[r.label] ??= { sittings: 0, submissions: 0, attempted: 0, correct: 0, incorrect: 0 });
      bucket.sittings += 1;
      bucket.submissions += r.submissions ?? 0;
      bucket.attempted += r.attempted ?? 0;
      bucket.correct += r.correct ?? 0;
      bucket.incorrect += (r.attempted ?? 0) - (r.correct ?? 0);
    }

    return Object.entries(grid)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, v]) => ({
        label,
        ...v,
        correctRate: v.attempted > 0 ? v.correct / v.attempted : null,
      }));
  }

  /** Topic distribution broken down by problem position (label A-G) across all CPE sittings —
   * answers "does DFS/DP start appearing from position D onward?" */
  async topicByLabel() {
    const rows = await prisma.contestProblem.findMany({
      where: { contest: { kind: "CPE" } },
      select: {
        label: true,
        problem: { select: { tags: { select: { tag: { select: { slug: true } } } } } },
      },
    });

    const topicSet = new Set<string>(TOPIC_SLUGS);
    const grid: Record<string, Record<string, number>> = {};
    for (const row of rows) {
      const topic = row.problem.tags.map((t) => t.tag.slug).find((slug) => topicSet.has(slug));
      if (!topic) continue;
      grid[row.label] ??= {};
      grid[row.label][topic] = (grid[row.label][topic] ?? 0) + 1;
    }

    return Object.entries(grid)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, topics]) => ({ label, topics }));
  }

  /** Problems that have appeared as the same label across multiple sittings — likely-to-recur
   * "warmup" problems worth flagging to students preparing for an upcoming exam. */
  async repeatProblems() {
    const rows = await prisma.contestProblem.findMany({
      where: { contest: { kind: "CPE" } },
      select: {
        label: true,
        contest: { select: { slug: true } },
        problem: {
          select: { id: true, uvaId: true, title: true, tags: { select: { tag: { select: { slug: true } } } } },
        },
      },
    });

    const topicSet = new Set<string>(TOPIC_SLUGS);
    const byProblem = new Map<
      string,
      { uvaId: number | null; title: string; topic: string | null; occurrences: { date: string; label: string }[] }
    >();
    for (const row of rows) {
      const entry = byProblem.get(row.problem.id) ?? {
        uvaId: row.problem.uvaId,
        title: row.problem.title,
        topic: row.problem.tags.map((t) => t.tag.slug).find((slug) => topicSet.has(slug)) ?? null,
        occurrences: [],
      };
      entry.occurrences.push({ date: row.contest.slug.replace(/^cpe-/, ""), label: row.label });
      byProblem.set(row.problem.id, entry);
    }

    return [...byProblem.values()]
      .filter((p) => p.occurrences.length > 1)
      .sort((a, b) => b.occurrences.length - a.occurrences.length);
  }

  /** Real platform usage per topic — grows meaningful as students actually submit. Distinct from
   * the historical-difficulty analysis above: this measures how OUR users actually perform. */
  async topicPerformance() {
    const submissions = await prisma.submission.findMany({
      where: { problem: { source: "CPE" } },
      select: {
        userId: true,
        verdict: true,
        problem: { select: { tags: { select: { tag: { select: { slug: true } } } } } },
      },
    });

    const topicSet = new Set<string>(TOPIC_SLUGS);
    const stats: Record<string, { submissions: number; ac: number; users: Set<string> }> = {};
    for (const s of submissions) {
      const topic = s.problem.tags.map((t) => t.tag.slug).find((slug) => topicSet.has(slug));
      if (!topic) continue;
      stats[topic] ??= { submissions: 0, ac: 0, users: new Set() };
      stats[topic].submissions += 1;
      if (s.verdict === "AC") stats[topic].ac += 1;
      stats[topic].users.add(s.userId);
    }

    return Object.entries(stats).map(([topic, s]) => ({
      topic,
      submissions: s.submissions,
      acRate: s.submissions > 0 ? s.ac / s.submissions : null,
      distinctUsers: s.users.size,
      avgAttemptsPerUser: s.users.size > 0 ? s.submissions / s.users.size : null,
    }));
  }

  // --- Self-hosted pageview/referrer traffic analytics ---

  /** Records one pageview beacon, or silently drops it if it looks like bot/crawler traffic or a
   * forged referrer-spam hit (see pageview-filters.ts) — this table is meant to already be clean
   * data, not a raw log a report layer has to re-filter every time it's queried. */
  async recordPageview(dto: RecordPageviewDto, userAgent: string | undefined, userId: string | null) {
    if (isBotUserAgent(userAgent)) return;
    if (dto.referrer && isSpamReferrer(dto.referrer)) return;

    // Only external referrers are interesting for acquisition tracking — same-origin navigation
    // (clicking between our own pages) isn't a "referrer" in the sense this report cares about.
    let referrer = dto.referrer || null;
    if (referrer) {
      const ownOrigins = (process.env.WEB_ORIGIN ?? "").split(",").map((o) => o.trim());
      try {
        const refOrigin = new URL(referrer).origin;
        // Keep only the origin. External referral URLs may contain private search terms,
        // invitation tokens or campaign parameters that analytics does not need.
        referrer = ownOrigins.includes(refOrigin) ? null : refOrigin;
      } catch {
        referrer = null; // not a valid absolute URL — not useful as a referrer, drop it
      }
    }

    await prisma.pageView.create({
      data: { path: dto.path, referrer, userAgent: userAgent ?? null, userId },
    });
  }

  async trafficSummary(days: number) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const [totalViews, distinctPaths] = await Promise.all([
      prisma.pageView.count({ where: { createdAt: { gte: since } } }),
      prisma.pageView.findMany({
        where: { createdAt: { gte: since } },
        distinct: ["path"],
        select: { path: true },
      }),
    ]);
    return { totalViews, distinctPaths: distinctPaths.length, days };
  }

  async dailyTraffic(days: number) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const rows = await prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT to_char(date_trunc('day', "createdAt" AT TIME ZONE 'Asia/Taipei'), 'YYYY-MM-DD') AS date, COUNT(*)::bigint AS count
      FROM "page_views"
      WHERE "createdAt" >= ${since}
      GROUP BY 1
      ORDER BY 1 ASC
    `;
    return rows.map((r) => ({ date: r.date, count: Number(r.count) }));
  }

  async topPages(days: number, limit: number) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const rows = await prisma.pageView.groupBy({
      by: ["path"],
      where: { createdAt: { gte: since } },
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: limit,
    });
    return rows.map((r) => ({ path: r.path, count: r._count.path }));
  }

  async topReferrers(days: number, limit: number) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const rows = await prisma.pageView.groupBy({
      by: ["referrer"],
      where: { createdAt: { gte: since }, referrer: { not: null } },
      _count: { referrer: true },
      orderBy: { _count: { referrer: "desc" } },
      take: limit,
    });
    return rows.map((r) => ({ referrer: r.referrer!, count: r._count.referrer }));
  }

  /** Admin-only product view. Time buckets use Taiwan local time; amounts count confirmed
   * payments only. A card authorization is a hold, never booked as revenue. */
  async productDashboard(days: number) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const [hours, signups, loggedInViews, solvers, acceptedUsers, submissions, examStarts,
      publishedPosts, publishedComments, paidPayments, paymentStatuses, activeSubscriptions,
      cancelledSubscriptions, cancellations, refundStatuses, recentPayments, recentCancellations] = await Promise.all([
      prisma.$queryRaw<{ hour: number; views: bigint }[]>`
        SELECT EXTRACT(HOUR FROM "createdAt" AT TIME ZONE 'Asia/Taipei')::int AS hour,
               COUNT(*)::bigint AS views
        FROM "page_views" WHERE "createdAt" >= ${since}
        GROUP BY 1 ORDER BY 1`,
      prisma.user.count({ where: { createdAt: { gte: since }, deletionRequestedAt: null, role: "USER" } }),
      prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(DISTINCT "userId")::bigint AS count FROM "page_views" WHERE "createdAt" >= ${since} AND "userId" IS NOT NULL`,
      prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(DISTINCT "userId")::bigint AS count FROM "submissions" WHERE "createdAt" >= ${since}`,
      prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(DISTINCT "userId")::bigint AS count FROM "submissions" WHERE "createdAt" >= ${since} AND "verdict" = 'AC'`,
      prisma.submission.groupBy({ by: ["verdict"], where: { createdAt: { gte: since } }, _count: { _all: true } }),
      prisma.contestParticipant.count({ where: { startedAt: { gte: since } } }),
      prisma.post.count({ where: { publishedAt: { gte: since }, deletedAt: null } }),
      prisma.discussion.count({ where: { publishedAt: { gte: since }, deletedAt: null } }),
      prisma.payment.aggregate({ where: { status: "APPROVED", paidAt: { gte: since } }, _count: { _all: true }, _sum: { amountNtd: true } }),
      prisma.payment.groupBy({ by: ["status"], where: { createdAt: { gte: since } }, _count: { _all: true } }),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.subscription.count({ where: { status: "CANCELLED", cancelledAt: { gte: since } } }),
      prisma.subscription.groupBy({ by: ["amountNtd", "period"], where: { status: "ACTIVE" }, _count: { _all: true } }),
      prisma.refundRequest.groupBy({ by: ["status"], where: { requestedAt: { gte: since } }, _count: { _all: true } }),
      prisma.payment.findMany({ where: { createdAt: { gte: since }, status: { in: ["APPROVED", "AUTHORIZED", "REFUNDED"] } },
        orderBy: { createdAt: "desc" }, take: 30,
        select: { id: true, amountNtd: true, period: true, status: true, method: true, createdAt: true, paidAt: true, user: { select: { handle: true } } } }),
      prisma.subscription.findMany({ where: { status: "CANCELLED", cancelledAt: { gte: since } },
        orderBy: { cancelledAt: "desc" }, take: 30,
        select: { id: true, amountNtd: true, period: true, cancelledAt: true, user: { select: { handle: true } } } }),
    ]);
    const byHour = new Map(hours.map(row => [row.hour, Number(row.views)]));
    const hourlyTraffic = Array.from({ length: 24 }, (_, hour) => ({ hour, views: byHour.get(hour) ?? 0 }));
    const paidAt200 = await prisma.payment.count({ where: { status: "APPROVED", amountNtd: 200, paidAt: { gte: since } } });
    const paidAt2000 = await prisma.payment.count({ where: { status: "APPROVED", amountNtd: 2000, paidAt: { gte: since } } });
    return {
      days, timezone: "Asia/Taipei", hourlyTraffic,
      usage: { signups, loggedInVisitors: Number(loggedInViews[0]?.count ?? 0), solvers: Number(solvers[0]?.count ?? 0),
        acceptedUsers: Number(acceptedUsers[0]?.count ?? 0), submissions: Object.fromEntries(submissions.map(row => [row.verdict, row._count._all])),
        examStarts, publishedPosts, publishedComments },
      billing: { confirmedPaymentCount: paidPayments._count._all, confirmedGrossNtd: paidPayments._sum.amountNtd ?? 0,
        paidAt200, paidAt2000, paymentStatuses: Object.fromEntries(paymentStatuses.map(row => [row.status, row._count._all])),
        activeSubscriptions, cancelledSubscriptions,
        committedRecurringNtdPerMonth: cancellations.reduce((sum, row) => sum + row.amountNtd * row._count._all / (row.period === "YEARLY" ? 12 : 1), 0),
        refundStatuses: Object.fromEntries(refundStatuses.map(row => [row.status, row._count._all])),
        recentPayments, recentCancellations },
    };
  }
}
