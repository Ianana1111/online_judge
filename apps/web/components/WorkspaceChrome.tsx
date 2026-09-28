"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import UserMenu from "@/components/UserMenu";
import { useAuthStore } from "@/store/auth";
import { buildProblemListHref } from "@/lib/problemFilter";
import { useLocale, useT } from "@/lib/i18n/LocaleContext";

export function WorkspaceLogo() {
  return (
    <Link href="/" aria-label="judge.tw" title="judge.tw" className="workspace-logo flex h-11 w-8 shrink-0 items-center rounded-lg lg:h-8">
      <Image src="/icon.svg" alt="" width={32} height={32} unoptimized />
    </Link>
  );
}

export function WorkspaceBackLink() {
  const params = useSearchParams();
  const { locale } = useLocale();
  const label = locale === "zh-TW" ? "回到題目列表" : "Back to list";
  return <Link href={buildProblemListHref(params)} title={label} className="workspace-back-link inline-flex min-h-11 min-w-0 items-center gap-1.5 rounded-md px-1 text-xs font-medium text-ink-200 hover:bg-ink-800 hover:text-brand lg:min-h-8 sm:text-sm"><span aria-hidden>←</span><span className="truncate">{label}</span></Link>;
}

export function WorkspaceAccountControls() {
  const t = useT();
  const router = useRouter();
  const { locale } = useLocale();
  const { user, status, logout } = useAuthStore();
  return (
    <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2">
      <div className="flex items-center gap-1.5">
        <ThemeToggle compact />
        {status !== "ready" ? <span className="h-11 w-11 lg:h-8 lg:w-8" /> : user ? (
          <UserMenu compact handle={user.handle} avatarUrl={user.avatarUrl} isAdmin={user.role === "ADMIN"} plan={user.plan}
            onLogout={async () => { await logout(); router.push("/"); }} />
        ) : (
          <Link href="/login" aria-label={t("Log in")} title={t("Log in")} className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-300 hover:bg-ink-800 hover:text-brand lg:h-8 lg:w-8">
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
            </svg>
          </Link>
        )}
      </div>
      <Link href="/contests" className="workspace-exam-link inline-flex min-h-8 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-brand/35 bg-brand/[0.06] px-2.5 text-xs font-medium text-brand-light transition-colors hover:border-brand/60 hover:bg-brand/10">{locale === "zh-TW" ? "來去考試吧" : "Take an exam"}<span aria-hidden>→</span></Link>
    </div>
  );
}
