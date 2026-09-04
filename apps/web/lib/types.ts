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

// Verdicts always display as their competitive-programming abbreviation (AC, WA, TLE, ...) rather
// than a spelled-out word or a translation — that's the universal convention in this community,
// in English or Chinese conversation alike, so this is deliberately locale-invariant.
export const VERDICT_LABEL: Record<Verdict, string> = {
  PENDING: "Pending",
  JUDGING: "Judging",
  AC: "AC",
  WA: "WA",
  TLE: "TLE",
  MLE: "MLE",
  RE: "RE",
  RF: "RF",
  CE: "CE",
  PE: "PE",
  OLE: "OLE",
  SE: "SE",
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
  uiLocale?: "zh-TW" | "en";
  // Set once the ProfileSetupModal is dismissed (skipped or saved) — same "never show again once
  // handled" pattern as onboardingDismissed, independent of whether school ended up filled in.
  profileSetupDismissed?: boolean;
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
  school: string | null;
  // The address a verification link was sent to (or already verified) for the current `school` —
  // null until the user has requested verification at least once. See schoolVerifiedAt for
  // whether that address was actually confirmed.
  schoolEmail: string | null;
  schoolVerifiedAt: string | null;
  // False for Google-only accounts — no currentPassword field to re-check before deleting, so the
  // delete flow requires a fresh Google re-auth round trip instead (see PendingDeletionGate).
  hasPassword: boolean;
  // Set once account deletion has been requested (Settings > Account) — non-null means the account
  // is logged out and unusable until either the grace period elapses or it's cancelled. See
  // PendingDeletionGate, which is what actually enforces this in the UI.
  deletionRequestedAt: string | null;
}

export interface BillingStatus {
  plan: "FREE" | "PRO";
  planExpiresAt: string | null;
  planCancelRequested: boolean;
  // Non-null while the user can still self-serve a full refund of their first credit-card charge
  // (see POST /billing/refund/request) — null once used, expired, or never applicable (no credit
  // subscription on file). Replaces the old free-trial mechanism.
  refundEligibleUntil: string | null;
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
  // Pro-only: how many past CPE/GPE sittings this problem has appeared in. null for non-Pro users.
  // Both are always sent together so ProblemFilterTable's CPE/GPE toggle is instant.
  cpeAppearances: number | null;
  gpeAppearances: number | null;
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
  // Percentiles for one specific run (passed as ?runTimeMs=&runMemoryKb= — see the submission
  // result tab in ProblemView), as opposed to yourBest which always means "your fastest ever for
  // this problem". null unless the request asked for a specific run.
  yourRun: {
    beatsTimePct: number | null;
    timeBucketIndex: number | null;
    beatsMemoryPct: number | null;
    memoryBucketIndex: number | null;
  } | null;
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

/** A just-judged submission's result, as shown in ProblemView's dynamic last tab (see
 * SubmissionPanel's onResult prop) — a deliberately smaller shape than SubmissionDetail: only what
 * that tab actually renders, with sourceCode/languageKey captured from what was submitted at click
 * time rather than trusted from a later SSE payload (which never echoes the source back). Only one
 * of these exists at a time and each new terminal verdict overwrites it — it's a snapshot of "the
 * most recent result," not a history. */
export interface SubmissionResultTab {
  verdict: Verdict;
  timeMs?: number | null;
  memoryKb?: number | null;
  compileError?: string | null;
  sourceCode: string;
  languageKey: string;
  createdAt: string;
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
  attemptNumber: number;
}

export interface ContestAttemptSummary {
  attemptNumber: number;
  startedAt: string;
  endsAt: string;
  status: "RUNNING" | "FINISHED";
  solvedCount: number;
  penalty: number;
  /** True when the participant closed this attempt via the "end exam" action before its timer
   * would have naturally run out. */
  endedEarly: boolean;
}

export interface ContestDetail extends ContestListItem {
  problems: ContestProblemRef[];
  myParticipant: ContestParticipant | null;
  /** True once this attempt (if any) has ended and another one can be started — always false for
   * a scheduled/group sitting (Contest.startAt set), since those are one-shot by design. */
  canStartNewAttempt: boolean;
  /** Problem ids this specific attempt (myParticipant) has an AC submission for — empty when not
   * registered. Scoped to the current attempt, not the user's best one (see Scoreboard), so a
   * fresh re-attempt starts with none marked solved even if an earlier attempt solved them. */
  solvedProblemIds: string[];
  /** Every attempt this caller has made at this contest, oldest first — lets the page show a full
   * "your attempts" history instead of only ever exposing the latest one. */
  myAttempts: ContestAttemptSummary[];
  freezeMin: number;
  penaltyMin: number;
}

/** Body of the 409 thrown by POST /contests/:id/register when the caller already has a different
 * contest's attempt live right now — see ContestsService.register's one-live-attempt-at-a-time
 * check. */
export interface ContestConflictBody {
  message: string;
  conflictingContest: { id: string; slug: string; title: string; endsAt: string };
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
  attemptNumber: number;
}

export interface ScoreboardRow {
  userId: string;
  handle: string;
  solvedCount: number;
  penalty: number;
  rank: number;
  /** Which attempt this user's best (and therefore only shown) result on the board came from — a
   * re-attempt only replaces this row when it actually scores better; earlier attempts never get
   * their own row (see ContestsService.computeScoreboard). */
  attemptNumber: number;
  problems: Record<string, { solved: boolean; attempts: number; solveMin: number | null }>;
  /** This user's currently-running attempt, if any, with its true right-now solvedCount/penalty —
   * present regardless of whether that attempt is the one shown as this row (attemptNumber above).
   * Lets the UI show real-time progress for someone re-attempting even while their best-scoring
   * attempt is an older, already-finished one. Null once no attempt of theirs is still running. */
  liveAttempt: { attemptNumber: number; solvedCount: number; penalty: number } | null;
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
  school: string | null;
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
  handle: string;
  avatarUrl: string | null;
  // Only ever a *verified* school claim — null both for "no school" and "claimed but not
  // verified yet" (see UNVERIFIED_SCHOOL_FILTER for filtering on that second group specifically).
  school: string | null;
  solved: number;
  streak: number;
  frozenToday: boolean;
  avgTimeMs: number | null;
  avgMemoryKb: number | null;
  totalSubmissions: number;
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
