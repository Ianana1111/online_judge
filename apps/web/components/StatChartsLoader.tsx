"use client";

import dynamic from "next/dynamic";
import type { UserStats } from "@/lib/types";

// recharts is a large charting bundle only needed on the profile page — deferring it out of the
// server-rendered page's initial JS keeps the rest of the dashboard (ring, heatmap) interactive
// sooner. ssr:false because next/dynamic only supports that option from a Client Component, and
// the page importing this is a Server Component.
const StatCharts = dynamic(() => import("@/components/StatCharts"), {
  ssr: false,
  loading: () => (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="oj-card h-64 animate-pulse bg-ink-900" />
      <div className="oj-card h-64 animate-pulse bg-ink-900" />
      <div className="oj-card h-64 animate-pulse bg-ink-900" />
    </div>
  ),
});

export default function StatChartsLoader({ stats }: { stats: UserStats }) {
  return <StatCharts stats={stats} />;
}
