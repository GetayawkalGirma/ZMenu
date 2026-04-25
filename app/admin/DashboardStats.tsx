import { 
  Utensils, 
  Pizza, 
  FileEdit, 
  Store, 
  Package, 
  Beef, 
  Wine, 
  Tags,
  HardDrive,
  ImageIcon
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Counter } from "@/components/ui";
import { getDashboardStats, formatBytes } from "./dashboard-data";

export async function DashboardStats() {
  const stats = await getDashboardStats();

  const statCards = [
    {
      label: "Restaurants",
      value: stats.totalRestaurants,
      hint: "All venues",
      icon: Utensils,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Draft",
      value: stats.draftRestaurants,
      hint: "Not live",
      icon: FileEdit,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Published",
      value: stats.publishedRestaurants,
      hint: "Live on site",
      icon: Store,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Venue meals",
      value: stats.totalRestaurantMeals,
      hint: "Restaurant menu rows",
      icon: Pizza,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Catalog items",
      value: stats.catalogMenuItems,
      hint: "Global MenuItem records",
      icon: Package,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Food listings",
      value: stats.foodListings,
      hint: "Meals tagged FOOD",
      icon: Beef,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Drink listings",
      value: stats.drinkListings,
      hint: "Meals tagged DRINK",
      icon: Wine,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      label: "Categories",
      value: stats.categories,
      hint: "Menu categories",
      icon: Tags,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
    },
  ];

  const storagePct = Math.min(
    100,
    Math.round((stats.storageAllFilesBytes / stats.storageQuotaBytes) * 100)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div className={cn("p-2 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 max-w-[90px] text-right leading-tight">
                {stat.hint}
              </span>
            </div>
            <div className="text-xl sm:text-3xl font-black text-gray-900">
              <Counter value={stat.value} />
            </div>
            <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-50">
              <HardDrive className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-900">
                Storage (tracked files)
              </h2>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Sizes from your <code className="text-gray-500">File</code> table.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 font-bold text-gray-700">
              <ImageIcon className="w-4 h-4 text-blue-500" />
              {stats.storageImageCount} images
            </span>
            <span className="text-gray-300">·</span>
            <span className="font-black text-gray-900">
              {formatBytes(stats.storageImageBytes)}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
            <span>All files (DB sum)</span>
            <span>
              {formatBytes(stats.storageAllFilesBytes)} / {formatBytes(stats.storageQuotaBytes)} (
              {storagePct}%)
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                storagePct >= 90 ? "bg-red-500" : storagePct >= 70 ? "bg-amber-500" : "bg-blue-500"
              )}
              style={{ width: `${storagePct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-2xl border border-gray-200" />
        ))}
      </div>
      <div className="h-40 bg-gray-100 rounded-2xl border border-gray-200" />
    </div>
  );
}
