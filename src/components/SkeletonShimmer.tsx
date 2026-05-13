import { cn } from "@/lib/utils";

interface SkeletonShimmerProps {
  variant: "stats" | "chart" | "card" | "list";
  count?: number;
}

const ShimmerBlock = ({ className }: { className?: string }) => (
  <div className={cn("animate-shimmer rounded-xl", className)} />
);

export function SkeletonShimmer({ variant, count = 1 }: SkeletonShimmerProps) {
  if (variant === "stats") {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-4">
            <div className="flex items-start justify-between mb-4">
              <ShimmerBlock className="w-12 h-12" />
              <ShimmerBlock className="w-16 h-5" />
            </div>
            <ShimmerBlock className="w-24 h-3 mb-2" />
            <ShimmerBlock className="w-32 h-7" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "chart") {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <ShimmerBlock className="w-40 h-5 mb-2" />
            <ShimmerBlock className="w-24 h-3" />
          </div>
          <div className="flex gap-2">
            <ShimmerBlock className="w-16 h-8" />
            <ShimmerBlock className="w-16 h-8" />
          </div>
        </div>
        <ShimmerBlock className="w-full h-[300px]" />
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="glass-card p-4">
            <ShimmerBlock className="w-full h-44 mb-3" />
            <ShimmerBlock className="w-3/4 h-4 mb-2" />
            <ShimmerBlock className="w-1/2 h-3 mb-3" />
            <div className="flex gap-2 mb-3">
              <ShimmerBlock className="w-8 h-4" />
              <ShimmerBlock className="w-20 h-4" />
            </div>
            <div className="pt-3 border-t border-border flex justify-between">
              <ShimmerBlock className="w-20 h-6" />
              <ShimmerBlock className="w-16 h-6" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // list
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="glass-card p-4 flex items-center gap-4">
          <ShimmerBlock className="w-14 h-14 flex-shrink-0" />
          <div className="flex-1">
            <ShimmerBlock className="w-3/4 h-4 mb-2" />
            <ShimmerBlock className="w-1/2 h-3" />
          </div>
          <ShimmerBlock className="w-24 h-8" />
        </div>
      ))}
    </div>
  );
}
