import Link from "next/link";
import { Clock, TrendingUp, Pizza } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { getRecentRestaurants, getRecentMenuUpdates } from "./dashboard-data";

export async function RecentActivities() {
  const [recentRestaurants, recentMenuUpdates] = await Promise.all([
    getRecentRestaurants(),
    getRecentMenuUpdates(),
  ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
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
  );
}

export function ActivitiesSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
      <div className="h-[400px] bg-gray-100 rounded-[2rem] border border-gray-200" />
      <div className="h-[400px] bg-gray-100 rounded-[2rem] border border-gray-200" />
    </div>
  );
}
