// Split into two queues (rather than one shared queue with a single concurrency knob) because the
// two judging paths have fundamentally different concurrency limits: local sandbox judging has no
// real limit (every submission gets its own disposable, isolated microVM), while UVa relay
// judging must stay serialized (single shared bot account — see remote/uva.ts). Sharing one queue
// meant a purely-local submission could sit queued behind an in-flight UVa relay job for no
// technical reason. Routing happens once, at enqueue time (see submissions.service.ts), based on
// whether the problem has local TestCase rows.
export const JUDGE_LOCAL_QUEUE_NAME = "judge-submissions-local";
export const JUDGE_REMOTE_QUEUE_NAME = "judge-submissions-remote";

export interface JudgeJobData {
  submissionId: string;
}

export function submissionResultChannel(submissionId: string): string {
  return `submission:${submissionId}:status`;
}

// The "Run" feature (test your code against sample/custom input without submitting) — a distinct
// queue from the two above because it never touches the Submission table or hidden TestCase data,
// just compiles+runs the given source against whatever input cases were sent along.
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
