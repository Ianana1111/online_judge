# UVa remote judge

Every submission on this platform is judged by proxying to the real UVa Online Judge — there is no
local sandbox anymore. This adapter judges by submitting through onlinejudge.org's own web form
(there is no submission API) and reading the verdict back from
[uHunt](https://uhunt.onlinejudge.org/api), which is read-only but stable and documented.

**Status: verified against a real account.** Login, form submission (multipart, radio-button
language selection), and uHunt verdict polling have all been exercised end-to-end through this
project's own submission pipeline — see "Verified behavior" below. That doesn't make it immune to
the site changing its markup in the future; if submissions start returning unexplained SE, re-run
`diagnostic.ts` first.

## Verified behavior (and things that surprised the first draft)

- Login form embeds a **per-page anti-replay token as a hidden field whose *name itself* changes
  every load** (not just its value) — `uvaClient.ts` replays whatever hidden fields the current
  page actually has rather than a fixed list, which is required, not just defensive.
- Attribute values (form `action`, hidden field values, option text) come back **HTML-entity
  encoded** (`&amp;` etc.) — first version of the scraper missed this and silently POSTed to a
  malformed URL (200 response, looked fine, wasn't actually logged in). Everything is decoded now.
- There is **no separate internal "localid"** for a problem (older remote-judge writeups reference
  one) — the submit form just uses the public UVa problem number directly in a `problemid` hidden
  field.
- Language selection is **radio buttons, not a `<select>`** (`name="language"`, values 1–6 for
  ANSI C / Java / C++ / Pascal / C++11 / Python3 at last check). Hints are matched in **priority
  order** (checking every option for the most specific hint before falling back) — a naive
  first-match scan would pick UVa's plain "C++" option over "C++11" just because it sorts earlier
  in the DOM, silently downgrading the compiler standard.
- The form's `enctype` is `multipart/form-data`; `uvaClient.ts` detects this and uses Node's global
  `FormData` rather than a urlencoded body.
- **uHunt's own `api/uname2uid/{username}` lookup returned 0 (not-found) for a real, actively-
  submitting account** — its username index appears to lag behind (or never sync) new
  registrations. `findUhuntUid()` instead scrapes the numeric uid straight from the logged-in
  homepage's own "My uHunt" nav link, which comes from the site's live session rather than a
  separate mirror, and resolved correctly on the first try.

## Known limitations

- **Site reliability**: onlinejudge.org lost its University of Valladolid institutional backing and
  now runs on community/donation support — expect occasional downtime, not an SLA.
- **ToS status unverified.** No explicit terms forbidding scripted submission were found, but none
  explicitly allowing it either. Use a **dedicated bot account**, not a personal one, and keep
  `MIN_GAP_MS` in `uva.ts` conservative — a locked account is the likely failure mode, not a legal
  one.
- Still markup-scraping, not an API — a future site redesign can break this silently. If verdicts
  start coming back as unexplained SE, re-run `diagnostic.ts` against a known problem number first.

## Setup

1. Register a dedicated account at
   `https://onlinejudge.org/index.php?option=com_comprofiler&task=registers` (don't reuse a
   personal account — see above).
2. Set `UVA_BOT_USERNAME` / `UVA_BOT_PASSWORD` in the judge service's environment.
3. (Optional sanity check) Run the diagnostic script against a known problem number:
   ```
   UVA_BOT_USERNAME=... UVA_BOT_PASSWORD=... pnpm --filter @oj/judge exec tsx src/remote/diagnostic.ts 36
   ```
4. Every submission routes through `judgeViaUva()` automatically (see `worker.ts`) whenever
   credentials are set — leaving them unset keeps the existing "not configured" SE message, so
   it's always safe to leave blank until ready.
