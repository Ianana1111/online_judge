"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import BackButton from "@/components/BackButton";
import type { BillingStatus } from "@/lib/types";

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-ink-200">
      <svg width="16" height="16" viewBox="0 0 16 16" className="mt-0.5 shrink-0 text-verdict-ac" fill="none">
        <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </li>
  );
}

export default function UpgradePlanPage() {
  const router = useRouter();
  const { user, status: authStatus } = useAuthStore();

  const { data: status, isLoading } = useQuery({
    queryKey: ["billing", "me"],
    queryFn: () => apiFetch<BillingStatus>("/billing/me"),
    enabled: !!user,
  });

  const isAdmin = user?.role === "ADMIN";
  const isPro = status?.plan === "PRO";
  // Admins aren't capped at all, and students are auto-Pro (see billing.service.isProActive) —
  // neither of them has anything to upgrade, so don't offer a purchase flow that can't apply to
  // them (mirrors NavBar's showUpgrade condition, since this page is reachable by direct URL too).
  const notApplicable = isAdmin || user?.isStudent;

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-8">
      <div>
        <BackButton />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-12">
        <div className="w-full max-w-3xl space-y-10">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-ink-50">Upgrade your plan</h1>
            <p className="mt-2 text-sm text-ink-400">
              Score is difficulty-weighted and Pro removes every cap — pick the plan that fits how you practice.
            </p>
          </div>

          {authStatus === "ready" && !user && (
            <div className="oj-card p-5 text-center text-sm text-ink-300">
              Please{" "}
              <Link href="/login" className="text-brand hover:underline">
                log in
              </Link>{" "}
              to upgrade.
            </div>
          )}

          {user && notApplicable && (
            <div className="oj-card p-5 text-center text-sm text-ink-300">
              {isAdmin ? "Admin accounts already have no submit or contest limits." : "Student accounts are already Pro — no need to upgrade."}
            </div>
          )}

          {user && !notApplicable && isPro && (
            <div className="oj-card border-verdict-ac/40 p-5 text-center text-sm text-ink-200">
              You're already on Pro 🎉{" "}
              {status?.planExpiresAt && <>Renews/expires {new Date(status.planExpiresAt).toLocaleDateString()}.</>} Come back here
              to extend it any time.
            </div>
          )}

          {(!user || (user && !notApplicable && !isLoading && !isPro)) && (
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="oj-card flex flex-col p-6">
                <h2 className="font-display text-lg font-semibold text-ink-100">Free</h2>
                <p className="mt-2 text-3xl font-bold text-ink-50">
                  NT$0<span className="text-sm font-normal text-ink-400"> forever</span>
                </p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  <Check>20 submissions total</Check>
                  <Check>2 self-run virtual CPE contests</Check>
                  <Check>Full access to discussions &amp; leaderboard</Check>
                </ul>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="oj-btn-secondary mt-6 w-full"
                  disabled={!user}
                >
                  Stay on Free Plan
                </button>
              </div>

              <div className="oj-card flex flex-col border-brand/50 p-6">
                <h2 className="font-display text-lg font-semibold text-brand">Pro</h2>
                <p className="mt-2 text-3xl font-bold text-ink-50">
                  NT$200<span className="text-sm font-normal text-ink-400"> / month</span>
                </p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  <Check>Unlimited submissions</Check>
                  <Check>Unlimited self-run virtual CPE contests</Check>
                  <Check>Full access to discussions &amp; leaderboard</Check>
                  <Check>Priority support</Check>
                </ul>
                <button
                  type="button"
                  onClick={() => router.push("/upgrade/checkout")}
                  className="oj-btn-primary mt-6 w-full"
                  disabled={!user}
                >
                  Get Pro Plan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
