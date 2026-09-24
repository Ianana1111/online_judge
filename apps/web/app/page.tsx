import type { Metadata } from "next";
import { serverFetch } from "@/lib/serverApi";
import { SITE_URL } from "@/lib/site";
import type { ProblemListResponse } from "@/lib/types";
import HomeDashboard from "@/components/HomeDashboard";
import LoggedOutHome from "@/components/LoggedOutHome";

export const metadata: Metadata = {
  title: { absolute: "judge.｜CPE、GPE 程式練習與歷屆模擬考" },
  description: "練習 430 多道程式題目、挑戰 CPE／GPE 歷屆限時測驗，累積自己的解題紀錄與實力。",
  alternates: { canonical: SITE_URL },
};

export default async function HomePage() {
  const problems = await serverFetch<ProblemListResponse>("/problems?page=1");
  const total = problems?.total ?? null;

  return (
    <>
      <HomeDashboard />
      <LoggedOutHome total={total} />
    </>
  );
}
