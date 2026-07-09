import { judgeResultSchema, type JudgeResultDto } from "@oj/shared";

const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? "http://localhost:4000";
const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN ?? "";

export async function reportResult(payload: JudgeResultDto): Promise<void> {
  const body = judgeResultSchema.parse(payload);
  const res = await fetch(`${API_INTERNAL_URL}/internal/submissions/${body.submissionId}/result`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-token": INTERNAL_SERVICE_TOKEN,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to report submission result (${res.status}): ${text}`);
  }
}
