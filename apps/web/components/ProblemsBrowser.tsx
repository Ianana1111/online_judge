"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { ProblemListResponse } from "@/lib/types";
import ProblemFilterTable from "@/components/ProblemFilterTable";

export default function ProblemsBrowser() {
  // Client-side (authenticated) so the solved ✓ reflects the logged-in user. One request pulls the
  // whole set; ProblemFilterTable filters/sorts it client-side, identical to the collection pages.
  const { data, isLoading } = useQuery({
    queryKey: ["problems", "all"],
    queryFn: () => apiFetch<ProblemListResponse>("/problems?pageSize=1000"),
  });

  if (isLoading && !data) return <p className="text-sm text-ink-400">Loading…</p>;

  return <ProblemFilterTable problems={data?.items ?? []} />;
}
