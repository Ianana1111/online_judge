"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { DiscordIcon } from "@/components/DiscordLink";
import { DISCORD_INVITE_URL } from "@/lib/discord";
import { useAuthStore } from "@/store/auth";
import { useLocale } from "@/lib/i18n/LocaleContext";

function reduceMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function TypedHeadline({ zh }: { zh: boolean }) {
  const tagline = zh ? "讓 CPE 不再耽誤你" : "Don't let CPE hold you back.";
  const text = `judge.\n${tagline}`;
  const [typed, setTyped] = useState("");
  useEffect(() => {
    if (reduceMotion()) { setTyped(text); return; }
    const characters = Array.from(text);
    let index = 0, timer: ReturnType<typeof setTimeout>;
    const next = () => {
      index += 1;
      setTyped(characters.slice(0, index).join(""));
      if (index < characters.length) {
        const character = characters[index - 1];
        timer = setTimeout(next, character === "\n" ? 260 : character === "." ? 180 : 85);
      }
    };
    setTyped("");
    timer = setTimeout(next, 320);
    return () => clearTimeout(timer);
  }, [text]);
  const [brand, typedTagline = ""] = typed.split("\n");
  const typingTagline = typed.includes("\n");
  const caret = <span className="guest-typewriter-caret text-brand">|</span>;
  return <h1 className="font-semibold text-ink-50">
    <span className="sr-only">{text.replaceAll("\n", " ")}</span>
    <span aria-hidden className="block text-[clamp(5.5rem,18vw,10rem)] leading-none tracking-[-0.065em]">
      <span className="relative inline-block text-left">
        <span className="invisible">judge.</span>
        <span className="absolute inset-0"><span data-typed-brand>{brand.slice(0, 5)}<span className="text-brand">{brand.slice(5)}</span></span>{!typingTagline && caret}</span>
      </span>
    </span>
    <span aria-hidden className="mt-5 block text-[clamp(1.35rem,5.8vw,2.5rem)] leading-[1.4] tracking-tight text-brand sm:mt-6">
      <span className="relative inline-block text-left">
        <span className="invisible">{tagline}</span>
        <span className="absolute inset-0"><span data-typed-tagline>{typedTagline}</span>{typingTagline && typed !== text && caret}</span>
      </span>
    </span>
  </h1>;
}

function CountUp({ value, suffix = "", locale }: { value: number; suffix?: string; locale: string }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (reduceMotion()) { setShown(value); return; }
    let frame = 0, started = 0;
    const duration = value > 20 ? 1450 : 900;
    const tick = (now: number) => {
      if (!started) started = now;
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      setShown(Math.min(value, Math.floor(value * eased)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    setShown(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <><span aria-hidden>{shown.toLocaleString(locale)}{suffix}</span><span className="sr-only">{value.toLocaleString(locale)}{suffix}</span></>;
}

export default function LoggedOutHome({ total }: { total: number | null }) {
  const { locale } = useLocale(); const zh = locale === "zh-TW";
  const { user, status } = useAuthStore();
  const heroRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    let previousOffset = -1;
    let frame = 0;
    const updateOffset = () => {
      // The offer banner can appear after loading; keep the hero inside the first viewport.
      const offset = Math.ceil(hero.getBoundingClientRect().top + window.scrollY);
      if (offset === previousOffset) return;
      previousOffset = offset;
      hero.style.setProperty("--guest-hero-offset", `${offset}px`);
    };
    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateOffset);
    };
    updateOffset();
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(document.body);
    window.addEventListener("resize", scheduleUpdate);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener("resize", scheduleUpdate); };
  }, [status, user?.id]);
  const paths = [
    { label: zh ? "入門首選" : "START HERE", title: zh ? "CPE 必考 49 題" : "CPE Essential 49", body: zh ? "從經典基礎題開始，慢慢建立解題手感。" : "Build your confidence with a focused set of classic problems.", href: "/collections/cpe-basic-49", action: zh ? "開始練習" : "Start practicing" },
    { label: zh ? "自主練習" : "AT YOUR PACE", title: zh ? "探索題庫" : "Explore problems", body: zh ? "依難度與主題，找到適合你的下一題。" : "Find your next problem by difficulty or topic.", href: "/problems", action: zh ? "瀏覽題目" : "Browse problems" },
    { label: zh ? "考前模擬" : "EXAM PRACTICE", title: zh ? "歷屆虛擬測驗" : "Virtual exams", body: zh ? "挑一場 CPE／GPE，練習自己的考試節奏。" : "Prepare for CPE and GPE with timed past exams.", href: "/contests", action: zh ? "選一場測驗" : "Choose an exam" },
  ];
  if (status === "ready" && user) return null;
  return <div className="mx-auto max-w-5xl pb-6 sm:pb-12">
    <section ref={heroRef} className="guest-hero grid items-center py-10 sm:py-12">
      <div className="guest-hero-copy mx-auto w-full max-w-3xl text-left sm:text-center">
        <p className="mb-6 font-mono text-xs font-medium tracking-[0.14em] text-brand">{zh ? "CPE · GPE · 程式練習" : "CPE · GPE · CODING PRACTICE"}</p>
        <TypedHeadline zh={zh} />
        <p className="guest-hero-description mx-auto mt-6 max-w-md text-base leading-8 text-ink-300">{zh ? "從一題開始，練習解題，也準備下一場考試。" : "Start with one problem. Build your skills for the next exam."}</p>
        <div className="guest-hero-actions mt-10 flex flex-wrap items-center justify-center gap-5">
          <Link href="/register" className="oj-btn-primary min-h-12 rounded-xl px-6">{zh ? "開始免費練習" : "Start practicing free"}<span aria-hidden>↗</span></Link>
          <Link href="/problems" className="inline-flex min-h-12 items-center gap-2 rounded-lg px-2 text-sm font-medium text-ink-200 transition-colors hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">{zh ? "先逛逛題庫" : "Explore problems"}<span aria-hidden>→</span></Link>
        </div>
        <p className="mt-4 text-xs text-ink-400">{zh ? "免費開始，不需要信用卡。" : "Free to start. No credit card needed."}</p>
        <div className="mt-10 hidden items-center justify-center gap-5 text-xs text-ink-300 sm:flex">
          <span>{total === null ? (zh ? "歷屆精選題庫" : "Curated past problems") : <><span className="font-mono font-semibold tabular-nums text-ink-100"><CountUp value={total} locale={locale} /></span>{zh ? " 道練習題" : " practice problems"}</>}</span>
          <span aria-hidden className="h-3 w-px bg-ink-600" />
          <span>{zh ? "4 種程式語言" : "4 programming languages"}</span>
          <span aria-hidden className="h-3 w-px bg-ink-600" />
          <span>{zh ? "歷屆限時模擬考" : "Timed virtual exams"}</span>
        </div>
      </div>
    </section>
    <section aria-labelledby="practice-path-heading" className="pb-2">
      <h2 id="practice-path-heading" className="mb-5 text-xl font-semibold text-ink-100 sm:text-2xl">{zh ? "找到你的起點" : "Find your starting point"}</h2>
      <div className="grid gap-3 md:grid-cols-3 md:gap-4">
        {paths.map((path, index) => <Link key={path.href} href={path.href} className={`group flex flex-col rounded-2xl border p-5 transition-[border-color,background-color,transform] duration-200 hover:border-brand/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand motion-safe:hover:-translate-y-1 sm:p-6 ${index === 0 ? "border-brand/30 bg-brand/[0.04]" : "border-ink-700 bg-ink-900/40 hover:bg-ink-900"}`}>
          <span className={`text-[11px] font-medium tracking-wide ${index === 0 ? "text-brand" : "text-ink-400"}`}>{path.label}</span>
          <h3 className="mt-3 text-lg font-semibold text-ink-100">{path.title}</h3>
          <p className="mb-5 mt-2 text-sm leading-6 text-ink-300">{path.body}</p>
          <span className="mt-auto flex items-center justify-between text-xs font-medium text-ink-200">{path.action}<span aria-hidden className="text-brand transition-transform motion-safe:group-hover:translate-x-1">→</span></span>
        </Link>)}
      </div>
    </section>
    <section aria-labelledby="discord-community-heading" className="mt-8 flex flex-col gap-5 border-t border-ink-700 py-6 sm:mt-10 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-800 text-ink-200"><DiscordIcon className="h-5 w-5" /></span>
        <div><h2 id="discord-community-heading" className="text-sm font-semibold text-ink-100">{zh ? "一起練習，也一起交流。" : "Practice together. Grow together."}</h2><p className="mt-1 text-xs leading-6 text-ink-300">{zh ? "加入 Discord，聊解題、找夥伴。" : "Talk through problems and meet fellow learners on Discord."}</p></div>
      </div>
      <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" className="oj-btn-secondary min-h-11 shrink-0 rounded-xl px-4 text-xs">{zh ? "加入 Discord 社群" : "Join our Discord"}<span aria-hidden>↗</span></a>
    </section>
  </div>;
}
