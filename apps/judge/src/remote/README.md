# UVa remote judge

Every submission on this platform is judged by proxying to the real UVa Online Judge — there is no
local sandbox anymore. This adapter judges by submitting through onlinejudge.org's own web form
(there is no submission API) and reading the verdict back by polling **the site's own "My
Submissions" status page** (`Itemid=9`) — not uHunt (see below for why that changed).

**Status: verified against a real account**, including a full production run (real student
account → real submission → real UVa judge → verdict flowing back to the admin dashboard).

## Why not uHunt

The original version of this adapter polled [uHunt](https://uhunt.onlinejudge.org/api)
(`subs-user-last`) for verdicts, since it looked like a stable, documented, read-only API — no
need to stay logged in, no HTML scraping for the poll loop. **In production this turned out to be
unusable**: for the actual bot account in use, uHunt's mirror of that account's submissions never
updated at all during testing — polled every 10s for 8 straight minutes, got the exact same stale
list back every time (newest entry over 3 days old), while the real submission was independently
confirmed **Accepted by onlinejudge.org itself within seconds** (checked directly against the
site's own status page, bypassing uHunt entirely). uHunt's own docs already hint at this kind of
sync lag; what wasn't expected is that it can apparently just never sync for some accounts, not
merely lag by a few minutes.

The fix: poll `onlinejudge.org`'s own status page directly instead. It has no stable
problem-number column to match on (its `problem=` link parameter is an internal localid, not the
public UVa number, and is sometimes blank), so matching works by **submission id**: record the
highest existing id before submitting, then poll for the smallest new id that appears afterward —
that's unambiguously ours as long as this bot account only has one submission in flight at a time
(guaranteed by `MIN_GAP_MS` throttling in `uva.ts`).

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
  registrations. `findUhuntUid()` (still used by `diagnostic.ts` only, no longer by the production
  polling path — see "Why not uHunt" above) scrapes the numeric uid straight from the logged-in
  homepage's own "My uHunt" nav link instead, which resolved correctly on the first try.
- **UVa 10055 (Hashmat the Brave Warrior) has weak test data** — a solution that unconditionally
  prints `0` for every case was judged Accepted, twice, independently. Not a bug in this adapter
  (confirmed directly against the site, bypassing our own code entirely); just a bad choice of
  problem if you ever need a quick "does WA detection actually work" smoke test — pick literally
  any other problem.

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
