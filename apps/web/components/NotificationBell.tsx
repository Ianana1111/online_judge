"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { NotificationList } from "@/lib/types";

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiFetch<NotificationList>("/notifications"),
    refetchInterval: 30_000,
  });

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const unread = data?.unreadCount ?? 0;
  const items = data?.items ?? [];

  async function handleOpen() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      await apiFetch("/notifications/read", { method: "POST", body: {} });
      qc.setQueryData<NotificationList | undefined>(["notifications"], (prev) =>
        prev ? { ...prev, unreadCount: 0, items: prev.items.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })) } : prev,
      );
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Notifications"
        className="relative flex h-8 w-8 items-center justify-center rounded text-ink-300 hover:text-brand"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {unread > 0 && (
          <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-verdict-wa px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="oj-card absolute right-0 top-full mt-2 w-80 overflow-hidden p-1">
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 && <p className="p-4 text-center text-sm text-ink-400">No notifications yet.</p>}
            {items.map((n) => {
              const content = (
                <div className="rounded px-3 py-2 hover:bg-ink-800">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink-100">{n.title}</p>
                    <span className="shrink-0 font-mono text-[10px] text-ink-500">{timeAgo(n.createdAt)}</span>
                  </div>
                  {n.body && <p className="mt-0.5 text-xs text-ink-400">{n.body}</p>}
                </div>
              );
              return n.link ? (
                <Link key={n.id} href={n.link} onClick={() => setOpen(false)} className="block">
                  {content}
                </Link>
              ) : (
                <div key={n.id}>{content}</div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
