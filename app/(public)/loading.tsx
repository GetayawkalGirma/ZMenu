import { Skeleton } from "@/components/ui/Skeleton";

export default function PublicLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20">
        <div className="max-w-3xl space-y-6">
          <Skeleton className="w-48 h-6 sm:h-8 rounded-full" />
          <div className="space-y-4">
             <Skeleton className="w-full h-12 sm:h-20 rounded-xl" />
             <Skeleton className="w-2/3 h-12 sm:h-20 rounded-xl" />
          </div>
          <Skeleton className="w-full h-6 sm:h-8 rounded-md" />
        </div>
      </div>

      {/* Grid Skeleton Fallback */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar skeleton */}
          <div className="hidden lg:block w-80 shrink-0">
             <Skeleton className="w-full h-[600px] rounded-[2.5rem]" />
          </div>
          {/* Main content grid skeleton */}
          <div className="flex-1 space-y-10">
            <Skeleton className="w-full h-20 rounded-3xl" />
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8">
               {Array.from({ length: 15 }).map((_, i) => (
                 <Skeleton key={i} className="aspect-square sm:h-64 rounded-2xl sm:rounded-[2.5rem]" />
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
