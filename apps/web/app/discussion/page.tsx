import type { Metadata } from "next";
import DiscussionListClient from "@/components/DiscussionListClient";
import { serverFetch } from "@/lib/serverApi";
import { SITE_URL } from "@/lib/site";
import type { CommunityPage } from "@/lib/community";
import type { PostListItem } from "@/lib/types";

export const metadata: Metadata = {
  title: "討論區｜解題交流與官方公告",
  description: "與其他學習者交流解題思路、提問與分享心得，閱讀 judge. 官方公告。",
  alternates: { canonical: `${SITE_URL}/discussion` },
};

export default async function DiscussionPage() {
  const initialPage = await serverFetch<CommunityPage<PostListItem>>("/posts");
  return <DiscussionListClient initialPage={initialPage} />;
}
