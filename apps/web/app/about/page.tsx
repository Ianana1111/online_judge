import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import AboutContent from "@/components/AboutContent";

export const metadata: Metadata = {
  title: "About",
  description: "為台灣資工人打造的 CPE 練習平台——歷屆考古題、自動化判題、限時模擬考。",
  alternates: { canonical: `${SITE_URL}/about` },
};

export default function AboutPage() {
  return <AboutContent />;
}
