import type { Metadata } from "next";
import DiscussionListClient from "@/components/DiscussionListClient";

export const metadata: Metadata = {
  title: "Discussion",
  description: "News, analysis, and announcements from the judge.tw team.",
};

export default function DiscussionPage() {
  return <DiscussionListClient />;
}
