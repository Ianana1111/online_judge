/**
 * Low-level HTTP driver for onlinejudge.org (the classic UVa/ICPC archive judge).
 *
 * There is no official submission API — uHunt (see below) is read-only. Submitting is only
 * possible by driving the same Joomla-based web form a human uses, which means: no documented
 * request contract, and it can break silently if the site's markup changes. Fields are therefore
 * discovered by parsing whatever HTML comes back on each request rather than hardcoded, so small
 * markup drift doesn't break the whole flow — but this WILL need live verification against a real
 * account (see remote/diagnostic.ts) before it can be trusted in production.
 */

const BASE = "https://onlinejudge.org";
const USER_AGENT = "Mozilla/5.0 (compatible; oj-remote-judge/1.0)";

export type CookieJar = Record<string, string>;

function parseSetCookies(headers: Headers, jar: CookieJar): void {
  const getSetCookie = (headers as unknown as { getSetCookie?: () => string[] }).getSetCookie;
  const raw = getSetCookie ? getSetCookie.call(headers) : headers.get("set-cookie") ? [headers.get("set-cookie")!] : [];
  for (const line of raw) {
    const pair = line.split(";")[0];
    const idx = pair.indexOf("=");
    if (idx === -1) continue;
    jar[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
  }
}

function cookieHeader(jar: CookieJar): string {
  return Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

/** Fetches a URL, following redirects manually so Set-Cookie on 30x hops isn't lost. */
export async function fetchWithJar(
  url: string,
  jar: CookieJar,
  init: RequestInit = {},
): Promise<{ status: number; url: string; body: string }> {
  let currentUrl = url;
  let currentInit: RequestInit = init;

  for (let hop = 0; hop < 6; hop++) {
    const res = await fetch(currentUrl, {
      ...currentInit,
      redirect: "manual",
      headers: { ...currentInit.headers, Cookie: cookieHeader(jar), "User-Agent": USER_AGENT },
    });
    parseSetCookies(res.headers, jar);

    const location = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && location) {
      currentUrl = new URL(location, currentUrl).toString();
      currentInit = { method: "GET" };
      continue;
    }

    const body = await res.text();
    return { status: res.status, url: currentUrl, body };
  }
  throw new Error(`Too many redirects fetching ${url}`);
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'");
}

function extractHiddenFields(formHtml: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const re = /<input[^>]*type=["']hidden["'][^>]*>/gi;
  for (const inputTag of formHtml.match(re) ?? []) {
    const name = inputTag.match(/name=["']([^"']+)["']/i)?.[1];
    const value = decodeEntities(inputTag.match(/value=["']([^"']*)["']/i)?.[1] ?? "");
    if (name) fields[name] = value;
  }
  return fields;
}

export interface ParsedForm {
  action: string;
  enctype: string;
  hidden: Record<string, string>;
  /** Both <select> option groups and <input type=radio> groups, keyed by field name — UVa's
   * submit form uses radio buttons for language, not a dropdown. */
  choices: Record<string, { value: string; text: string }[]>;
  textareaNames: string[];
  fileInputNames: string[];
}

/** Finds a <form> whose action or id/name matches `hint`, and parses its inputs generically. */
export function parseForm(html: string, hint: RegExp): ParsedForm | null {
  const formRe = /<form\b([^>]*)>([\s\S]*?)<\/form>/gi;
  for (const m of html.matchAll(formRe)) {
    const [, attrs, body] = m;
    if (!hint.test(attrs) && !hint.test(body)) continue;

    const action = decodeEntities(attrs.match(/action=["']([^"']+)["']/i)?.[1] ?? "");
    const enctype = attrs.match(/enctype=["']([^"']+)["']/i)?.[1] ?? "application/x-www-form-urlencoded";
    const choices: ParsedForm["choices"] = {};

    const selectRe = /<select[^>]*name=["']([^"']+)["'][^>]*>([\s\S]*?)<\/select>/gi;
    for (const sm of body.matchAll(selectRe)) {
      const [, selName, selBody] = sm;
      const options: { value: string; text: string }[] = [];
      const optRe = /<option[^>]*value=["']([^"']*)["'][^>]*>([^<]*)</gi;
      for (const om of selBody.matchAll(optRe)) {
        options.push({ value: decodeEntities(om[1]), text: decodeEntities(om[2].trim()) });
      }
      choices[selName] = options;
    }

    // Radio groups: capture each <input type=radio name=X value=Y> plus the plain text that
    // immediately follows it up to the next tag, as that text is the human-readable label.
    const radioRe = /<input[^>]*type=["']radio["'][^>]*>([^<]*)/gi;
    for (const rm of body.matchAll(radioRe)) {
      const tag = rm[0];
      const name = tag.match(/name=["']([^"']+)["']/i)?.[1];
      const value = tag.match(/value=["']([^"']*)["']/i)?.[1];
      if (!name || value === undefined) continue;
      const label = decodeEntities(rm[1].replace(/&nbsp;/g, " ").trim());
      (choices[name] ??= []).push({ value: decodeEntities(value), text: label });
    }

    const textareaNames = [...body.matchAll(/<textarea[^>]*name=["']([^"']+)["']/gi)].map((tm) => tm[1]);
    const fileInputNames = [...body.matchAll(/<input[^>]*type=["']file["'][^>]*name=["']([^"']+)["']/gi)].map(
      (fm) => fm[1],
    );

    return { action, enctype, hidden: extractHiddenFields(body), choices, textareaNames, fileInputNames };
  }
  return null;
}

export interface UvaSession {
  jar: CookieJar;
}

/**
 * Logs in with a real UVa account. Replays every hidden field found on the login form verbatim
 * (rather than a fixed list) — this site embeds an anti-replay token as a per-page-generated
 * hidden field *name*, which only a fresh parse of the current page can produce.
 */
export async function uvaLogin(username: string, password: string): Promise<UvaSession> {
  const jar: CookieJar = {};
  const loginPage = await fetchWithJar(`${BASE}/index.php?option=com_user&view=login`, jar);
  const form = parseForm(loginPage.body, /mod_loginform|com_comprofiler&(amp;)?task=login/);
  if (!form) {
    throw new Error("Could not locate the UVa login form — site markup may have changed.");
  }

  const body = new URLSearchParams({
    ...form.hidden,
    username,
    passwd: password,
    remember: "no",
  });

  const res = await fetchWithJar(form.action || `${BASE}/index.php?option=com_comprofiler&task=login`, jar, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  // Community Builder redirects back to a normal page on both success and failure — the only
  // reliable signal is whether the resulting page still shows a login form.
  const stillLoggedOut = /mod_loginform/.test(res.body) && /<input[^>]*name=["']passwd["']/.test(res.body);
  if (stillLoggedOut) {
    throw new Error("UVa login failed — check UVA_BOT_USERNAME/UVA_BOT_PASSWORD.");
  }

  return { jar };
}

export interface SubmitResult {
  submittedAtUnix: number;
}

/**
 * Submits source code for a problem. `languageHints` are tried in priority order against the
 * language field's option/radio text (e.g. ["c++11", "c++"]) — checking all hints before falling
 * back to a less-specific one matters here: a naive first-match-wins scan would pick UVa's plain
 * "C++" option (old-standard GCC flags) over "C++11" merely because it happens to sort earlier in
 * the DOM, which would spuriously break any submission using post-98 syntax.
 */
export async function submitSolution(
  session: UvaSession,
  uvaProblemNumber: number,
  languageHints: string[],
  sourceCode: string,
): Promise<SubmitResult> {
  const page = await fetchWithJar(
    `${BASE}/index.php?option=com_onlinejudge&Itemid=8&page=submit_problem&problemid=${uvaProblemNumber}&category=0`,
    session.jar,
  );
  const form = parseForm(page.body, /save_submission|problemid/);
  if (!form) throw new Error(`Could not find the submission form for UVa problem ${uvaProblemNumber}.`);

  const langFieldName = Object.keys(form.choices).find((name) => /lang/i.test(name)) ?? "language";
  const options = form.choices[langFieldName] ?? [];

  let match: { value: string; text: string } | undefined;
  for (const hint of languageHints) {
    match = options.find((o) => o.text.toLowerCase().includes(hint));
    if (match) break;
  }
  if (!match) {
    throw new Error(
      `No matching language option on UVa's submit form for hints [${languageHints.join(", ")}] ` +
        `(available: ${options.map((o) => o.text).join(", ") || "none found"})`,
    );
  }

  const codeFieldName = form.textareaNames.find((n) => /code|source/i.test(n)) ?? form.textareaNames[0];
  if (!codeFieldName) {
    throw new Error("Could not find a source-code field on UVa's submission form.");
  }

  const submittedAtUnix = Math.floor(Date.now() / 1000);
  const actionUrl = form.action
    ? new URL(form.action, `${BASE}/`).toString()
    : `${BASE}/index.php?option=com_onlinejudge&Itemid=8&page=save_submission`;

  const fields: Record<string, string> = { ...form.hidden, [langFieldName]: match.value, [codeFieldName]: sourceCode };

  if (/multipart/i.test(form.enctype)) {
    const fd = new FormData();
    for (const [k, v] of Object.entries(fields)) fd.append(k, v);
    await fetchWithJar(actionUrl, session.jar, { method: "POST", body: fd });
  } else {
    await fetchWithJar(actionUrl, session.jar, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(fields).toString(),
    });
  }

  return { submittedAtUnix };
}

// --- uHunt: official-ish, documented, READ-ONLY stats API — used for verdict polling instead of
// scraping HTML, since it's stable and doesn't require staying logged in to poll. ---

const UHUNT_BASE = "https://uhunt.onlinejudge.org/api";

/** 10=Submission error, 15=Can't be judged, 20=In queue, 30=Compile error, 35=Restricted
 * function, 40=Runtime error, 45=Output limit, 50=Time limit, 60=Memory limit, 70=Wrong answer,
 * 80=Presentation error, 90=Accepted. Source: https://uhunt.onlinejudge.org/api */
export const UHUNT_VERDICT: Record<number, string> = {
  10: "SE",
  15: "SE",
  20: "PENDING",
  30: "CE",
  35: "RE",
  40: "RE",
  45: "OLE",
  50: "TLE",
  60: "MLE",
  70: "WA",
  80: "PE",
  90: "AC",
};

/**
 * uHunt's own `uname2uid` lookup (api/uname2uid/{username}) turned out to return 0 (not-found)
 * for at least one confirmed-real, actively-submitting account during testing — its username
 * index appears to lag behind (or never fully sync with) new registrations. The reliable source
 * is instead the numeric uid embedded in onlinejudge.org's own logged-in-user navigation (a "My
 * uHunt ..." link to uhunt.felix-halim.net/id/{uid} or uhunt.onlinejudge.org/id/{uid}), which
 * comes straight from the site's own session rather than a separate mirror.
 */
export async function findUhuntUid(session: UvaSession): Promise<number> {
  const home = await fetchWithJar(`${BASE}/`, session.jar);
  const match = home.body.match(/uhunt\.(?:felix-halim\.net|onlinejudge\.org)\/id\/(\d+)/i);
  if (!match) {
    throw new Error("Could not find a uHunt profile link on the logged-in homepage to resolve this account's uid.");
  }
  return parseInt(match[1], 10);
}

export interface UhuntSubmission {
  submissionId: number;
  problemId: number;
  verdictCode: number;
  runtimeCs: number; // centiseconds
  submittedAtUnix: number;
  languageId: number;
}

export async function uhuntRecentSubmissions(uid: number, count = 20): Promise<UhuntSubmission[]> {
  const res = await fetch(`${UHUNT_BASE}/subs-user-last/${uid}/${count}`);
  const data = (await res.json()) as { subs?: unknown[] };
  return (data.subs ?? []).map((row) => {
    const [submissionId, problemId, verdictCode, runtimeCs, submittedAtUnix, languageId] = row as number[];
    return { submissionId, problemId, verdictCode, runtimeCs, submittedAtUnix, languageId };
  });
}
