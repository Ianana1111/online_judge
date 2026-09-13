import { judgeResultSchema, testRunResultSchema, type JudgeResultDto, type TestRunResultDto } from "@oj/shared";
import { prisma } from "@oj/db";

const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? "http://localhost:4000";
const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN ?? "";

export async function reportResult(payload: JudgeResultDto): Promise<void> {
  const body = judgeResultSchema.parse(payload);
  const terminal = !["PENDING", "JUDGING"].includes(body.status);
  if (terminal) {
    // Keep the computed verdict durable even if the HTTP callback/API is unavailable.
    const saved = await prisma.submission.updateMany({
      where: { id: body.submissionId, evaluationVersion: body.evaluationVersion ?? 1, verdict: { in: ["PENDING", "JUDGING"] } },
      data: { pendingJudgeResult: body },
    });
    if (!saved.count) return;
  }
  try {
  const res = await fetch(`${API_INTERNAL_URL}/internal/submissions/${body.submissionId}/result`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-token": INTERNAL_SERVICE_TOKEN,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to report submission result (${res.status}): ${text}`);
  }
  } catch (error) {
    if (!terminal) throw error;
    console.warn(`Saved verdict for ${body.submissionId}; callback will be recovered by the API dispatcher`);
  }
}

export async function reportTestRunResult(payload: TestRunResultDto): Promise<void> {
  const body = testRunResultSchema.parse(payload);
  const res = await fetch(`${API_INTERNAL_URL}/internal/runs/${body.runId}/result`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-token": INTERNAL_SERVICE_TOKEN,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to report test-run result (${res.status}): ${text}`);
  }
}
