export const JUDGE_QUEUE_NAME = "judge-submissions";

export interface JudgeJobData {
  submissionId: string;
}

export function submissionResultChannel(submissionId: string): string {
  return `submission:${submissionId}:status`;
}

export function contestScoreboardChannel(contestId: string): string {
  return `contest:${contestId}:scoreboard`;
}
