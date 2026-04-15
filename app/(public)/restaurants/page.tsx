export const dynamic = "force-dynamic";

import Link from "next/link";
import { Button } from "@/components/ui";
import { RestaurantService } from "@/services/restaurant/restaurant.service";
import { UtensilsCrossed, TrendingUp, Search, Filter } from "lucide-react";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { RestaurantFilters } from "@/components/search/RestaurantFilters";

export default async function RestaurantsPage() {
  const result = await RestaurantService.getAllRestaurants();
  const restaurants: any[] = result.success ? result.data || [] : [];

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Hero Search Section */}
      <section className="relative bg-white pt-10 pb-20 sm:pt-20 sm:pb-32 overflow-hidden border-b border-gray-100">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 -right-24 w-64 h-64 bg-indigo-500 rounded-full blur-[100px]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center sm:text-left">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 sm:gap-12">
            <div className="max-w-3xl space-y-4 sm:space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest border border-blue-100 shadow-sm">
                <TrendingUp className="w-3 h-3" />
                <span>Exploring Addis Ababa</span>
              </div>
              <h1 className="text-3xl sm:text-7xl font-black text-gray-900 tracking-tighter leading-none uppercase">
                Find Your <br className="hidden sm:block" />
                Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 uppercase">Crave.</span>
              </h1>
              <p className="text-sm sm:text-xl text-gray-400 font-medium max-w-xl leading-relaxed italic mx-auto sm:mx-0">
                Browse through real-time menus, prices, and locations of top-tier restaurants.
              </p>
            </div>
            
            <div className="w-full md:w-auto pb-4">
              <div className="flex items-center gap-2">
                <div className="bg-white p-1.5 sm:p-2 flex-1 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl shadow-blue-100 border border-gray-100 flex items-center group focus-within:ring-4 focus-within:ring-blue-50 transition-all">
                  <div className="pl-3 sm:pl-4 text-gray-400">
                     <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Find..."
                    className="pl-2 sm:pl-3 pr-4 sm:pr-10 py-3 sm:py-4 bg-transparent focus:outline-none w-full md:w-64 font-bold text-xs sm:text-sm text-gray-900 placeholder:text-gray-300"
                  />
                  <Button size="sm" className="hidden sm:inline-flex bg-gray-900 hover:bg-black rounded-lg sm:rounded-xl px-6 sm:px-8 h-10 sm:h-12 font-black uppercase tracking-widest text-[8px] sm:text-[10px] shadow-lg">
                    Explore
                  </Button>
                </div>
                
                {/* Mobile Filter Trigger */}
                <div className="md:hidden">
                   <RestaurantFilters 
                      trigger={
                        <Button variant="outline" className="h-12 w-12 p-0 rounded-xl border-gray-100 bg-white shadow-xl shadow-blue-50 flex items-center justify-center hover:bg-gray-50 transition-all">
                           <Filter className="w-5 h-5 text-gray-900" />
                        </Button>
                      } 
                   />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Listing Section */}
      <section className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 -mt-10 sm:-mt-16 pb-20 sm:pb-32">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-12">
          {/* Persistent Sidebar */}
          <div className="w-full lg:w-80 shrink-0">
             <RestaurantFilters />
          </div>
          
          <div className="flex-1 space-y-6 sm:space-y-10">
            {/* Control Strip */}
            <div className="flex items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-gray-100 px-2">
               <div className="flex items-center gap-2 sm:gap-4">
                  <h2 className="text-[10px] sm:text-lg font-black text-gray-900 uppercase tracking-tighter">Directory</h2>
                  <div className="h-4 w-px bg-gray-100" />
                  <span className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                     {restaurants.length} Venues
                  </span>
               </div>
            </div>

            {/* HIGH DENSITY GRID - 2 COL MOBILE */}
            <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-8">
              {restaurants.length > 0 ? (
                restaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white rounded-[2rem] sm:rounded-[3rem] border-2 border-dashed border-gray-100 p-8">
                   <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <UtensilsCrossed className="w-8 h-8 sm:w-10 sm:h-10 text-gray-200" />
                   </div>
                   <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Quiet Directory</h3>
                   <p className="text-gray-400 font-medium text-xs sm:text-sm max-w-xs mx-auto mb-8">
                      Be the pioneer. Add the first restaurant.
                   </p>
                   <Link href="/admin/restaurant-management/new">
                      <Button className="rounded-xl px-8 h-12 font-black uppercase tracking-widest text-[9px] bg-blue-600 shadow-xl shadow-blue-100 hover:bg-black transition-all">
                        Initialize
                      </Button>
                   </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
