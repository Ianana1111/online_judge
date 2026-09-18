"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { NotificationList } from "@/lib/types";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { useAuthStore } from "@/store/auth";
import NotificationCenter from "./NotificationCenter";

export default function NotificationBell() {
  const { locale } = useLocale(); const zh = locale === "zh-TW";
  const user = useAuthStore((s) => s.user), [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null), trigger = useRef<HTMLButtonElement>(null), panel = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const authenticated = !!user && !user.mfaRequired && !user.mfaEnrollmentRequired && !user.deletionRequestedAt;
  const { data } = useQuery({ queryKey: ["notifications", user?.id, "badge"], queryFn: () => apiFetch<NotificationList>("/notifications"), enabled: authenticated, refetchInterval: 30_000 });
  const unread = data?.unreadCount ?? 0;
  useEffect(() => { setOpen(false); }, [user?.id]);
  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const outside = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener("pointerdown", outside); document.addEventListener("keydown", key);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", key); };
  }, [open]);
  if (!authenticated) return null;
  return <div ref={root} className="relative">
    <button ref={trigger} type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={panelId} aria-haspopup="dialog" aria-label={`${zh ? "通知" : "Notifications"}${unread ? ` (${unread} ${zh ? "則未讀" : "unread"})` : ""}`} className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-300 hover:bg-ink-800 hover:text-brand">
      <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M10 21h4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      {unread > 0 && <span className="absolute right-0 top-0 min-w-4 rounded-full bg-brand px-1 text-[10px] font-bold text-onbrand">{unread > 99 ? "99+" : unread}</span>}
    </button>
    {open && <div ref={panel} id={panelId} tabIndex={-1} role="dialog" aria-label={zh ? "通知中心" : "Notification center"} className="oj-card fixed inset-x-3 top-16 z-50 overflow-hidden rounded-2xl shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[21rem]">
      <div className="flex items-center justify-between px-4 pt-4"><h2 className="text-base font-semibold text-ink-100">{zh ? "通知中心" : "Notifications"}</h2><button type="button" onClick={() => { setOpen(false); trigger.current?.focus(); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-800" aria-label={zh ? "關閉通知" : "Close notifications"}>×</button></div>
      <NotificationCenter compact onNavigate={() => setOpen(false)} />
    </div>}
  </div>;
}
