export const dynamic = "force-dynamic";

import { MenuItemFilters } from "@/components/search/MenuItemFilters";
import { MealCard } from "@/components/meal/MealCard";
import { Sparkles, Utensils, Filter } from "lucide-react";
import { MenuItemService } from "@/services/menu-item/menu-item.service";
import { Button } from "@/components/ui";

export default async function SearchPage() {
  const menuItems = await MenuItemService.getAllMenuItems();

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Search Hero Section */}
      <section className="relative bg-white pt-10 pb-20 sm:pt-20 sm:pb-32 overflow-hidden border-b border-gray-100 px-4 text-center sm:text-left">
        <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-blue-500 rounded-full blur-[100px]" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl space-y-4 sm:space-y-6 mx-auto sm:mx-0">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest border border-indigo-100 shadow-sm">
              <Sparkles className="w-3 h-3" />
              <span>Discover Great Tastes</span>
            </div>
            <h1 className="text-3xl sm:text-7xl font-black text-gray-900 tracking-tighter leading-none mb-4 uppercase">
              Crave it. <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 uppercase">Find it.</span>
            </h1>
            <p className="text-sm sm:text-lg text-gray-400 font-medium max-w-xl leading-relaxed italic mx-auto sm:mx-0">
               Explore every dish in the city. Filter by diet, heat level, or value.
            </p>
          </div>
        </div>
      </section>

      {/* Main Search Layout */}
      <section className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 -mt-10 sm:-mt-16 pb-20 sm:pb-32">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-12">
          {/* Sidebar Filters */}
          <div className="hidden lg:block w-80 shrink-0">
            <MenuItemFilters />
          </div>

          {/* Results Area */}
          <div className="flex-1 space-y-6 sm:space-y-10">
            <div className="flex items-center justify-between bg-white/50 backdrop-blur-md p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/50 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="text-[10px] sm:text-sm font-bold text-gray-400 uppercase tracking-widest">
                  Found <span className="text-gray-900 font-black">{menuItems.length}</span> Results
                </div>
                
                {/* Mobile Filter Trigger */}
                <div className="lg:hidden">
                  <MenuItemFilters 
                    trigger={
                      <Button variant="outline" className="h-8 px-3 rounded-lg border-gray-100 bg-white shadow-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-all text-[8px] font-black uppercase tracking-widest">
                        <Filter className="w-3.5 h-3.5 text-indigo-600" />
                        Filters
                      </Button>
                    } 
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-[8px] sm:text-[10px] font-black uppercase text-gray-400">
                <span className="hidden xs:inline">Sorted by</span> <span className="text-indigo-600">Relevance</span>
              </div>
            </div>

            {menuItems.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-8">
                {menuItems.map((meal: any) => (
                  <MealCard key={meal.id} meal={meal} showActions={false} />
                ))}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center bg-white rounded-[2rem] sm:rounded-[3rem] border-2 border-dashed border-gray-100">
                <Utensils className="w-10 h-10 sm:w-16 sm:h-16 mb-4 sm:mb-6 text-gray-100" />
                <p className="text-xs sm:text-lg text-gray-400 font-black uppercase tracking-tighter text-center">No match found.</p>
              </div>
            )}

            {/* Pagination Placeholder */}
            {menuItems.length > 10 && (
              <div className="pt-8 flex justify-center">
                 <div className="flex gap-2">
                   {[1, 2, 3].map(page => (
                     <button 
                       key={page}
                       className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs transition-all ${
                         page === 1 ? "bg-gray-900 text-white shadow-xl" : "bg-white text-gray-400 hover:bg-gray-50 border border-gray-100"
                       }`}
                     >
                       {page}
                     </button>
                   ))}
                 </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
