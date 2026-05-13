import { Skeleton } from "@/components/ui/skeleton";

export const ProductCardSkeleton = () => (
  <div className="glass-card p-4">
    <Skeleton className="w-full h-32 rounded-xl mb-3" />
    <Skeleton className="h-5 w-3/4 mb-1" />
    <Skeleton className="h-4 w-1/3 mb-3" />
    <div className="flex items-center gap-2 mb-3">
      <Skeleton className="h-4 w-4 rounded-full" />
      <Skeleton className="h-4 w-24" />
    </div>
    <div className="pt-3 border-t border-border">
      <Skeleton className="h-6 w-20" />
    </div>
  </div>
);

export const AffiliateCardSkeleton = () => (
  <div className="glass-card p-4">
    <Skeleton className="w-full h-44 rounded-xl mb-4" />
    <Skeleton className="h-5 w-3/4 mb-1" />
    <Skeleton className="h-4 w-1/3 mb-2" />
    <div className="flex items-center gap-2 mb-3">
      <Skeleton className="h-4 w-4 rounded-full" />
      <Skeleton className="h-4 w-24" />
    </div>
    <Skeleton className="h-20 w-full rounded-xl mb-4" />
    <div className="flex items-center justify-between pt-3 border-t border-border">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-10 w-24 rounded-xl" />
    </div>
  </div>
);

export const ScriptCardSkeleton = () => (
  <div className="rounded-lg border border-border/50 bg-card/50 overflow-hidden">
    <div className="p-4 flex items-center gap-3">
      <Skeleton className="w-14 h-14 rounded-lg flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-16 rounded-full" />
      </div>
      <Skeleton className="h-8 w-28 rounded-md" />
    </div>
  </div>
);

export const CreativeCardSkeleton = () => (
  <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
    <Skeleton className="h-36 w-full" />
    <div className="p-4">
      <div className="flex items-center gap-2.5 mb-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div>
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-16 w-full rounded-xl mb-3" />
      <div className="grid grid-cols-4 gap-1 mb-3">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-9 w-full rounded-xl mt-2" />
    </div>
  </div>
);
