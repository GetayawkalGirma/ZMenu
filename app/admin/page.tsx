import { Suspense } from "react";
import { TrendingUp } from "lucide-react";
import { DashboardStats, StatsSkeleton } from "./DashboardStats";
import { RecentActivities, ActivitiesSkeleton } from "./RecentActivities";

export default async function AdminDashboard() {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header - Always static and fast */}
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

      {/* Heavy Stats - Wrapped in Suspense */}
      <Suspense fallback={<StatsSkeleton />}>
        <DashboardStats />
      </Suspense>

      {/* Recent Activities - Wrapped in Suspense */}
      <Suspense fallback={<ActivitiesSkeleton />}>
        <RecentActivities />
      </Suspense>
    </div>
  );
}
