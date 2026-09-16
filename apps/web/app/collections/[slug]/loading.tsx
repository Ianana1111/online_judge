import { Skeleton, SkeletonList } from "@/components/Skeleton";

// Keep collection navigation responsive while the detail bundle and metadata are loading.
export default function CollectionLoading() {
  return <div role="status" aria-label="載入題目集 / Loading collection" className="space-y-6">
    <Skeleton className="h-7 w-64" />
    <Skeleton className="h-24 w-full" />
    <SkeletonList rows={8} />
  </div>;
}
