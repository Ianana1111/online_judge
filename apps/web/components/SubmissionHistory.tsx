"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { SubmissionListItem } from "@/lib/types";
import { LANGUAGE_LABEL } from "@/lib/types";
import VerdictBadge from "@/components/VerdictBadge";
import SubmissionCodeModal from "@/components/SubmissionCodeModal";

export default function SubmissionHistory({ problemId }: { problemId: string }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["submissions", "mine", problemId],
    queryFn: () =>
      apiFetch<{ items: SubmissionListItem[]; total: number }>(
        `/submissions?user=me&problem=${problemId}&page=1`,
      ),
  });

  if (isLoading) return <p className="text-sm text-ink-400">Loading history…</p>;
  const items = data?.items ?? [];
  if (items.length === 0) return <p className="text-sm text-ink-400">No submissions yet for this problem.</p>;

  return (
    <>
      <table className="oj-table">
        <thead>
          <tr>
            <th>When</th>
            <th>Language</th>
            <th>Verdict</th>
            <th>Time</th>
            <th>Memory</th>
          </tr>
        </thead>
        <tbody>
          {items.map((s) => (
            <tr key={s.id} onClick={() => setOpenId(s.id)} className="cursor-pointer transition-colors hover:bg-ink-800/50">
              <td className="font-mono text-xs text-ink-400">{new Date(s.createdAt).toLocaleString()}</td>
              <td>{LANGUAGE_LABEL[s.languageKey] ?? s.languageKey}</td>
              <td>
                <VerdictBadge verdict={s.verdict} size="sm" />
              </td>
              <td className="font-mono text-ink-400">{s.timeMs != null ? `${s.timeMs} ms` : "—"}</td>
              <td className="font-mono text-ink-400">
                {s.memoryKb != null ? `${Math.round(s.memoryKb / 1024)} MB` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {openId && <SubmissionCodeModal submissionId={openId} onClose={() => setOpenId(null)} />}
    </>
  );
}
