import { serverFetch } from "@/lib/serverApi";
import type { DailyProblem, ProblemListResponse } from "@/lib/types";
import HomeDashboard from "@/components/HomeDashboard";
import LoggedOutHome from "@/components/LoggedOutHome";

export default async function HomePage() {
  // /problems/daily needs no auth and picks the same problem for every visitor all day (see
  // ProblemsService.dailyPick) — LoggedOutHome uses it as a concrete, try-it-now hook instead of
  // an arbitrary "recent problems" list. Fetched regardless of login state, same as `problems`
  // below; LoggedOutHome just renders null once a session is confirmed.
  const [problems, daily] = await Promise.all([
    serverFetch<ProblemListResponse>("/problems?page=1"),
    serverFetch<DailyProblem>("/problems/daily"),
  ]);
  const total = problems?.total ?? 430;

  return (
    <>
      <HomeDashboard />
      <LoggedOutHome total={total} daily={daily} />
    </>
  );
}
