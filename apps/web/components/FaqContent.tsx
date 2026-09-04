"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/LocaleContext";

// Split out of app/faq/page.tsx (a Server Component, which keeps the JSON-LD <script> and
// `metadata` export server-rendered — search engines need the structured data in the initial
// HTML, and Next.js only allows `metadata` exports from Server Components) so the visible Q&A
// content can be locale-aware. The JSON-LD's own text always stays the original zh-TW regardless
// of the visitor's locale — it represents the page's one canonical/indexed language, matching
// <html lang="zh-TW"> in the root layout, not a second full English structured-data variant.
//
// t()'s convention (see useT in LocaleContext.tsx) is English-as-key: passing English text is
// what actually displays in English mode (a pure passthrough), and the dictionary maps that exact
// English string to its Chinese translation for zh-TW mode.
export default function FaqContent() {
  const t = useT();

  const SECTIONS: { title: string; items: { q: string; a: React.ReactNode }[] }[] = [
    {
      title: t("Account & Pro plan"),
      items: [
        {
          q: t("I already paid, but my account still hasn't been upgraded to Pro — what do I do?"),
          a: (
            <>
              {t(
                "Payments are approved fully automatically: once your card is charged, the system detects it and upgrades your account within seconds to a few minutes — no manual review involved. If it's been more than 10 minutes and your account still shows Free, refresh the page first in case it's just a caching issue. If it still hasn't updated, email us at",
              )}
              <span className="text-brand"> judges0801@gmail.com </span>
              {t("with the time you paid and we'll grant you Pro directly.")}
            </>
          ),
        },
        {
          q: t("What do you get with Pro?"),
          a: t(
            "Unlimited code submissions, unlimited self-run virtual exams, seeing (and sorting by) how many times each problem has appeared in past exams, full access to discussions and the leaderboard, and priority support.",
          ),
        },
        {
          q: t("What are the limits on the Free plan?"),
          a: t(
            "10 code submissions and 1 virtual exam per calendar month — the quota resets automatically at the start of each month, no need to request it manually.",
          ),
        },
        {
          q: t("How do I cancel Pro?"),
          a: t(
            "Click \"Unsubscribe\" on the Upgrade Plan page — this stops future auto-renewal, but you keep full Pro access until your current paid period ends, then switch to Free automatically. No refund is issued for the time already paid for (unless you're within your first-month refund window — see the next question).",
          ),
        },
        {
          q: t("Can I get a refund?"),
          a: (
            <>
              {t(
                "You can request a full refund within 30 days of your first charge — it cancels your subscription and switches you to Free immediately, and you can only do this once per account. Find the option on the Upgrade Plan page while it's still available. See our",
              )}{" "}
              <Link href="/refund" className="text-brand hover:underline">
                {t("Refund Policy")}
              </Link>{" "}
              {t("for the full details.")}
            </>
          ),
        },
        {
          q: t("I forgot my password — what do I do?"),
          a: (
            <>
              {t(
                "There's no self-service password reset yet. If your account was created with Google, just use \"Continue with Google\" to skip the password entirely. If you registered with a handle and password and forgot it, email",
              )}
              <span className="text-brand"> judges0801@gmail.com </span>
              {t("with your account handle and we'll help you reset it.")}
            </>
          ),
        },
      ],
    },
    {
      title: t("Submissions & judging"),
      items: [
        {
          q: t("I got Wrong Answer or TLE, but I'm sure my logic is correct — what should I do?"),
          a: (
            <>
              {t(
                "Start by re-checking the exact output format described in the problem statement — a lot of WA cases come down to something small: a missing newline, an extra trailing space, or an edge case that's easy to miss. If you've double-checked and still think something's off, email us at",
              )}{" "}
              <span className="text-brand">judges0801@gmail.com</span> {t("with your submission and we'll take a look.")}
            </>
          ),
        },
        {
          q: t("What do the different verdicts mean?"),
          a: (
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>
                <b>{t("Accepted (AC)")}</b>{t(": completely correct.")}
              </li>
              <li>
                <b>{t("Wrong Answer (WA)")}</b>{t(": the output doesn't match the expected answer.")}
              </li>
              <li>
                <b>{t("Time Limit Exceeded (TLE)")}</b>{t(": your program ran too long and exceeded the problem's time limit.")}
              </li>
              <li>
                <b>{t("Memory Limit Exceeded (MLE)")}</b>{t(": your program used more memory than the problem allows.")}
              </li>
              <li>
                <b>{t("Runtime Error (RE)")}</b>
                {t(": your program crashed while running (commonly an out-of-bounds array access, division by zero, or a null pointer).")}
              </li>
              <li>
                <b>{t("Compile Error (CE)")}</b>{t(": your code failed to compile, usually a syntax error.")}
              </li>
              <li>
                <b>{t("Presentation Error (PE)")}</b>
                {t(": the content is actually correct, but formatting like spacing or newlines doesn't match what's expected.")}
              </li>
              <li>
                <b>{t("Output Limit Exceeded (OLE)")}</b>
                {t(": your program produced far more output than expected — usually means it's stuck in an infinite print loop.")}
              </li>
              <li>
                <b>{t("Restricted Function (RF)")}</b>
                {t(": your program used a disallowed system call or function (e.g. trying to access the filesystem or spawn a subprocess).")}
              </li>
              <li>
                <b>{t("System Error (SE)")}</b>
                {t(": something went wrong on our end, not with your program — if this keeps happening, please report it.")}
              </li>
            </ul>
          ),
        },
        {
          q: t("Why can't I submit repeatedly, back to back?"),
          a: t(
            "There's a 10-second cooldown after each submission, to prevent accidental double-submits or hammering the judge on the same problem. Once the cooldown ends you can submit again.",
          ),
        },
        {
          q: t("How long does judging take?"),
          a: t(
            "Normally anywhere from a few seconds to under a minute, and the page updates live without needing a refresh. If it's stuck on \"Judging\" for a long time, the judge is probably backed up — wait a moment or refresh the page.",
          ),
        },
        {
          q: t("Why can't I submit to some problems?"),
          a: t(
            "A small number of problems (mostly older GPE archive problems) aren't wired up to any real judging source and exist for reading/practice only — the submit button on these shows \"Not gradeable\" and is disabled, and the problem page notes this too.",
          ),
        },
        {
          q: t("What languages can I submit in?"),
          a: t(
            "C++17, C11, Python 3, and Java 17 are currently supported. The default code template deliberately uses standard <iostream>/<stdio.h> rather than non-standard headers like <bits/stdc++.h> — some judging sources' compilers don't support it, and using it would cause a Compile Error instead.",
          ),
        },
      ],
    },
    {
      title: t("Contests & virtual exams"),
      items: [
        {
          q: t("How do virtual exams work?"),
          a: (
            <>
              {t("Each one recreates a real past CPE or GPE sitting: pick one to start from the")}
              <Link href="/contests" className="text-brand hover:underline">
                {" "}
                Contests{" "}
              </Link>
              {t(
                "page and the countdown begins — the same problems and time limit as the real sitting that year, visible only to you and counted only in your own record. Start whenever you're ready; there's no need to run it alongside anyone else.",
              )}
            </>
          ),
        },
        {
          q: t("Can I leave partway through a virtual exam?"),
          a: t(
            "Yes — the countdown doesn't pause when you leave the page, but it doesn't disappear either. Coming back resumes the same countdown. If you want to stop for good, the \"End exam\" button finalizes your score right away instead of waiting for time to run out — useful if you want to go start a different exam.",
          ),
        },
        {
          q: t("Can I run more than one virtual exam at the same time?"),
          a: t(
            "No — only one exam can be in progress at a time, so you can give it your full attention. If you try to start a second one while another is still running, you'll be offered a one-click way to end the first and jump straight into the new one.",
          ),
        },
        {
          q: t("Can Free accounts only start one virtual exam per month?"),
          a: t("Yes — Free accounts get 1 per calendar month, resetting automatically at the start of each month; Pro has no limit."),
        },
        {
          q: t("Do virtual exam results affect the leaderboard?"),
          a: t(
            "Yes — each virtual exam has its own scoring (including time penalties), visible live on that contest's own page, and regular per-problem practice also accumulates into the overall leaderboard and your personal Activity page.",
          ),
        },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-50">FAQ</h1>
        <p className="mt-1 text-sm text-ink-400">
          {t("Frequently asked questions. Can't find your answer? Email us at")} <span className="text-brand">judges0801@gmail.com</span>.
        </p>
      </div>

      {SECTIONS.map((section) => (
        <div key={section.title}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-500">{section.title}</h2>
          <div className="space-y-2">
            {section.items.map((item) => (
              <details key={item.q} className="oj-card group p-4">
                <summary className="cursor-pointer list-none text-sm font-medium text-ink-100 marker:content-none group-open:text-brand">
                  <span className="mr-2 inline-block transition-transform group-open:rotate-90">›</span>
                  {item.q}
                </summary>
                <div className="mt-3 pl-4 text-sm leading-relaxed text-ink-300">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
