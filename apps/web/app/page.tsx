import { serverFetch } from "@/lib/serverApi";
import type { ProblemListResponse } from "@/lib/types";
import HomeDashboard from "@/components/HomeDashboard";
import LoggedOutHome from "@/components/LoggedOutHome";

export default async function HomePage() {
  const problems = await serverFetch<ProblemListResponse>("/problems?page=1");
  const items = problems?.items?.slice(0, 6) ?? [];

  return (
    <>
      <HomeDashboard />
      <LoggedOutHome items={items} />
    </>
  );
}
