"use client";

import "./learn-c.css";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { LearnCContent } from "@/lib/learn-c/app/index.js";
import { SHELL_HTML } from "./shell";

type Gate = "loading" | "login" | "student" | "notyet" | "error";

const GATES: Record<Gate, { title: string; body: React.ReactNode }> = {
  loading: { title: "載入中…", body: null },
  login: { title: "請先登入", body: <>這個學習地圖只開放給家教學生。請先<Link href="/login" className="text-brand underline">登入</Link>，登入後再回到這一頁。</> },
  student: { title: "這個帳號還沒有開通", body: "這個學習地圖只開放給學 C 語言的家教學生。如果你是學生，請把你的 judge.tw 帳號告訴老師，開通之後重新整理這一頁就可以看了。" },
  notyet: { title: "內容還沒發布", body: "老師還沒有把學習地圖的內容發布到網站上，請晚一點再來看。" },
  error: { title: "載入失敗", body: "暫時拿不到內容，請重新整理再試一次。" },
};

/** The C learning map. Its content (chapters, practice, class solutions) comes from the API, which
 * only serves students enrolled in C; the interactive parts (C interpreter in a Web Worker,
 * editor, step-by-step player, animations) live in lib/learn-c and run entirely in the browser. */
export default function LearnCPage() {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const authStatus = useAuthStore((s) => s.status);
  const [content, setContent] = useState<LearnCContent | null>(null);
  const [gate, setGate] = useState<Gate>("loading");
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authStatus !== "ready") return;
    let cancelled = false;
    setContent(null);
    setGate("loading");
    apiFetch<{ version: string; content: LearnCContent }>("/learn/c/content")
      .then((body) => { if (!cancelled) setContent(body.content); })
      .catch((err: unknown) => {
        if (cancelled) return;
        const status = err instanceof ApiError ? err.status : 0;
        setGate(status === 401 ? "login" : status === 403 ? "student" : status === 404 ? "notyet" : "error");
      });
    return () => { cancelled = true; };
  }, [authStatus, userId]);

  // Mount the vanilla learning-map code into the shell once the content is here.
  useEffect(() => {
    const el = root.current;
    if (!content || !el) return;
    let destroy: (() => void) | null = null, cancelled = false;
    // Keep the sticky sidebar and anchor targets just below the site's sticky navigation bar.
    const nav = document.querySelector(".site-navigation");
    const place = () => el.style.setProperty("--lm-top", `${(nav?.getBoundingClientRect().height ?? 56) + 8}px`);
    place();
    const ro = nav ? new ResizeObserver(place) : null;
    if (nav && ro) ro.observe(nav);
    import("@/lib/learn-c/app/index.js").then(({ mountLearnC }) => {
      if (!cancelled) destroy = mountLearnC(content);
    });
    return () => { cancelled = true; ro?.disconnect(); destroy?.(); };
  }, [content]);

  if (!content) {
    const g = GATES[gate];
    return (
      <div className="mx-auto max-w-2xl py-10">
        <h1 className="font-display text-3xl font-bold text-ink-50">C 語言學習地圖</h1>
        <div className="oj-card mt-6 p-6" role="status">
          <h2 className="font-display text-lg font-semibold text-ink-50">{g.title}</h2>
          {g.body && <p className="mt-2 text-sm leading-relaxed text-ink-300">{g.body}</p>}
        </div>
      </div>
    );
  }
  return <div ref={root} className="lm-root" dangerouslySetInnerHTML={{ __html: SHELL_HTML }} />;
}
