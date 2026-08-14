export const JUDGE_QUEUE_NAME = "judge-submissions";

export interface JudgeJobData {
  submissionId: string;
}

export function submissionResultChannel(submissionId: string): string {
  return `submission:${submissionId}:status`;
}

// The "Run" feature (test your code against sample/custom input without submitting) — a distinct
// queue from JUDGE_QUEUE_NAME because it never touches the Submission table or hidden TestCase
// data, just compiles+runs the given source against whatever input cases were sent along.
export const TEST_RUN_QUEUE_NAME = "judge-test-runs";

export interface TestRunJobData {
  runId: string;
  problemId: string;
  languageKey: string;
  sourceCode: string;
  cases: { id: string; input: string }[];
}

export function testRunResultChannel(runId: string): string {
  return `testrun:${runId}:status`;
}

export function contestScoreboardChannel(contestId: string): string {
  return `contest:${contestId}:scoreboard`;
}
