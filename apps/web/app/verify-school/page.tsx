import type { Metadata } from "next";
import SchoolEmailConfirmation from "@/components/SchoolEmailConfirmation";
export const metadata: Metadata = { title: "驗證學校信箱", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default function Page() { return <SchoolEmailConfirmation />; }
