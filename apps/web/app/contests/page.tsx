import { serverFetch } from "@/lib/serverApi";
import type { ContestListItem } from "@/lib/types";
import ContestsClient from "@/components/ContestsClient";

export default async function ContestsPage({ searchParams }: { searchParams: Promise<{ tab?: string | string[] }> }) {
  const [contests, params] = await Promise.all([serverFetch<ContestListItem[]>("/contests"), searchParams]);
  const initialTab = typeof params.tab === "string" && params.tab.toUpperCase() === "GPE" ? "GPE" : "CPE";
  return <ContestsClient initialContests={contests} initialTab={initialTab} />;
}
