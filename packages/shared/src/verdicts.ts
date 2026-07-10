export const VERDICTS = [
  "PENDING",
  "JUDGING",
  "AC",
  "WA",
  "TLE",
  "MLE",
  "RE",
  "RF",
  "CE",
  "PE",
  "OLE",
  "SE",
] as const;

export type Verdict = (typeof VERDICTS)[number];

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

/** Verdicts that mean judging has finished (terminal states). */
export const TERMINAL_VERDICTS: ReadonlySet<Verdict> = new Set([
  "AC",
  "WA",
  "TLE",
  "MLE",
  "RE",
  "RF",
  "CE",
  "PE",
  "OLE",
  "SE",
]);

export function isTerminalVerdict(v: Verdict): boolean {
  return TERMINAL_VERDICTS.has(v);
}
