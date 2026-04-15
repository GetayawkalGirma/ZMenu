export const dynamic = "force-dynamic";

import { RestaurantMenuService } from "@/services/menu-item/menu-item.service";
import { SuperFoodCard } from "@/components/meal/SuperFoodCard";
import { RestaurantMenuFilters } from "@/components/search/RestaurantMenuFilters";
import { Utensils, LayoutGrid, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui";

export default async function FoodDiscoveryPage() {
  const foods = await RestaurantMenuService.getAllRestaurantMenus();

  return (
    <div className="bg-white min-h-screen">
      {/* Premium Discovery Header */}
      <div className="bg-white border-b border-gray-100 relative overflow-hidden">
        {/* Subtle Light Accents */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-[100px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-50/50 rounded-full blur-[100px] -ml-48 -mb-48" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-16 relative z-10 text-center sm:text-left">
          <div className="max-w-3xl space-y-4 sm:space-y-6 mx-auto sm:mx-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 bg-blue-50 text-blue-600 text-[8px] sm:text-[10px] font-black rounded-full uppercase tracking-[0.2em] sm:tracking-[0.3em] shadow-sm">
              <Utensils className="w-3 h-3 sm:w-3.5 h-3.5" /> Global Menu Feed
            </div>
            <h1 className="text-3xl sm:text-6xl font-black text-gray-900 tracking-tighter leading-none uppercase">
              What Do You <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Want To Eat?
              </span>
            </h1>
            <p className="text-sm sm:text-lg text-gray-400 font-medium leading-relaxed italic max-w-xl mx-auto sm:mx-0">
               Explore every dish in the city with real-time pricing and visual listings.
            </p>
          </div>
        </div>
      </div>

      {/* Main Discovery Section */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-12">
          
          {/* Persistent Desktop Sidebar */}
          <div className="hidden lg:block w-80 shrink-0">
            <RestaurantMenuFilters isGlobal={true} />
          </div>

          <div className="flex-1 space-y-6 sm:space-y-10">
            {/* Filter Hub Strip */}
            <div className="flex items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-gray-100">
              <div className="flex items-center gap-2 sm:gap-4">
                <h2 className="text-xs sm:text-xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  Index
                </h2>
                <div className="h-4 w-px bg-gray-100 hidden sm:block" />
                <span className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest hidden xs:block">
                  {foods.length} Dishes
                </span>
              </div>

                <div className="relative flex items-center gap-2">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Find..." 
                      className="w-28 sm:w-64 h-9 sm:h-11 bg-gray-50 border border-transparent rounded-lg sm:rounded-xl px-8 sm:px-10 text-[10px] sm:text-xs font-bold tracking-tight focus:bg-white focus:border-blue-600 transition-all outline-none shadow-sm"
                    />
                    <Search className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-300 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2" />
                  </div>
                  
                  {/* Mobile-Visible Filter Trigger */}
                  <div className="lg:hidden">
                    <RestaurantMenuFilters 
                      isGlobal={true} 
                      trigger={
                        <Button variant="outline" className="h-9 w-9 p-0 rounded-lg border-gray-100 bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-all">
                          <Filter className="w-4 h-4 text-gray-600" />
                        </Button>
                      } 
                    />
                  </div>
                </div>
            </div>

            {/* The Ultimate Super Grid - High Density Mobile First */}
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-6 md:gap-8">
              {foods.length > 0 ? (
                foods.map((item: any) => (
                  <SuperFoodCard key={item.id} item={item} />
                ))
              ) : (
                <div className="col-span-full py-20 sm:py-32 text-center bg-gray-50 rounded-[2rem] sm:rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-xl">
                     <Utensils className="w-6 h-6 sm:w-8 sm:h-8 text-gray-200" />
                  </div>
                  <p className="text-sm sm:text-lg text-gray-400 font-black uppercase tracking-tighter">No delicacies found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
