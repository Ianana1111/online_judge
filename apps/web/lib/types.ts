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

export interface UserSettings {
  defaultLanguage?: "cpp17" | "c11" | "python3" | "java17";
  dailyGoal?: number;
  onboardingDismissed?: boolean;
}

export interface User {
  id: string;
  handle: string;
  email: string;
  role: "USER" | "ADMIN";
  isStudent: boolean;
  plan: "FREE" | "PRO";
  settings: UserSettings;
  bio: string;
  avatarUrl: string | null;
}

export interface BillingStatus {
  plan: "FREE" | "PRO";
  planExpiresAt: string | null;
  planCancelRequested: boolean;
  // Present only while an ECPay recurring (定期定額) subscription is ACTIVE — planExpiresAt
  // doubles as "renews on" for this case, since it auto-extends every successful auto-charge.
  subscription: { period: "MONTHLY" | "YEARLY"; amountNtd: number } | null;
  submits: { used: number; limit: number | null };
  virtualContests: { used: number; limit: number | null };
  pendingPayment: {
    id: string;
    period: "MONTHLY" | "YEARLY";
    amountNtd: number;
    createdAt: string;
    method: string;
    ecpayMethod: "CREDIT" | "ATM" | null;
    bankCode: string | null;
    vAccount: string | null;
    expireDate: string | null;
  } | null;
}

export interface BillingPlans {
  pricing: Record<"MONTHLY" | "YEARLY", { amountNtd: number; days: number; label: string }>;
  // The real amount a purchase charges right now (reflects the launch promo while active) —
  // always display/expect to pay THIS, never pricing[period].amountNtd directly.
  effectivePricing: Record<"MONTHLY" | "YEARLY", number>;
  promo: { discountPct: number; period: "MONTHLY" | "YEARLY"; endsAt: string } | null;
}

// A single problem as shown in a filterable/sortable table. Shared by the Problems list and the
// per-collection page (see ProblemFilterTable) so both render an identical row + controls.
export interface ProblemRow {
  id: string;
  uvaId: number | null;
  slug: string;
  title: string;
  difficulty: number;
  source: "UVA" | "CPE" | "GPE" | "CUSTOM";
  tags: string[];
  solvedByMe: boolean;
  // Pro-only: how many past CPE sittings this problem has appeared in. null for non-Pro users.
  cpeAppearances: number | null;
}

export type ProblemListItem = ProblemRow;

export interface RecommendedProblem {
  id: string;
  uvaId: number | null;
  slug: string;
  title: string;
  difficulty: number;
}

export interface RecommendedCollectionProblem extends RecommendedProblem {
  collectionTitle: string;
  collectionSlug: string;
}

export interface RecommendedProblems {
  tier: number;
  consolidate: RecommendedProblem[];
  stretch: RecommendedProblem | null;
  collectionNext: RecommendedCollectionProblem | null;
}

export interface DailyStats {
  goal: number;
  solvedToday: number;
  currentStreak: number;
  atRisk: boolean;
  streakFreezeCount: number;
  frozenToday: boolean;
  loginStreak: number;
  loginMilestoneHit: boolean;
}

export interface DailyProblem {
  id: string;
  uvaId: number | null;
  slug: string;
  title: string;
  difficulty: number;
  source: "UVA" | "CPE" | "GPE" | "CUSTOM";
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
  source: "UVA" | "CPE" | "GPE" | "CUSTOM";
  uvaId: number | null;
  // Pro-only: how many past CPE sittings this problem has appeared in. null for non-Pro users
  // (never 0 — 0 means "Pro user, genuinely never appeared").
  cpeAppearances: number | null;
  tags: string[];
  samples: Sample[];
}

// The "Run" feature (test code against sample/custom input without submitting) — see
// TestPanel.tsx / apps/api/src/runs. Deliberately not a Verdict: there's no AC/WA here, just raw
// output the caller compares against an expected value itself (samples) or just reads (custom
// cases).
export type RunStatus = "RUNNING" | "DONE" | "COMPILE_ERROR" | "ERROR";

export interface RunCaseResult {
  id: string;
  stdout: string;
  stderr: string;
  timeMs: number;
  timedOut: boolean;
  exitCode: number;
}

export interface RunResult {
  runId: string;
  status: RunStatus;
  compileError?: string;
  cases?: RunCaseResult[];
}

export interface HistogramBucket {
  count: number;
  languageCounts: Record<string, number>;
}
export interface TimeHistogramBucket extends HistogramBucket {
  minMs: number;
  maxMs: number;
}
export interface MemoryHistogramBucket extends HistogramBucket {
  minKb: number;
  maxKb: number;
}

export interface ProblemStats {
  solvedCount: number;
  time: { minMs: number; medianMs: number; maxMs: number } | null;
  memoryAvailable: boolean;
  yourBest: { timeMs: number; beatsPct: number | null } | null;
  timeHistogram: TimeHistogramBucket[];
  memoryHistogram: MemoryHistogramBucket[] | null;
  yourTimeBucketIndex: number | null;
  yourMemoryBucketIndex: number | null;
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
  kind: "CPE" | "GPE" | "VIRTUAL" | "PUBLIC";
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
  kind: "CPE" | "GPE" | "VIRTUAL" | "PUBLIC";
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
  plan: "FREE" | "PRO";
  bio: string;
  avatarUrl: string | null;
}

export interface Discussion {
  id: string;
  body: string;
  createdAt: string;
  userHandle: string;
  userRole: "USER" | "ADMIN";
}

export interface PostListItem {
  id: string;
  title: string;
  excerpt: string;
  bodyLength: number;
  authorHandle: string;
  authorAvatarUrl: string | null;
  isOfficial: boolean;
  createdAt: string;
}

export interface PostDetail {
  id: string;
  title: string;
  bodyMd: string;
  authorHandle: string;
  authorAvatarUrl: string | null;
  isOfficial: boolean;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  handle: string;
  email: string;
  role: "USER" | "ADMIN";
  isStudent: boolean;
  // Effective plan (already accounts for a lapsed planExpiresAt and isStudent auto-Pro) — same
  // computation backing /billing/me, not the raw DB column.
  plan: "FREE" | "PRO";
  planExpiresAt: string | null;
  createdAt: string;
}

// A credit-card order where Pro was already granted on ECPay authorization but the capture
// (a manual step via ECPay's own merchant backend) hasn't been confirmed yet.
export interface AdminAuthorizedPayment {
  id: string;
  userId: string;
  handle: string;
  email: string;
  period: "MONTHLY" | "YEARLY";
  amountNtd: number;
  merchantTradeNo: string | null;
  reference: string;
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

export interface AssignmentLeaderboardRow {
  userId: string;
  handle: string;
  solvedCount: number;
  totalCount: number;
  rank: number;
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

export interface ClassComment {
  id: string;
  body: string;
  createdAt: string;
  authorHandle: string;
  isAdmin: boolean;
}

export interface ClassSessionDetail extends ClassSessionItem {
  studentId: string;
  studentHandle: string;
  teacherHandle: string;
  comments: ClassComment[];
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
  category: string;
  problemCount: number;
}

export type CollectionProblemItem = ProblemRow;

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

export interface TrafficSummary {
  totalViews: number;
  distinctPaths: number;
  days: number;
}

export interface DailyTrafficPoint {
  date: string;
  count: number;
}

export interface TopPageRow {
  path: string;
  count: number;
}

export interface TopReferrerRow {
  referrer: string;
  count: number;
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
  frozenToday: boolean;
  rank: number;
}

export interface Achievement {
  code: string;
  title: string;
  description: string;
  earnedAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationList {
  items: Notification[];
  unreadCount: number;
}
