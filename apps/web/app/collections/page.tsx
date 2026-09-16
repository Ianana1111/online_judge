import type { Metadata } from "next";
import CollectionsListClient from "@/components/CollectionsListClient";

export const metadata: Metadata = {
  title: "題目集｜考試專區與主題專區",
  description: "從 CPE 考前必刷、歷屆考題到演算法主題，找到適合你的練習路徑。",
};

export default function CollectionsPage() {
  return <CollectionsListClient />;
}
