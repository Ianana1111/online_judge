"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import VerdictBadge from "@/components/VerdictBadge";
import SubmissionCodeModal from "@/components/SubmissionCodeModal";
import { SkeletonList } from "@/components/Skeleton";
import QueryBoundary from "@/components/QueryBoundary";
import { LANGUAGE_LABEL } from "@/lib/types";
import type { SubmissionListItem, UserProfile } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";

function SubmissionRow({ s, onOpen }: { s: SubmissionListItem; onOpen: (id: string) => void }) {
  const t = useT();
  return (
    <tr
      onClick={() => onOpen(s.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(s.id);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={t("View submission for {title}", { title: s.problemTitle ?? "" })}
      className="cursor-pointer transition-colors hover:bg-ink-800/50 focus:outline-none focus-visible:bg-ink-800/50 focus-visible:ring-1 focus-visible:ring-brand"
    >
      <td className="font-mono text-xs text-ink-400">{new Date(s.createdAt).toLocaleString()}</td>
      <td>
        {s.problemSlug ? (
          <Link
            href={`/problems/${s.problemSlug}`}
            onClick={(e) => e.stopPropagation()}
            className="text-ink-200 hover:text-brand"
          >
            {s.problemTitle}
          </Link>
        ) : (
          s.problemTitle
        )}
      </td>
      <td className="text-xs text-ink-400">{t(LANGUAGE_LABEL[s.languageKey] ?? s.languageKey)}</td>
      <td>
        <VerdictBadge verdict={s.verdict} size="sm" />
      </td>
      <td className="font-mono text-xs text-ink-400">{s.timeMs != null ? `${s.timeMs} ms` : "—"}</td>
    </tr>
  );
}

export default function MySubmissionsPage() {
  const t = useT();
  const { user, status: authStatus } = useAuthStore();
  const [groupBy, setGroupBy] = useState<"time" | "topic">("time");
  const [openId, setOpenId] = useState<string | null>(null);

  const submissionsQuery = useQuery({
    queryKey: ["submissions", "me", "all"],
    queryFn: () => apiFetch<{ items: SubmissionListItem[]; total: number }>("/submissions?user=me&pageSize=200"),
    enabled: !!user,
  });
  const { data } = submissionsQuery;

  const { data: profile } = useQuery({
    queryKey: ["users", user?.handle, "profile"],
    queryFn: () => apiFetch<UserProfile>(`/users/${user!.handle}`),
    enabled: !!user,
  });

  const byTopic = useMemo(() => {
    const groups = new Map<string, SubmissionListItem[]>();
    for (const s of data?.items ?? []) {
      const topic = s.problemTags?.[0] ?? "untagged";
      const list = groups.get(topic) ?? [];
      list.push(s);
      groups.set(topic, list);
    }
    return [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [data]);

  if (authStatus === "ready" && !user) {
    return <p className="text-sm text-verdict-wa">{t("Log in to see your submission history.")}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-50">{t("My Submissions")}</h1>
          <p className="mt-1 text-sm text-ink-400">
            {data ? t("{n} submissions total", { n: data.total }) : t("Loading…")}
          </p>
        </div>
        {profile && (
          <Link href={`/u/${profile.handle}`} className="oj-card flex items-center gap-3 px-4 py-2 hover:border-brand/40">
            <span className="font-display text-2xl font-bold text-brand">{profile.solvedCount}</span>
            <span className="text-sm text-ink-400">
              {t("problems solved", { n: profile.solvedCount })}
              <br />
              <span className="text-xs text-ink-500">{t("view full activity →")}</span>
            </span>
          </Link>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setGroupBy("time")}
          className={groupBy === "time" ? "oj-btn-primary px-3 py-1.5 text-xs" : "oj-btn-secondary px-3 py-1.5 text-xs"}
        >
          {t("By time")}
        </button>
        <button
          onClick={() => setGroupBy("topic")}
          className={groupBy === "topic" ? "oj-btn-primary px-3 py-1.5 text-xs" : "oj-btn-secondary px-3 py-1.5 text-xs"}
        >
          {t("By topic")}
        </button>
      </div>

      <QueryBoundary
        query={submissionsQuery}
        loading={<SkeletonList rows={8} />}
        isEmpty={(d) => d.items.length === 0}
        empty={
          <div className="oj-card p-4 text-sm text-ink-400">
            <p>{t("No submissions yet.")}</p>
            <Link href="/problems" className="mt-2 inline-block text-brand hover:underline">
              {t("Solve your first problem →")}
            </Link>
          </div>
        }
      >
        {() => (
          <>
            {groupBy === "time" && data && (
              <table className="oj-table">
                <thead>
                  <tr>
                    <th>{t("When")}</th>
                    <th>{t("Problem")}</th>
                    <th>{t("Language")}</th>
                    <th>{t("Verdict")}</th>
                    <th>{t("Time")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((s) => (
                    <SubmissionRow key={s.id} s={s} onOpen={setOpenId} />
                  ))}
                </tbody>
              </table>
            )}

            {groupBy === "topic" && (
              <div className="space-y-6">
                {byTopic.map(([topic, items]) => (
                  <div key={topic}>
                    <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-400">
                      {topic} <span className="font-normal normal-case text-ink-500">({items.length})</span>
                    </h2>
                    <table className="oj-table">
                      <thead>
                        <tr>
                          <th>{t("When")}</th>
                          <th>{t("Problem")}</th>
                          <th>{t("Language")}</th>
                          <th>{t("Verdict")}</th>
                          <th>{t("Time")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((s) => (
                          <SubmissionRow key={s.id} s={s} onOpen={setOpenId} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </QueryBoundary>

      {openId && <SubmissionCodeModal submissionId={openId} onClose={() => setOpenId(null)} />}
    </div>
  );
}
