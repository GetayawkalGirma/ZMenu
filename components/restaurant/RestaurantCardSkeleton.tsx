import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export function RestaurantCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      "relative overflow-hidden border-0 bg-white rounded-2xl sm:rounded-[2.5rem] flex flex-col h-full",
      className
    )}>
      {/* Top Image Section Skeleton */}
      <div className="relative h-40 sm:h-64 overflow-hidden bg-gray-50 flex-shrink-0">
        <Skeleton className="w-full h-full" />
        <div className="absolute top-2 left-2 sm:top-6 sm:left-6">
          <Skeleton className="w-16 h-6 sm:w-24 sm:h-8 rounded-lg sm:rounded-xl" />
        </div>
      </div>

      {/* Bottom Info Section Skeleton */}
      <div className="p-4 sm:p-8 flex-1 flex flex-col justify-between space-y-4 sm:space-y-8">
        <div className="space-y-3 sm:space-y-6">
          <div className="space-y-1 sm:space-y-2">
            <Skeleton className="w-full h-4 sm:h-10 rounded-md" />
            <Skeleton className="w-3/4 h-3 sm:h-6 rounded-md" />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4 pb-2 sm:pb-4 border-b border-gray-50">
            <div className="space-y-1">
              <Skeleton className="w-12 h-2 sm:h-3 rounded-md" />
              <Skeleton className="w-16 h-4 sm:h-6 rounded-md" />
            </div>
            <div className="space-y-1 text-right flex flex-col items-end">
              <Skeleton className="w-12 h-2 sm:h-3 rounded-md" />
              <Skeleton className="w-16 h-4 sm:h-6 rounded-md" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
           <Skeleton className="w-12 h-4 sm:w-20 sm:h-6 rounded-md sm:rounded-lg" />
           <Skeleton className="w-10 h-4 sm:w-16 sm:h-6 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function RestaurantGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <RestaurantCardSkeleton key={i} />
      ))}
    </div>
  );
}
