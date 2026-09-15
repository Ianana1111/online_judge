"use client";

import { useEffect, useReducer, useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./api";
import type { BillingPlans } from "./types";

const subscribeToHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

/** Keep expired offers out of cached pages, including when refreshing fails. Server time avoids
 * depending on the visitor's timezone or clock; checkout still verifies the acknowledged quote. */
export function useBillingPlans() {
  // The layout can populate this shared query while a streamed page is still hydrating.
  // Each consumer must initially match the server's loading UI, even with a warm client cache.
  const hydrated = useSyncExternalStore(subscribeToHydration, clientSnapshot, serverSnapshot);
  const [, updateClock] = useReducer((n: number) => n + 1, 0);
  const query = useQuery({
    queryKey: ["billing", "plans"],
    queryFn: async ({ signal }) => {
      const requestedAt = performance.now();
      const plans = await apiFetch<BillingPlans>("/billing/plans", { signal });
      if (!plans.pricingVersion || !Number.isFinite(Date.parse(plans.serverNow))) throw new Error("Pricing unavailable");
      // Count the request's transit time conservatively instead of extending an offer on a slow connection.
      return { ...plans, receivedAt: requestedAt };
    },
    retry: 1,
    staleTime: 15_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: "always",
  });
  const { data, refetch } = query;
  const remaining = data?.refreshAt
    ? Date.parse(data.refreshAt) - Date.parse(data.serverNow) - (performance.now() - data.receivedAt)
    : Infinity;
  useEffect(() => {
    if (!data?.refreshAt) return;
    const delay = Date.parse(data.refreshAt) - Date.parse(data.serverNow) - (performance.now() - data.receivedAt);
    // A stale API response must not cause an immediate retry loop. The regular poll can recover.
    if (delay <= 0) return;
    const timer = window.setTimeout(() => { updateClock(); void refetch(); }, Math.max(250, Math.min(delay, 2_147_000_000)));
    return () => window.clearTimeout(timer);
  }, [data, refetch]);
  return { ...query, isError: hydrated && (query.isError || (remaining <= 0 && !query.isFetching)), data: hydrated && !query.isError && remaining > 0 ? data : undefined };
}
