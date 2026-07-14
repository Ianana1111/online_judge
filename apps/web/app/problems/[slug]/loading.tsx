import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Skeleton className="h-[520px] w-full" />
    </div>
  );
}
