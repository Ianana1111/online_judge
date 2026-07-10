"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { MyContest } from "@/lib/types";

function StatusBadge({ status }: { status: "RUNNING" | "FINISHED" }) {
  return (
    <span
      className={`rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        status === "RUNNING"
          ? "border-verdict-tle/40 bg-verdict-tle/10 text-verdict-tle"
          : "border-ink-600 bg-ink-800 text-ink-400"
      }`}
    >
      {status === "RUNNING" ? "In progress" : "Finished"}
    </span>
  );
}

export default function ContestsPage() {
  const { user, status: authStatus } = useAuthStore();

  const { data: mine, isLoading } = useQuery({
    queryKey: ["contests", "me"],
    queryFn: () => apiFetch<MyContest[]>("/contests/me"),
    enabled: !!user,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-50">Contests</h1>
        <p className="mt-1 text-sm text-ink-400">
          Your own exam attempts show up here once you start one — browse and start a CPE sitting from{" "}
          <Link href="/cpe" className="text-brand hover:underline">
            the CPE hub
          </Link>
          .
        </p>
      </div>

      {authStatus === "ready" && !user && (
        <div className="oj-card p-6 text-center">
          <p className="text-sm text-ink-300">Log in to start a virtual exam and track your attempts here.</p>
          <Link href="/login" className="oj-btn-primary mt-3 inline-block px-4 py-2 text-sm">
            Log in
          </Link>
        </div>
      )}

      {isLoading && <p className="text-sm text-ink-400">Loading…</p>}

      {user && mine?.length === 0 && (
        <div className="oj-card p-6 text-center">
          <p className="text-sm text-ink-300">You haven't started any exams yet.</p>
          <Link href="/cpe" className="oj-btn-primary mt-3 inline-block px-4 py-2 text-sm">
            Browse CPE sittings
          </Link>
        </div>
      )}

      <div className="space-y-2">
        {mine?.map((c) => (
          <Link key={c.id} href={`/contests/${c.id}`} className="oj-card block p-4 transition-colors hover:border-brand">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-mono text-xs uppercase text-ink-500">{c.kind}</span>
                  <StatusBadge status={c.status} />
                </div>
                <h3 className="font-medium text-ink-50">{c.title}</h3>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm text-brand">
                  {c.solvedCount} / {c.totalProblems} solved
                </p>
                <p className="mt-0.5 font-mono text-xs text-ink-500">
                  started {new Date(c.startedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
