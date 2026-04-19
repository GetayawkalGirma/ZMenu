import { LayoutDashboard, Utensils, Pizza, Users, AlertCircle, TrendingUp, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function AdminDashboard() {
  const stats = await getDashboardStats();
  const recentRestaurants = await getRecentRestaurants();
  const recentPriceUpdates = await getRecentPriceUpdates();

  const statCards = [
    { label: "Restaurants", value: stats.totalRestaurants, growth: `+${stats.restaurantsGrowth}`, icon: Utensils, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Meals", value: stats.totalMeals, growth: `+${stats.mealsGrowth}`, icon: Pizza, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Active Users", value: stats.activeUsers, growth: `+${stats.usersGrowth}%`, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Pending Updates", value: stats.pendingPriceUpdates, growth: "Action Needed", icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight uppercase">
            Overview
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 font-medium italic">
            ZMenu system performance and recent activity.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">Live Status</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-2 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <span className={cn(
                "text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                stat.label.includes("Pending") ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
              )}>
                {stat.growth}
              </span>
            </div>
            <div className="text-xl sm:text-3xl font-black text-gray-900">{stat.value}</div>
            <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Recent Restaurants */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Recent Venues</h2>
            <Clock className="w-4 h-4 text-gray-300" />
          </div>
          <div className="p-6 sm:p-8 space-y-6">
            {recentRestaurants.map((res) => (
              <div key={res.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center font-black text-gray-400 text-sm group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        {res.name.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{res.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium italic">{res.timeAgo}</p>
                    </div>
                </div>
                <span className={cn(
                    "px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full",
                    res.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                )}>
                    {res.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Price Updates */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Market Pulse</h2>
            <TrendingUp className="w-4 h-4 text-gray-300" />
          </div>
          <div className="p-6 sm:p-8 space-y-6">
            {recentPriceUpdates.map((update) => (
              <div key={update.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                        update.oldPrice < update.newPrice ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                    )}>
                        {update.oldPrice < update.newPrice ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{update.mealName}</p>
                        <p className="text-[10px] text-gray-400 font-medium italic">{update.restaurantName}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className={cn(
                        "text-sm font-black",
                        update.oldPrice < update.newPrice ? "text-red-600" : "text-emerald-600"
                    )}>
                        {update.newPrice}
                    </p>
                    <p className="text-[8px] text-gray-300 font-black uppercase tracking-widest line-through">
                        {update.oldPrice}
                    </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Local mock logic if dashboard stats are defined here or need to be moved to actions
async function getDashboardStats() {
  return {
    totalRestaurants: 12,
    restaurantsGrowth: 2,
    totalMeals: 248,
    mealsGrowth: 18,
    activeUsers: 1429,
    usersGrowth: 12,
    pendingPriceUpdates: 7,
  };
}

async function getRecentRestaurants() {
  return [
    { id: "1", name: "The Garden Bistro", timeAgo: "2 hours ago", status: "Active" },
    { id: "2", name: "Sushi Paradise", timeAgo: "5 hours ago", status: "Active" },
    { id: "3", name: "Burger Haven", timeAgo: "1 day ago", status: "Pending" },
  ];
}

async function getRecentPriceUpdates() {
  return [
    { id: "1", mealName: "Pasta Carbonara", restaurantName: "The Garden Bistro", oldPrice: 18, newPrice: 22, timeAgo: "2 hours ago" },
    { id: "2", mealName: "California Roll", restaurantName: "Sushi Paradise", oldPrice: 12, newPrice: 15, timeAgo: "5 hours ago" },
    { id: "3", mealName: "Classic Burger", restaurantName: "Burger Haven", oldPrice: 15, newPrice: 13, timeAgo: "1 day ago" },
  ];
}
