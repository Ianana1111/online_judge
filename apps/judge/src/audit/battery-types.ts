/** Shared shapes for the judge-rigor verification audit (see the audit plan). A "battery" is the
 * set of candidate solutions authored for one problem — one `correct` reference plus a handful of
 * deliberately-flawed variants, each targeting a specific way the problem's own (typically 1-5
 * row) local TestCase suite might be too thin to catch. Persisted at
 * packages/db/audit/battery-manifests/<slug>.json so authoring work is never redone across
 * sessions, and so run-local-battery.ts / run-remote-check.ts can both read+mutate the same file.
 */

export type CandidateTag =
  | "correct"
  | "overflow"
  | "off-by-one"
  | "whitespace-format"
  | "slow-correct"
  | "eof-multi-case"
  | "custom";

export interface Candidate {
  tag: CandidateTag;
  /** What's deliberately wrong (or, for "correct", a one-line note on the approach) — this is the
   * human-readable record of *why* a candidate exists, since the source code alone often doesn't
   * make the intended flaw obvious months later. */
  label: string;
  languageKey: string;
  sourceCode: string;
  /** Filled in by run-local-battery.ts. Absent until Tier 1 has actually run this candidate. */
  localVerdict?: string;
  localCheckedAt?: string;
  /** Filled in by run-remote-check.ts. Only ever set for candidates Tier 2 actually needed to
   * check (see selectForRemote in run-remote-check.ts) — most flawed candidates that already
   * fail locally never need a remote submission at all. */
  remoteVerdict?: string;
  remoteCheckedAt?: string;
}

export interface BatteryManifest {
  slug: string;
  uvaId: number | null;
  candidates: Candidate[];
  authoredAt: string;
}
