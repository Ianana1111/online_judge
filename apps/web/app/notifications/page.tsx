import type { Metadata } from "next";
import NotificationCenter from "@/components/NotificationCenter";
export const metadata: Metadata = { title: "通知中心", robots: { index: false, follow: false } };
export default function NotificationsPage() {
  return <div className="mx-auto max-w-3xl py-10 sm:py-16"><h1 className="mb-6 text-3xl font-semibold tracking-tight text-ink-100">通知中心 / Notifications</h1><div className="oj-card overflow-hidden rounded-2xl"><NotificationCenter /></div></div>;
}
