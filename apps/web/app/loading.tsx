import { SkeletonGrid } from "@/components/Skeleton";

// Generic fallback for any route that doesn't have its own loading.tsx — a route-specific one
// (see problems/, problems/[slug]/, u/[handle]/, etc.) always takes precedence over this.
export default function Loading() {
  return (
    <div className="space-y-4 py-6">
      <SkeletonGrid cards={6} />
    </div>
  );
}
