import { serverFetch } from "@/lib/serverApi";
import type { ProblemListResponse } from "@/lib/types";
import ProblemListClient from "@/components/ProblemListClient";

export default async function ProblemsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; difficulty?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  if (sp.tag) params.set("tag", sp.tag);
  if (sp.difficulty) params.set("difficulty", sp.difficulty);
  if (sp.q) params.set("q", sp.q);
  params.set("page", sp.page ?? "1");

  const initial = await serverFetch<ProblemListResponse>(`/problems?${params.toString()}`);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink-50">Problems</h1>
      <ProblemListClient initial={initial ?? { items: [], total: 0, page: 1 }} initialParams={sp} />
    </div>
  );
}
