import type { Metadata } from "next";
import ProblemsBrowser from "@/components/ProblemsBrowser";
import { SITE_URL } from "@/lib/site";
import { serverFetch } from "@/lib/serverApi";
import type { ProblemListResponse } from "@/lib/types";

export const metadata: Metadata = {
  title: "題庫｜CPE、GPE 程式題目練習",
  description: "瀏覽 430 多道 CPE、GPE 與 UVa 程式題目，依難度與標籤挑選下一題。",
  alternates: { canonical: `${SITE_URL}/problems` },
};

export default async function ProblemsPage() {
  const initialProblems = await serverFetch<ProblemListResponse>("/problems?pageSize=1000");
  return <ProblemsBrowser initialProblems={initialProblems} />;
}
