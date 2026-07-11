/**
 * One-off scraper: imports GPE（交大 GPE 程式能力檢定）歷屆考題 from the community-run "GPE Helper"
 * project's public data (github.com/setsal/GPE-Helper). Populates:
 *   - a "GPE 歷屆題目" Collection containing every unique problem across all sittings
 *   - one Contest (kind=GPE) per exam sitting, with ContestProblem rows labeled A..K, so these
 *     work exactly like CPE sittings (openable as a self-run virtual exam)
 *
 * IMPORTANT LIMITATION: GPE's own judge (gpe3.acm-icpc.tw, a DOMjudge instance) is permanently
 * offline — there is no live judge left to submit code to for these problems. This script:
 *   1. Tries to match each problem to its real UVa equivalent by normalized title. GPE ran its own
 *      numbering on top of what were mostly well-known ACM regional-archive problems, many of
 *      which are also mirrored on UVa under a *different* number — a title match lets that problem
 *      be genuinely judged via our normal remote-UVa pipeline (uvaId set, real UVa PDF fetched),
 *      exactly like every other problem on the site.
 *   2. Problems with no confident title match still get imported — statement recovered from
 *      GPE Helper's preserved HTML snapshot (only 118 exist and all of them do, conveniently) —
 *      but with uvaId left null. The submit panel hides itself for uvaId-less problems (see
 *      ProblemView.tsx / SubmissionPanel.tsx), since there's nowhere to actually send the code.
 * Safe to re-run: upserts by a stable slug derived from the GPE pid.
 */
import { prisma } from "@oj/db";
import { PDFParse } from "pdf-parse";
import { cleanPdfStatementText, escapeInline, extractSampleFromPdfText } from "./formatStatement.js";
import { combinedDifficulty, fetchUhuntDacu, fetchUhuntTitleIndex, normalizeTitleForMatch } from "./uhuntDifficulty.js";

const EXAMS_URL = "https://raw.githubusercontent.com/setsal/GPE-Helper/master/frontend/public/exams.json";
const SNAPSHOT_BASE =
  "https://raw.githubusercontent.com/setsal/GPE-Helper/master/frontend/public/question_snapshots/contents";
const FETCH_TIMEOUT_MS = 20_000;

interface GpeProblemRef {
  pid: string;
  name: string;
  category?: string[];
  subs?: number;
  ACs?: number;
}
interface GpeExam {
  timestamp: number;
  examTime: string;
  examName: string;
  problems: GpeProblemRef[];
}

// A handful of GPE's own category labels map cleanly onto our controlled topic taxonomy (see
// TOPIC_FLOOR in uhuntDifficulty.ts) — mapping these lets a matched-to-UVa problem's difficulty
// floor correctly account for e.g. "this is tagged DP". Everything else (mostly Chinese-language
// ad-hoc descriptors like "找零問題"/"迴文") is imported as a plain freeform tag instead: still
// visible/filterable, just doesn't influence the difficulty floor.
const CATEGORY_MAP: Record<string, string[]> = {
  DP: ["dp"],
  "DP、Greedy": ["dp", "greedy"],
  Greedy: ["greedy"],
  LCS: ["dp"],
  Geometry: ["geometry"],
  Circle: ["geometry"],
  Math: ["math"],
  數學: ["math"],
  數論: ["math"],
  質數: ["math"],
  prime: ["math"],
  質因數分解: ["math"],
  最大公因數: ["math"],
  輾轉相除法: ["math"],
  費氏數列: ["math"],
  進制轉換: ["math"],
  字串: ["string"],
  字串處理: ["string"],
  搜尋: ["sorting-searching"],
  模擬: ["simulation"],
  遞迴: ["recursion-backtracking"],
  有限背包: ["dp"],
  背包: ["dp"],
  子集和問題: ["dp"],
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "problem";
}

// Postgres text columns reject NUL bytes outright; strip them rather than let the whole upsert
// fail. Explicit \x00 on purpose — a literal space here is a real, easy-to-miss bug.
function sanitizeForPostgres(s: string): string {
  return s.replace(/\x00/g, "");
}

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#13;/g, "")
    .replace(/&nbsp;|&#160;/g, " ")
    // Generic numeric character references (&#8804; = ≤, &#8805; = ≥, etc.) — GPE's snapshots
    // use these for any non-ASCII math symbol, so a fixed list would miss most of them.
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(parseInt(code, 10)))
    .replace(/&amp;/g, "&"); // must be last
}

// stripTags leaves entities un-decoded on purpose — callers must run decodeEntities themselves
// afterward, since some callers (extractSamplePres) need <br> normalized to \n *before* decoding
// so an entity-decoded "&amp;" etc. can't accidentally get eaten by the </br> replacement.
function stripTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<li>/gi, "- ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "");
}

/** Splits the GPE snapshot's body HTML into <h3>-delimited sections. Some problems (~a handful)
 * have no <h3> at all and dump everything under one implicit "Description" block. */
function splitSections(html: string): { header: string; html: string }[] {
  const re = /<h3[^>]*>([^<]*)<\/h3>/gi;
  const matches = [...html.matchAll(re)];
  if (matches.length === 0) return [{ header: "Description", html }];

  const sections: { header: string; html: string }[] = [];
  if (matches[0].index! > 0) {
    const lead = html.slice(0, matches[0].index).trim();
    if (lead) sections.push({ header: "Description", html: lead });
  }
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index! + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : html.length;
    sections.push({ header: matches[i][1].trim(), html: html.slice(start, end) });
  }
  return sections;
}

/** Sample Input/Output live as two sibling <td class="inputoutput"> cells (a <pre>, sometimes
 * doubly-nested <pre><pre>...) rather than sequential sections — pull them by cell position
 * instead of trying to regex-match balanced nested <pre> tags, which isn't reliably possible. */
function extractSamplePres(sampleHtml: string): { input: string; output: string } | null {
  const cells = [...sampleHtml.matchAll(/<td class="inputoutput"[^>]*>([\s\S]*?)<\/td>/gi)];
  if (cells.length < 2) return null;
  const clean = (raw: string) => {
    const text = decodeEntities(raw.replace(/<br\s*\/?>/gi, "\n").replace(/<\/?pre[^>]*>/gi, ""));
    return `${text.replace(/\r/g, "").replace(/^\n+/, "").replace(/\s+$/, "")}\n`;
  };
  return { input: clean(cells[0][1]), output: clean(cells[1][1]) };
}

function gpeHtmlToStatement(html: string): {
  statementMd: string;
  sample: { input: string; output: string } | null;
} {
  const sampleMatch = html.match(/<div id="sampleinputoutput">[\s\S]*?<\/div>/i);
  const beforeSample = sampleMatch ? html.slice(0, sampleMatch.index) : html;
  const sample = sampleMatch ? extractSamplePres(sampleMatch[0]) : null;

  // Drop the repeated "{pid}:{title}" <h2> heading (redundant with our own title) and the
  // "Time Limit: N sec" line right after it.
  const bodyHtml = beforeSample.replace(/<h2[\s\S]*?<\/h2>/i, "").replace(/Time Limit:[^<]*/i, "");

  const out: string[] = [];
  for (const { header, html: secHtml } of splitSections(bodyHtml)) {
    const text = escapeInline(decodeEntities(stripTags(secHtml)).trim()).replace(/\n{3,}/g, "\n\n");
    if (!text) continue;
    const lower = header.toLowerCase();
    if (lower === "description" || lower === "background") out.push(text);
    else out.push(`### ${header}`, text);
  }
  const statementMd = sanitizeForPostgres(out.join("\n\n").replace(/\n{3,}/g, "\n\n").trim());
  return { statementMd, sample };
}

async function fetchOfficialUvaStatement(
  uvaId: number,
): Promise<{ statementMd: string; sourceUrl: string; sample: { input: string; output: string } | null } | null> {
  const folder = Math.floor(uvaId / 100);
  const pdfUrl = `https://onlinejudge.org/external/${folder}/${uvaId}.pdf`;
  try {
    const res = await fetch(pdfUrl, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const parser = new PDFParse({ data: buf });
    const result = await parser.getText();
    const raw = result.text.trim();
    return {
      statementMd: sanitizeForPostgres(cleanPdfStatementText(raw, uvaId)),
      sourceUrl: pdfUrl,
      sample: extractSampleFromPdfText(raw),
    };
  } catch {
    return null;
  }
}

function mapCategoriesToTagDefs(categories: string[]): { slug: string; name: string }[] {
  const bySlug = new Map<string, string>();
  for (const cat of categories) {
    const mapped = CATEGORY_MAP[cat];
    if (mapped) {
      for (const slug of mapped) bySlug.set(slug, slug);
    } else {
      bySlug.set(cat, cat);
    }
  }
  return [...bySlug.entries()].map(([slug, name]) => ({ slug, name }));
}

async function main() {
  console.log("Fetching GPE exams.json...");
  const examsRes = await fetch(EXAMS_URL);
  if (!examsRes.ok) throw new Error(`Failed to fetch exams.json: HTTP ${examsRes.status}`);
  const exams = (await examsRes.json()) as Record<string, GpeExam>;
  console.log(`Found ${Object.keys(exams).length} exam sittings.`);

  console.log("Fetching uHunt title index + DACU for UVa matching...");
  const [titleIndex, dacuMap] = await Promise.all([fetchUhuntTitleIndex(), fetchUhuntDacu()]);

  const uniqueProblems = new Map<string, { pid: string; title: string; categories: Set<string> }>();
  for (const exam of Object.values(exams)) {
    for (const p of exam.problems) {
      const title = p.name.replace(/^[\w.-]+:\s*/, "").trim();
      const existing = uniqueProblems.get(p.pid);
      if (existing) {
        for (const c of p.category ?? []) existing.categories.add(c);
      } else {
        uniqueProblems.set(p.pid, { pid: p.pid, title, categories: new Set(p.category ?? []) });
      }
    }
  }
  console.log(`${uniqueProblems.size} unique GPE problems across all sittings.\n`);

  const problemIdByPid = new Map<string, string>();
  let matched = 0;
  let unmatched = 0;
  let failed = 0;
  let done = 0;

  for (const [pid, info] of uniqueProblems) {
    done++;
    const slug = `gpe-${pid.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${slugifyTitle(info.title)}`;
    process.stdout.write(`[${done}/${uniqueProblems.size}] GPE ${pid}: ${info.title}... `);

    const existing = await prisma.problem.findUnique({ where: { slug } });
    if (existing) {
      problemIdByPid.set(pid, existing.id);
      console.log("already imported");
      continue;
    }

    const normalized = normalizeTitleForMatch(info.title);
    const candidateUvaId = titleIndex.get(normalized);
    const tagDefs = mapCategoriesToTagDefs([...info.categories]);

    // A title match may point at a UVa id we already imported under a different slug (very
    // likely — plenty of GPE problems are also classic CPE/basic-49 problems, e.g. "Light, more
    // light" = UVa 10110). uvaId is unique, so re-creating would violate that constraint and
    // would also blow away a statement we've already cleaned up — just reuse the existing row
    // and fold in this sitting's own category tags.
    if (candidateUvaId) {
      const alreadyImported = await prisma.problem.findUnique({ where: { uvaId: candidateUvaId } });
      if (alreadyImported) {
        problemIdByPid.set(pid, alreadyImported.id);
        for (const { slug: tagSlug, name: tagName } of tagDefs) {
          const tag = await prisma.tag.upsert({
            where: { slug: tagSlug },
            update: {},
            create: { slug: tagSlug, name: tagName },
          });
          await prisma.problemTag.upsert({
            where: { problemId_tagId: { problemId: alreadyImported.id, tagId: tag.id } },
            update: {},
            create: { problemId: alreadyImported.id, tagId: tag.id },
          });
        }
        matched++;
        console.log(`ok (already in DB as ${alreadyImported.slug}, uva ${candidateUvaId})`);
        await sleep(50);
        continue;
      }
    }

    let statementMd: string | null = null;
    let sourceUrl: string | null = null;
    let uvaId: number | null = null;
    let sample: { input: string; output: string } | null = null;
    let difficulty = 1;

    if (candidateUvaId) {
      const official = await fetchOfficialUvaStatement(candidateUvaId);
      if (official) {
        statementMd = official.statementMd;
        sourceUrl = official.sourceUrl;
        uvaId = candidateUvaId;
        sample = official.sample;
        const dacu = dacuMap.get(candidateUvaId);
        difficulty = dacu !== undefined ? combinedDifficulty(dacu, tagDefs.map((t) => t.slug)) : 1;
      }
    }

    if (uvaId === null) {
      const snapRes = await fetch(`${SNAPSHOT_BASE}/${pid}.json`, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      }).catch(() => null);
      if (!snapRes || !snapRes.ok) {
        console.log("FAILED: no UVa match and no snapshot available, skipping");
        failed++;
        await sleep(150);
        continue;
      }
      const snap = (await snapRes.json()) as { content: string };
      const converted = gpeHtmlToStatement(snap.content);
      statementMd = converted.statementMd;
      sample = converted.sample;
    }

    const problem = await prisma.problem.create({
      data: {
        uvaId,
        slug,
        title: info.title,
        statementMd: statementMd!,
        sourceUrl,
        timeLimitMs: 2000,
        memoryLimitKb: 65536,
        difficulty,
        source: "GPE",
        checkerType: "IGNORE_TRAILING_WS",
      },
    });
    problemIdByPid.set(pid, problem.id);

    if (sample) {
      await prisma.sample.create({
        data: {
          problemId: problem.id,
          ord: 1,
          input: sanitizeForPostgres(sample.input),
          output: sanitizeForPostgres(sample.output),
        },
      });
    }

    for (const { slug: tagSlug, name: tagName } of tagDefs) {
      const tag = await prisma.tag.upsert({ where: { slug: tagSlug }, update: {}, create: { slug: tagSlug, name: tagName } });
      await prisma.problemTag.upsert({
        where: { problemId_tagId: { problemId: problem.id, tagId: tag.id } },
        update: {},
        create: { problemId: problem.id, tagId: tag.id },
      });
    }

    if (uvaId !== null) {
      matched++;
      console.log(`ok (matched UVa ${uvaId})`);
    } else {
      unmatched++;
      console.log("ok (no UVa match — reference only, not judgeable)");
    }
    await sleep(150);
  }

  console.log(`\nProblems done. matched to real UVa: ${matched}, snapshot-only: ${unmatched}, failed: ${failed}`);

  console.log("\nCreating GPE collection...");
  const collection = await prisma.collection.upsert({
    where: { slug: "gpe-history" },
    update: {},
    create: {
      slug: "gpe-history",
      title: "GPE 歷屆題目",
      description:
        "交大 GPE 程式能力檢定歷屆考題。原判題系統已停用，標示無法評測的題目僅供閱讀參考，其餘題目已比對回 UVa 可正常送出評測。",
    },
  });
  let collectionOrd = 0;
  for (const problemId of problemIdByPid.values()) {
    await prisma.collectionProblem.upsert({
      where: { collectionId_problemId: { collectionId: collection.id, problemId } },
      update: { ord: collectionOrd },
      create: { collectionId: collection.id, problemId, ord: collectionOrd },
    });
    collectionOrd++;
  }
  console.log(`Collection "${collection.title}" has ${collectionOrd} problems.`);

  console.log("\nCreating GPE contests (one per sitting)...");
  const LABELS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
  let contestsCreated = 0;
  for (const [cid, exam] of Object.entries(exams)) {
    const slug = `gpe-${exam.examTime}-${cid}`;
    const contest = await prisma.contest.upsert({
      where: { slug },
      update: {},
      create: {
        title: exam.examName,
        slug,
        kind: "GPE",
        durationMin: 180,
        freezeMin: 60,
        penaltyMin: 20,
        scoring: "ICPC",
        isPublic: true,
      },
    });
    let ord = 0;
    for (const p of exam.problems) {
      const problemId = problemIdByPid.get(p.pid);
      if (!problemId) continue;
      const label = LABELS[ord] ?? String(ord);
      const stats = { submissions: p.subs, correct: p.ACs };
      await prisma.contestProblem.upsert({
        where: { contestId_problemId: { contestId: contest.id, problemId } },
        update: { label, ord, ...stats },
        create: { contestId: contest.id, problemId, label, ord, ...stats },
      });
      ord++;
    }
    contestsCreated++;
  }
  console.log(`Created/updated ${contestsCreated} GPE contests.`);

  console.log(
    `\nDone. ${uniqueProblems.size} unique problems (${matched} judgeable via UVa, ${unmatched} reference-only, ${failed} failed), ${contestsCreated} contests.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
