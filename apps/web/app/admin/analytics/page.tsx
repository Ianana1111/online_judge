"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type {
  AnswerRateByLabelRow,
  AvgCorrectPoint,
  RepeatProblem,
  TopicByLabelRow,
  TopicPerformance,
} from "@/lib/types";

// Ordered easiest -> hardest (algorithmic sophistication required), not by frequency — so the
// stacked bars and legend read as "simple techniques first, advanced ones stacking on top".
const TOPIC_ORDER = [
  "adhoc",
  "array",
  "math",
  "string",
  "simulation",
  "geometry",
  "sorting-searching",
  "greedy",
  "recursion-backtracking",
  "datastructure",
  "graph",
  "dp",
];
const TOPIC_LABEL: Record<string, string> = {
  math: "Math",
  dp: "DP",
  graph: "Graph",
  string: "String",
  "sorting-searching": "Sorting/Searching",
  array: "Array",
  datastructure: "Data Structure",
  simulation: "Simulation",
  greedy: "Greedy",
  "recursion-backtracking": "Recursion/Backtracking",
  geometry: "Geometry",
  adhoc: "Ad-hoc",
};
const TOPIC_COLOR: Record<string, string> = {
  math: "#5B8DEF",
  dp: "#E8734D",
  graph: "#6FCF97",
  string: "#B98CE0",
  "sorting-searching": "#E8A33D",
  array: "#4FB8B8",
  datastructure: "#D488B9",
  simulation: "#9AA8B5",
  greedy: "#C9A13B",
  "recursion-backtracking": "#7A93E8",
  geometry: "#E06B6B",
  adhoc: "#6b7a8b",
};
const LABEL_ORDER = ["A", "B", "C", "D", "E", "F", "G"];

const tooltipStyle = {
  background: "#141a22",
  border: "1px solid #2a3441",
  borderRadius: 6,
  fontSize: 12,
  color: "#e8ecef",
};

export default function AdminAnalyticsPage() {
  const { user, status } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

  const { data: avgTrend } = useQuery({
    queryKey: ["analytics", "avg-correct-trend"],
    queryFn: () => apiFetch<AvgCorrectPoint[]>("/analytics/avg-correct-trend"),
    enabled: isAdmin,
  });
  const { data: answerRate } = useQuery({
    queryKey: ["analytics", "answer-rate-by-label"],
    queryFn: () => apiFetch<AnswerRateByLabelRow[]>("/analytics/answer-rate-by-label"),
    enabled: isAdmin,
  });
  const { data: topicByLabel } = useQuery({
    queryKey: ["analytics", "topic-by-label"],
    queryFn: () => apiFetch<TopicByLabelRow[]>("/analytics/topic-by-label"),
    enabled: isAdmin,
  });
  const { data: repeatProblems } = useQuery({
    queryKey: ["analytics", "repeat-problems"],
    queryFn: () => apiFetch<RepeatProblem[]>("/analytics/repeat-problems"),
    enabled: isAdmin,
  });
  const { data: topicPerf } = useQuery({
    queryKey: ["analytics", "topic-performance"],
    queryFn: () => apiFetch<TopicPerformance[]>("/analytics/topic-performance"),
    enabled: isAdmin,
  });

  if (status === "ready" && !isAdmin) {
    return <p className="text-sm text-verdict-wa">Admins only.</p>;
  }

  const labelChartData = LABEL_ORDER.map((label) => {
    const row = topicByLabel?.find((r) => r.label === label);
    const entry: Record<string, string | number> = { label };
    for (const topic of TOPIC_ORDER) entry[topic] = row?.topics[topic] ?? 0;
    return entry;
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-50">Admin · CPE Analytics</h1>
        <p className="mt-1 text-sm text-ink-400">
          Historical CPE exam difficulty/topic trends, alongside real usage stats from this platform.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-ink-200">
          Average correct count per sitting (published by CPE)
        </h2>
        <div className="oj-card p-4">
          {!avgTrend || avgTrend.length === 0 ? (
            <p className="text-sm text-ink-400">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={avgTrend} margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2530" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#6b7a8b", fontSize: 10 }}
                  axisLine={{ stroke: "#2a3441" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[0, 7]}
                  tick={{ fill: "#6b7a8b", fontSize: 11 }}
                  axisLine={{ stroke: "#2a3441" }}
                  label={{ value: "avg correct / 7", angle: -90, fill: "#6b7a8b", fontSize: 11 }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="avgCorrectCount" stroke="#e8a33d" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-ink-200">
          Real exam-taker answer rate by problem position (A–G)
        </h2>
        <div className="oj-card p-4">
          {!answerRate || answerRate.length === 0 ? (
            <p className="text-sm text-ink-400">No data yet.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={answerRate} margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2530" />
                  <XAxis dataKey="label" tick={{ fill: "#9aa8b5", fontSize: 12 }} axisLine={{ stroke: "#2a3441" }} />
                  <YAxis tick={{ fill: "#6b7a8b", fontSize: 11 }} axisLine={{ stroke: "#2a3441" }} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#1c2530" }} />
                  <Legend wrapperStyle={{ fontSize: 11, color: "#9aa8b5" }} />
                  <Bar dataKey="correct" stackId="ans" fill="#2fae5e" name="Correct" />
                  <Bar dataKey="incorrect" stackId="ans" fill="#d9534f" name="Incorrect (attempted, not solved)" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 overflow-x-auto">
                <table className="oj-table">
                  <thead>
                    <tr>
                      <th>Label</th>
                      <th>Attempted</th>
                      <th>Correct</th>
                      <th>Incorrect</th>
                      <th>Correct rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {answerRate.map((r) => (
                      <tr key={r.label}>
                        <td className="font-mono text-brand">{r.label}</td>
                        <td className="font-mono">{r.attempted.toLocaleString()}</td>
                        <td className="font-mono text-verdict-ac">{r.correct.toLocaleString()}</td>
                        <td className="font-mono text-verdict-wa">{r.incorrect.toLocaleString()}</td>
                        <td className="font-mono">
                          {r.correctRate != null ? `${(r.correctRate * 100).toFixed(1)}%` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-ink-500">
                Real CPE exam-taker outcomes (not this platform's users) — "Incorrect" means attempted but never
                solved, aggregated across all 47 sittings' published per-problem stats.
              </p>
            </>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-ink-200">Topic distribution by problem position (A–G)</h2>
        <p className="mb-2 text-xs text-ink-500">
          Legend and stacking order run <b>easiest → hardest</b> (ad-hoc/array/math/string/simulation/geometry →
          sorting/greedy/recursion → data structure/graph/<b>DP, hardest</b>) — read straight off how many problems
          at each position are fundamentally simple vs. advanced.
        </p>
        <div className="oj-card p-4">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={labelChartData} margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2530" />
              <XAxis dataKey="label" tick={{ fill: "#9aa8b5", fontSize: 12 }} axisLine={{ stroke: "#2a3441" }} />
              <YAxis tick={{ fill: "#6b7a8b", fontSize: 11 }} axisLine={{ stroke: "#2a3441" }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#1c2530" }} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#9aa8b5" }} />
              {TOPIC_ORDER.map((topic) => (
                <Bar key={topic} dataKey={topic} stackId="topics" fill={TOPIC_COLOR[topic]} name={TOPIC_LABEL[topic]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-2 text-xs text-ink-500">
            A = first/easiest problem in each sitting, G = last/hardest. Watch where DP and Graph first become
            common.
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-ink-200">Repeated problems across sittings</h2>
        <div className="oj-card overflow-x-auto p-4">
          {!repeatProblems || repeatProblems.length === 0 ? (
            <p className="text-sm text-ink-400">No repeats found.</p>
          ) : (
            <table className="oj-table">
              <thead>
                <tr>
                  <th>Problem</th>
                  <th>Topic</th>
                  <th>Label(s)</th>
                  <th>Times used</th>
                  <th>Sittings (date @ label)</th>
                </tr>
              </thead>
              <tbody>
                {repeatProblems.map((p) => {
                  const labels = [...new Set(p.occurrences.map((o) => o.label))];
                  return (
                    <tr key={p.uvaId ?? p.title}>
                      <td className="whitespace-nowrap">
                        <span className="font-mono text-xs text-ink-500">UVa {p.uvaId}</span>
                        <br />
                        {p.title}
                      </td>
                      <td>
                        {p.topic ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: TOPIC_COLOR[p.topic] }} />
                            {TOPIC_LABEL[p.topic] ?? p.topic}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="font-mono text-brand">{labels.join(" / ")}</td>
                      <td className="font-mono text-brand">{p.occurrences.length}</td>
                      <td className="text-xs text-ink-400">
                        {p.occurrences.map((o) => `${o.date}@${o.label}`).join(", ")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-ink-200">
          Real AC rate / avg attempts by topic (this platform's own usage)
        </h2>
        <div className="oj-card overflow-x-auto p-4">
          {!topicPerf || topicPerf.length === 0 ? (
            <p className="text-sm text-ink-400">
              No submissions against CPE-sourced problems yet — this fills in as students use the platform.
            </p>
          ) : (
            <table className="oj-table">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Submissions</th>
                  <th>Distinct users</th>
                  <th>AC rate</th>
                  <th>Avg attempts / user</th>
                </tr>
              </thead>
              <tbody>
                {topicPerf
                  .slice()
                  .sort((a, b) => b.submissions - a.submissions)
                  .map((t) => (
                    <tr key={t.topic}>
                      <td>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: TOPIC_COLOR[t.topic] }} />
                          {TOPIC_LABEL[t.topic] ?? t.topic}
                        </span>
                      </td>
                      <td className="font-mono">{t.submissions}</td>
                      <td className="font-mono">{t.distinctUsers}</td>
                      <td className="font-mono">{t.acRate != null ? `${Math.round(t.acRate * 100)}%` : "—"}</td>
                      <td className="font-mono">{t.avgAttemptsPerUser?.toFixed(1) ?? "—"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
