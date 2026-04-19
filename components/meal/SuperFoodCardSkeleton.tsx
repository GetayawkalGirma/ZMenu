import { Skeleton } from "@/components/ui/Skeleton";

export function SuperFoodCardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-[2.5rem] overflow-hidden flex flex-col h-full relative">
      {/* Visual Header Skeleton */}
      <div className="aspect-square sm:h-64 w-full bg-gray-50 flex-shrink-0 relative">
        <Skeleton className="w-full h-full" />
        
        {/* Top Overlays */}
        <div className="absolute top-2 left-2 right-2 sm:top-5 sm:left-5 sm:right-5 flex justify-between items-start">
          <div className="flex flex-col gap-1 sm:gap-2">
             <Skeleton className="w-12 h-4 sm:w-20 sm:h-6 rounded-md sm:rounded-xl" />
             <Skeleton className="w-16 h-4 sm:w-24 sm:h-6 rounded-md sm:rounded-xl" />
          </div>
          <Skeleton className="w-12 h-6 sm:w-24 sm:h-12 rounded-lg sm:rounded-2xl" />
        </div>
      </div>

      <div className="p-3 sm:p-8 flex-1 flex flex-col space-y-4">
        <div className="space-y-3">
          {/* Labels Row */}
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="w-16 h-3 sm:w-24 sm:h-4 rounded-md" />
            <Skeleton className="w-12 h-6 sm:w-20 sm:h-8 rounded-md sm:rounded-xl" />
          </div>
          
          {/* Title Skeleton */}
          <div className="space-y-1">
             <Skeleton className="w-full h-4 sm:h-8 rounded-md" />
             <Skeleton className="w-3/4 h-4 sm:h-8 rounded-md" />
          </div>
        </div>

        {/* Description (Desktop Only) */}
        <div className="hidden sm:block space-y-2">
          <Skeleton className="w-full h-4 rounded-md" />
          <Skeleton className="w-5/6 h-4 rounded-md" />
        </div>

        {/* Footer Skeleton */}
        <div className="mt-auto pt-2 sm:pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <Skeleton className="w-16 h-3 sm:w-24 sm:h-4 rounded-md" />
            <Skeleton className="hidden sm:block w-12 h-2 sm:h-3 rounded-md" />
          </div>
          <Skeleton className="w-12 h-6 sm:w-28 sm:h-12 rounded-lg sm:rounded-[1.5rem]" />
        </div>
      </div>
    </div>
  );
}

export function FoodGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-6 md:gap-8 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <SuperFoodCardSkeleton key={i} />
      ))}
    </div>
  );
}
