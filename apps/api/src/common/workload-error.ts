import { HttpException } from "@nestjs/common";
import { WorkloadRejected } from "@oj/shared";

export function workloadHttpError(error: unknown): never {
  if (!(error instanceof WorkloadRejected)) throw error;
  const messages = {
    COOLDOWN: "Please wait 10 seconds between runs or submissions.",
    USER_LIMIT: "You already have three unfinished jobs. Wait for one to finish.",
    BUSY: "The judging queue is full. Please try again shortly.",
    QUOTA: "Free plan test-run limit reached (20/month). Upgrade to Pro for unlimited runs.",
    UNAVAILABLE: "Judging is temporarily unavailable. Please try again shortly.",
  };
  throw new HttpException({ message: messages[error.reason], code: error.reason, retryAfterSeconds: error.retryAfterSeconds },
    error.reason === "QUOTA" ? 403 : ["BUSY", "UNAVAILABLE"].includes(error.reason) ? 503 : 429);
}
