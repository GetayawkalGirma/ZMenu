import { RestaurantMenuService } from "@/services/menu-item/menu-item.service";
import { RestaurantMenuFilters } from "@/components/search/RestaurantMenuFilters";
import { MainSearchBar } from "@/components/search/MainSearchBar";
import { Sparkles, Utensils, Filter } from "lucide-react";
import { Button } from "@/components/ui";
import { FoodGridSkeleton } from "@/components/meal/SuperFoodCardSkeleton";
import { Suspense } from "react";
import { RestaurantMenuInfinite } from "@/components/restaurant/RestaurantMenuInfinite";

export const revalidate = 0; // Disable static caching for real-time discovery

async function FoodList({ searchParams }: { searchParams: any }) {
  const params = await searchParams;
  const categories = params.categories?.split(",").filter(Boolean);
  const types = params.types?.split(",").filter(Boolean);
  const search = params.search;
  const portions = params.portions?.split(",").filter(Boolean);
  const dietary = params.dietary;
  const spicy = params.spicy ? parseInt(params.spicy as string) : undefined;
  const minPrice = params.minPrice ? parseFloat(params.minPrice as string) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice as string) : undefined;
  const nearMe = params.nearMe === "true";
  const userLat = params.lat ? parseFloat(params.lat as string) : undefined;
  const userLng = params.lng ? parseFloat(params.lng as string) : undefined;

  const result = await RestaurantMenuService.getRestaurantMenu({
    page: 1,
    pageSize: 6, // Show 6 items as requested
    search,
    categoryNames: categories,
    foodCategoryType: types?.[0], // Filter by food category type
    portionSize: portions?.[0], // Pass portion filter
    dietaryCategory: dietary,
    spicyLevel: spicy,
    minPrice,
    maxPrice,
    sortBy: "recommended",
    nearMe,
    userLat,
    userLng,
  });

  return (
    <RestaurantMenuInfinite 
      restaurantId=""
      initialItems={result.items}
      initialTotal={result.total}
      restaurant={null}
    />
  );
}

export default async function FoodDiscoveryPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Hero Section - Premium Modern Aesthetic */}
      <section className="relative bg-white pt-10 pb-20 sm:pt-20 sm:pb-32 overflow-hidden border-b border-gray-100 px-4 text-center sm:text-left">
        <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-blue-500 rounded-full blur-[100px]" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-10">
            <div className="max-w-3xl space-y-4 sm:space-y-6">
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest border border-indigo-100 shadow-sm">
                <Sparkles className="w-3 h-3" />
                <span>Culinary Discovery</span>
                </div>
                <h1 className="text-3xl sm:text-7xl font-black text-gray-900 tracking-tighter leading-none mb-4 uppercase">
                Find Your <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 uppercase">Next Craving.</span>
                </h1>
                <p className="text-sm sm:text-lg text-gray-400 font-medium max-w-xl leading-relaxed italic mx-auto sm:mx-0">
                The city's entire menu, indexed for you. Filter by portion, category, or restaurant type.
                </p>
            </div>

            <div className="w-full md:w-auto pb-4">
               <div className="bg-white p-2 rounded-[2rem] shadow-2xl shadow-indigo-100 border border-indigo-50 flex items-center group focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
                  <MainSearchBar 
                    placeholder="Search dishes..." 
                    className="w-full md:w-80 lg:w-96"
                  />
                  <Button size="lg" className="hidden sm:inline-flex bg-indigo-600 hover:bg-indigo-700 rounded-2xl px-10 h-14 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-200">
                    Find
                  </Button>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 -mt-10 sm:-mt-16 pb-20 sm:pb-32">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-12">
          {/* Sidebar Filters */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-24">
               <RestaurantMenuFilters isGlobal={true} />
            </div>
          </div>

          {/* Results Area */}
          <div className="flex-1 space-y-6 sm:space-y-10">
            {/* Control Bar */}
            <div className="flex items-center justify-between bg-white/50 backdrop-blur-md p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/50 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="text-[10px] sm:text-sm font-bold text-gray-400 uppercase tracking-widest">
                  Live Index
                </div>
                
                {/* Mobile Filter Trigger */}
                <div className="lg:hidden">
                  <RestaurantMenuFilters 
                    isGlobal={true}
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

            <Suspense fallback={<FoodGridSkeleton count={6} />}>
              <FoodList searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
