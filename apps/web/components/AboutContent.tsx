"use client";

import Eyebrow from "@/components/Eyebrow";
import { useT } from "@/lib/i18n/LocaleContext";

// Split out of app/about/page.tsx (a Server Component, so it can keep exporting `metadata`) so
// this content can be locale-aware — the site's i18n is client-only by design (see
// LocaleContext's own comment on why: reading locale from a cookie server-side would force every
// page off static/ISR rendering), so anything that needs to translate has to live in a client
// component. Next.js still server-renders a client component's first paint (with the SSR-default
// zh-TW locale), so this doesn't reintroduce the empty-SSR-HTML bug fixed earlier — it only means
// an English-preference visitor's very first paint is briefly Chinese before hydration switches
// it, which is a fair trade against every page needing a cookie read.
//
// t()'s convention (see useT in LocaleContext.tsx) is English-as-key: passing English text is
// what actually displays in English mode (a pure passthrough), and the dictionary maps that exact
// English string to its Chinese translation for zh-TW mode. So every t() call below takes the
// English translation as its argument, not the original Chinese.
export default function AboutContent() {
  const t = useT();
  return (
    <div className="mx-auto max-w-2xl space-y-14 py-8">
      <section>
        <Eyebrow text="About this site" />
        <h1 className="font-display text-3xl font-bold leading-tight text-ink-50">
          {t("A CPE practice platform built for Taiwanese CS students")}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-300">
          {t(
            "This site collects past CPE (大學程式能力檢定) exam problems, and every submission goes through the same rigorous automated judging you'd face in the real exam — not a guess at right or wrong, but a real Accepted or Wrong Answer. Practice by topic and difficulty, or start a timed virtual exam to get used to the real pacing.",
          )}
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink-300">
          {t(
            "There's no shortage of practice platforms out there — international sites like LeetCode and Codeforces are everywhere — but none of them are actually built for Taiwanese CS students: the problem formats, the exam system, the path through school all look nothing like the CPE we actually have to face. I was a student preparing for these exams myself, and I know exactly how frustrating it is to not find practice resources that fit Taiwan's system. So I built one — not just a tool for my own tutoring, but a place anyone preparing for CPE can use.",
          )}
        </p>

        <h2 className="mt-8 font-display text-xl font-bold text-ink-50">{t("Why \"judge\"?")}</h2>
        <p className="mt-3 text-base leading-relaxed text-ink-300">
          {t("Learning to code, we get used to waiting for someone else to grade us — a teacher marking an exam, a TA saying \"is this okay?\", an interviewer's verdict. But the word")}
          <span className="text-brand"> judge </span>
          {t(
            "means exactly that: a referee. Here, every Submit gets the most honest, unforgiving verdict there is — Accepted is Accepted, Wrong Answer is Wrong Answer, no gray area and no partial credit for effort.",
          )}
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink-300">
          {t(
            "Over time you'll notice something: the thing actually grading you was never this system — it's always been you. You start to see exactly where you're still shaky, which technique you haven't really mastered yet, how far you still are from exam day. What this site wants to hand you is that same honest ruler, so you can become your own",
          )}
          <span className="text-brand"> judge</span>
          {t(". If you want to get CPE-ready and build real algorithm fundamentals, this is the right place to grind problems.")}
        </p>
      </section>
    </div>
  );
}
