import { RestaurantMenuService } from "@/services/menu-item/menu-item.service";
import { SuperFoodCard } from "@/components/meal/SuperFoodCard";
import { RestaurantMenuFilters } from "@/components/search/RestaurantMenuFilters";
import { Utensils, LayoutGrid, Search, Filter } from "lucide-react";

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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-[0.3em] shadow-sm">
              <Utensils className="w-3.5 h-3.5" /> Global Menu Feed
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tighter leading-none uppercase">
              What Do You <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Want To Eat?
              </span>
            </h1>
            <p className="text-lg text-gray-400 font-medium leading-relaxed italic max-w-xl">
               Explore any specific dish you want. From signature delicacies to your daily favorites, discover every plate in the city with real-time pricing.
            </p>
          </div>
        </div>
      </div>

      {/* Main Discovery Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Persistent Desktop Sidebar */}
          <div className="hidden lg:block w-80 shrink-0">
            <RestaurantMenuFilters isGlobal={true} />
          </div>

          <div className="flex-1 space-y-10">
            {/* Filter Hub Strip */}
            <div className="flex items-center justify-between gap-6 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
                  <LayoutGrid className="w-5 h-5 text-blue-600" />
                  Recent Index
                </h2>
                <div className="h-6 w-px bg-gray-100 hidden sm:block" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:block">
                  {foods.length} Dishes Found
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Quick find..." 
                    className="w-48 sm:w-64 h-11 bg-gray-50 border border-transparent rounded-xl px-10 text-xs font-bold tracking-tight focus:bg-white focus:border-blue-600 transition-all outline-none shadow-sm"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-300 absolute left-4 top-4" />
                </div>
                {/* Mobile Filter Trigger */}
                <div className="lg:hidden">
                   <RestaurantMenuFilters isGlobal={true} />
                </div>
              </div>
            </div>

            {/* The Ultimate Super Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {foods.length > 0 ? (
                foods.map((item: any) => (
                  <SuperFoodCard key={item.id} item={item} />
                ))
              ) : (
                <div className="col-span-full py-32 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                     <Utensils className="w-8 h-8 text-gray-200" />
                  </div>
                  <p className="text-lg text-gray-400 font-black uppercase tracking-tighter">No delicacies found in this category.</p>
                  <p className="text-xs text-gray-300 font-bold mt-2 uppercase tracking-widest leading-none">Try clearing your filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
