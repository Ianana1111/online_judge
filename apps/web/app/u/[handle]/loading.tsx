import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="oj-card flex items-center gap-6 p-6">
        <Skeleton className="h-32 w-32 shrink-0 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
      <div className="oj-card p-4">
        <Skeleton className="h-36 w-full" />
      </div>
    </div>
  );
}
