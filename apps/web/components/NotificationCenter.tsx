"use client";

import { useState } from "react";
import Link from "next/link";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { useAuthStore } from "@/store/auth";
import type { NotificationList } from "@/lib/types";

export default function NotificationCenter({ compact = false, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  const { locale } = useLocale(); const zh = locale === "zh-TW";
  const user = useAuthStore((s) => s.user);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const qc = useQueryClient();
  const query = useInfiniteQuery({
    queryKey: ["notifications", user?.id, "history", unreadOnly], initialPageParam: "",
    queryFn: ({ pageParam }) => apiFetch<NotificationList>(`/notifications?unread=${unreadOnly}${pageParam ? `&cursor=${encodeURIComponent(pageParam)}` : ""}`),
    getNextPageParam: (last) => last.nextCursor ?? undefined, enabled: !!user, refetchInterval: 30_000,
  });
  const markRead = useMutation({
    mutationFn: (body: { ids: string[] } | { all: true; before: string }) => apiFetch("/notifications/read", { method: "POST", body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", user?.id] }),
  });
  const head = query.data?.pages[0], items = query.data?.pages.flatMap((p) => p.items) ?? [];
  if (!user) return <p className="p-6 text-sm text-ink-300">{zh ? "登入後即可查看你的通知。" : "Log in to view your notifications."}</p>;
  return <section aria-label={zh ? "通知清單" : "Notification list"}>
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-700 px-3 py-2">
      <div className="flex gap-1 rounded-lg bg-ink-800 p-0.5" aria-label={zh ? "通知篩選" : "Filter notifications"}>
        {[false, true].map((only) => <button type="button" key={String(only)} aria-pressed={unreadOnly === only} onClick={() => setUnreadOnly(only)} className={`min-h-7 rounded-md px-2 text-xs ${unreadOnly === only ? "bg-ink-900 font-semibold text-ink-100 shadow-sm" : "text-ink-400 hover:text-ink-100"}`}>{only ? (zh ? "未讀" : "Unread") : (zh ? "全部" : "All")}</button>)}
      </div>
      <button type="button" disabled={!head?.unreadCount || markRead.isPending} onClick={() => head && markRead.mutate({ all: true, before: head.asOf })} className="min-h-7 text-xs font-medium text-brand disabled:opacity-40">{zh ? "全部標為已讀" : "Mark all as read"}</button>
    </div>
    {markRead.isError && <p role="alert" className="px-3 pt-2 text-sm text-verdict-wa">{zh ? "未能更新已讀狀態，請再試一次。" : "Could not update read status. Please try again."}</p>}
    <div className={compact ? "max-h-[min(38vh,18rem)] overflow-y-auto overscroll-contain" : ""}>
      {query.isPending && <p role="status" className="p-6 text-center text-sm text-ink-400">{zh ? "正在載入通知…" : "Loading notifications…"}</p>}
      {query.isError && <div role="alert" className="p-5 text-center text-sm text-ink-300"><p>{zh ? "暫時無法取得通知。" : "Notifications are temporarily unavailable."}</p><button type="button" className="oj-btn-ghost mt-3" onClick={() => query.refetch()}>{zh ? "重新載入" : "Retry"}</button></div>}
      {!query.isPending && !query.isError && items.length === 0 && <div className="px-5 py-7 text-center"><span aria-hidden className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-brand/10 text-base text-brand">✓</span><p className="font-medium text-ink-100">{unreadOnly ? (zh ? "都看完了" : "You're all caught up") : (zh ? "新的進展，會在這裡告訴你" : "Your updates will appear here")}</p><p className="mt-1.5 text-sm text-ink-400">{zh ? "成就、課程與社群的更新，都集中在這裡。" : "Achievement, class and community updates in one place."}</p></div>}
      <ul className="divide-y divide-ink-700/60">
        {items.map((n) => {
          const safeLink = n.link?.startsWith("/") && !n.link.startsWith("//") && !n.link.includes("\\") ? n.link : null;
          return <li key={n.id} className={`relative px-3 py-2.5 ${!n.readAt ? "bg-brand/[0.04]" : ""}`}><div className="flex gap-2.5"><span aria-hidden className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${!n.readAt ? "bg-brand" : "bg-ink-600"}`} /><div className="min-w-0 flex-1">
            {safeLink ? <Link href={safeLink} onClick={() => { if (!n.readAt) markRead.mutate({ ids: [n.id] }); onNavigate?.(); }} className="text-sm font-semibold leading-snug text-ink-100 hover:text-brand">{n.title}</Link> : <p className="text-sm font-semibold leading-snug text-ink-100">{n.title}</p>}
            {n.body && <p className="mt-0.5 break-words text-xs leading-snug text-ink-400">{n.body}</p>}
            <div className="mt-1.5 flex items-center justify-between gap-2"><time dateTime={n.createdAt} className="text-xs text-ink-400">{new Date(n.createdAt).toLocaleString(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</time>{!n.readAt && <button type="button" disabled={markRead.isPending} onClick={() => markRead.mutate({ ids: [n.id] })} className="min-h-7 text-xs text-brand disabled:opacity-40" aria-label={`${zh ? "標為已讀" : "Mark as read"}: ${n.title}`}>{zh ? "標為已讀" : "Mark as read"}</button>}</div>
          </div></div></li>;
        })}
      </ul>
      {query.hasNextPage && <div className="p-4 text-center"><button type="button" className="oj-btn-ghost" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>{query.isFetchingNextPage ? (zh ? "載入中…" : "Loading…") : (zh ? "載入較早的通知" : "Load earlier notifications")}</button></div>}
    </div>
    {compact && <Link href="/notifications" onClick={onNavigate} className="block border-t border-ink-700 px-3 py-2.5 text-center text-sm font-medium text-brand">{zh ? "開啟通知中心 →" : "Open notification center →"}</Link>}
  </section>;
}
