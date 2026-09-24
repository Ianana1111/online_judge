import type { Metadata } from "next";
import CollectionsListClient from "@/components/CollectionsListClient";
import { serverFetch } from "@/lib/serverApi";
import { SITE_URL } from "@/lib/site";
import type { CollectionListItem } from "@/lib/types";

export const metadata: Metadata = {
  title: "題目集｜考試專區與主題專區",
  description: "從 CPE 考前必刷、歷屆考題到演算法主題，找到適合你的練習路徑。",
  alternates: { canonical: `${SITE_URL}/collections` },
};

export default async function CollectionsPage() {
  const initialCollections = await serverFetch<CollectionListItem[]>("/collections");
  return <CollectionsListClient initialCollections={initialCollections} />;
}
