export type Verdict =
  | "PENDING"
  | "JUDGING"
  | "AC"
  | "WA"
  | "TLE"
  | "MLE"
  | "RE"
  | "RF"
  | "CE"
  | "PE"
  | "OLE"
  | "SE";

export const VERDICT_LABEL: Record<Verdict, string> = {
  PENDING: "Pending",
  JUDGING: "Judging",
  AC: "Accepted",
  WA: "Wrong Answer",
  TLE: "Time Limit Exceeded",
  MLE: "Memory Limit Exceeded",
  RE: "Runtime Error",
  RF: "Restricted Function",
  CE: "Compile Error",
  PE: "Presentation Error",
  OLE: "Output Limit Exceeded",
  SE: "System Error",
};

export const LANGUAGE_LABEL: Record<string, string> = {
  cpp17: "C++17",
  c11: "C11",
  python3: "Python 3",
  java17: "Java 17",
};

export interface User {
  id: string;
  handle: string;
  email: string;
  role: "USER" | "ADMIN";
  isStudent: boolean;
}

export interface ProblemListItem {
  id: string;
  slug: string;
  title: string;
  difficulty: number;
  source: "UVA" | "CPE" | "CUSTOM";
  tags: string[];
  solvedByMe: boolean;
}

export interface ProblemListResponse {
  items: ProblemListItem[];
  total: number;
  page: number;
}

export interface Sample {
  ord: number;
  input: string;
  output: string;
}

export interface ProblemDetail {
  id: string;
  slug: string;
  title: string;
  statementMd: string;
  sourceUrl: string | null;
  inputSpecMd: string;
  outputSpecMd: string;
  timeLimitMs: number;
  memoryLimitKb: number;
  difficulty: number;
  source: "UVA" | "CPE" | "CUSTOM";
  tags: string[];
  samples: Sample[];
}

export interface ProblemStats {
  solvedCount: number;
  time: { minMs: number; medianMs: number; maxMs: number } | null;
  memoryAvailable: boolean;
  yourBest: { timeMs: number; beatsPct: number | null } | null;
}

export interface ProblemNote {
  content: string;
  updatedAt: string | null;
}

export interface SubmissionDetail {
  id: string;
  userId: string;
  problemId: string;
  contestId?: string | null;
  languageKey: string;
  status: Verdict;
  verdict: Verdict;
  timeMs?: number | null;
  memoryKb?: number | null;
  score: number;
  compileError?: string | null;
  createdAt: string;
  // Only present when the requester owns the submission (or is an admin) — see canSeeSource.
  sourceCode?: string | null;
}

export interface SubmissionListItem {
  id: string;
  problemId: string;
  problemSlug?: string;
  problemTitle?: string;
  problemTags?: string[];
  languageKey: string;
  verdict: Verdict;
  timeMs?: number | null;
  memoryKb?: number | null;
  createdAt: string;
}

export interface ContestListItem {
  id: string;
  title: string;
  slug: string;
  kind: "CPE" | "VIRTUAL" | "PUBLIC";
  startAt: string | null;
  durationMin: number;
  isPublic: boolean;
}

export interface ContestProblemRef {
  label: string;
  ord: number;
  problem: ProblemDetail;
}

export interface ContestParticipant {
  startedAt: string;
  endsAt: string;
  status: "REGISTERED" | "RUNNING" | "FINISHED";
}

export interface ContestDetail extends ContestListItem {
  problems: ContestProblemRef[];
  myParticipant: ContestParticipant | null;
  freezeMin: number;
  penaltyMin: number;
}

export interface MyContest {
  id: string;
  title: string;
  slug: string;
  kind: "CPE" | "VIRTUAL" | "PUBLIC";
  durationMin: number;
  totalProblems: number;
  startedAt: string;
  endsAt: string;
  status: "RUNNING" | "FINISHED";
  solvedCount: number;
  penalty: number;
}

export interface ScoreboardRow {
  userId: string;
  handle: string;
  solvedCount: number;
  penalty: number;
  rank: number;
  problems: Record<string, { solved: boolean; attempts: number; solveMin: number | null }>;
}

export interface Scoreboard {
  standings: ScoreboardRow[];
  frozen: boolean;
}

export interface UserProfile {
  handle: string;
  createdAt: string;
  solvedCount: number;
}

export interface Discussion {
  id: string;
  body: string;
  createdAt: string;
  userHandle: string;
  userRole: "USER" | "ADMIN";
}

export interface AdminUser {
  id: string;
  handle: string;
  email: string;
  role: "USER" | "ADMIN";
  isStudent: boolean;
  createdAt: string;
}

export interface AssignmentProblemRef {
  id: string;
  slug: string;
  title: string;
  difficulty: number;
  completed: boolean;
}

export interface MyAssignment {
  id: string;
  title: string;
  description: string;
  dueAt: string | null;
  createdAt: string;
  problems: AssignmentProblemRef[];
  completedCount: number;
  totalCount: number;
}

export interface AdminAssignment {
  id: string;
  title: string;
  description: string;
  dueAt: string | null;
  createdAt: string;
  problemCount: number;
  assigneeCount: number;
  problems: { slug: string; title: string }[];
  assignees: string[];
}

export type HomeworkStatus = Verdict | "NOT_STARTED";

export interface ClassHomeworkItem {
  id: string;
  slug: string;
  title: string;
  uvaId: number | null;
  status: HomeworkStatus;
}

export interface ClassSessionItem {
  id: string;
  number: number;
  title: string;
  contentMd: string;
  createdAt: string;
  homework: ClassHomeworkItem[];
}

export interface ClassOverviewRow {
  studentId: string;
  handle: string;
  currentClass: number;
  totalHomework: number;
  ac: number;
  wrong: number;
  pending: number;
  notStarted: number;
}

export interface CollectionListItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  problemCount: number;
}

export interface CollectionProblemItem {
  id: string;
  slug: string;
  title: string;
  difficulty: number;
  source: "UVA" | "CPE" | "CUSTOM";
  solvedByMe: boolean;
}

export interface CollectionDetail {
  id: string;
  slug: string;
  title: string;
  description: string;
  problems: CollectionProblemItem[];
}

export interface AvgCorrectPoint {
  date: string;
  title: string;
  avgCorrectCount: number | null;
}

export interface AnswerRateByLabelRow {
  label: string;
  sittings: number;
  submissions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  correctRate: number | null;
}

export interface TopicByLabelRow {
  label: string;
  topics: Record<string, number>;
}

export interface RepeatProblem {
  uvaId: number | null;
  title: string;
  topic: string | null;
  occurrences: { date: string; label: string }[];
}

export interface TopicPerformance {
  topic: string;
  submissions: number;
  acRate: number | null;
  distinctUsers: number;
  avgAttemptsPerUser: number | null;
}

export interface UserStats {
  heatmap: { date: string; count: number }[];
  languageBreakdown: { languageKey: string; count: number }[];
  verdictBreakdown: { verdict: Verdict; count: number }[];
  solvedByDifficulty: { difficulty: number; count: number }[];
}

export interface LeaderboardRow {
  userId: string;
  handle: string;
  score: number;
  solved: number;
  streak: number;
  rank: number;
}
