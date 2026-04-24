import Link from "next/link";
import {
  Utensils,
  Pizza,
  FileEdit,
  Store,
  Package,
  Beef,
  Wine,
  Tags,
  Clock,
  TrendingUp,
  ImageIcon,
  HardDrive,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Counter } from "@/components/ui";
import {
  getDashboardStats,
  getRecentRestaurants,
  getRecentMenuUpdates,
  formatBytes,
} from "./dashboard-data";

export default async function AdminDashboard() {
  const [stats, recentRestaurants, recentMenuUpdates] = await Promise.all([
    getDashboardStats(),
    getRecentRestaurants(),
    getRecentMenuUpdates(),
  ]);

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
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight uppercase">
            Overview
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 font-medium italic">
            Live counts from your database.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">
            Live data
          </span>
        </div>
      </div>

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
                Sizes from your <code className="text-gray-500">File</code> table. Quota defaults to
                Supabase Free (1&nbsp;GiB) unless{" "}
                <code className="text-gray-500">SUPABASE_STORAGE_QUOTA_BYTES</code> is set. Project
                usage in the Supabase dashboard can differ if orphans exist in the bucket.
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
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">image bytes</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Recent venues</h2>
            <Clock className="w-4 h-4 text-gray-300" />
          </div>
          <div className="p-6 sm:p-8 space-y-6">
            {recentRestaurants.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No restaurants yet.</p>
            ) : (
              recentRestaurants.map((res) => (
                <Link
                  key={res.id}
                  href={`/admin/restaurant-management/${res.id}`}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center font-black text-gray-400 text-sm group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0">
                      {res.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {res.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium italic">{res.timeAgo}</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full shrink-0 ml-2",
                      res.status === "Published"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-800"
                    )}
                  >
                    {res.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
              Recent menu updates
            </h2>
            <TrendingUp className="w-4 h-4 text-gray-300" />
          </div>
          <div className="p-6 sm:p-8 space-y-6">
            {recentMenuUpdates.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No menu items yet.</p>
            ) : (
              recentMenuUpdates.map((row) => (
                <div key={row.id} className="flex items-center justify-between group gap-3">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                      <Pizza className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{row.mealName}</p>
                      <p className="text-[10px] text-gray-400 font-medium italic truncate">
                        {row.restaurantName} · {row.timeAgo}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-gray-900">{formatPrice(row.price)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
