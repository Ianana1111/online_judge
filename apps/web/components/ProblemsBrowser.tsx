"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { ProblemListResponse } from "@/lib/types";
import ProblemFilterTable from "@/components/ProblemFilterTable";
import { SkeletonList } from "@/components/Skeleton";
import { useAuthStore } from "@/store/auth";

export default function ProblemsBrowser() {
  // Client-side (authenticated) so the solved ✓ reflects the logged-in user. One request pulls the
  // whole set; ProblemFilterTable filters/sorts it client-side, identical to the collection pages.
  // The response's cpeAppearances field depends on the requester's Pro status (see
  // problems.service.list), so `plan` must be part of the query key — otherwise a user who just
  // upgraded keeps seeing the FREE-tier response (all cpeAppearances: null) cached from before
  // their purchase until something else happens to evict it.
  const plan = useAuthStore((s) => s.user?.plan);
  const { data, isLoading } = useQuery({
    queryKey: ["problems", "all", plan],
    queryFn: () => apiFetch<ProblemListResponse>("/problems?pageSize=1000"),
  });

  if (isLoading && !data) return <SkeletonList rows={10} />;

  return <ProblemFilterTable problems={data?.items ?? []} />;
}
