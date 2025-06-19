// components/summary/SummarySkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function SummarySkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      <Skeleton className="h-8 w-1/3" />

      <section className="space-y-4">
        <Skeleton className="h-6 w-1/4" />
        {[...Array(2)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <Skeleton className="h-6 w-1/4" />
        {[...Array(2)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <Skeleton className="h-6 w-1/4" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </section>

      <div className="text-right">
        <Skeleton className="h-10 w-40 ml-auto" />
      </div>
    </div>
  );
}
