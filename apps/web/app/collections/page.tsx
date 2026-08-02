import type { Metadata } from "next";
import CollectionsListClient from "@/components/CollectionsListClient";

export const metadata: Metadata = {
  title: "Collections",
  description: "Curated UVa/CPE problem sets to work through at your own pace.",
};

export default function CollectionsPage() {
  return <CollectionsListClient />;
}
