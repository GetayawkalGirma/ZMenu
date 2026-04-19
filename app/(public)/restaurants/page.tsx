import Link from "next/link";
import { Button } from "@/components/ui";
import { RestaurantService } from "@/services/restaurant/restaurant.service";
import { UtensilsCrossed, TrendingUp, Search, Filter } from "lucide-react";
import { RestaurantFilters } from "@/components/search/RestaurantFilters";
import { MainSearchBar } from "@/components/search/MainSearchBar";
import { RestaurantGridSkeleton } from "@/components/restaurant/RestaurantCardSkeleton";
import { Suspense } from "react";
import { RestaurantListInfinite } from "@/components/restaurant/RestaurantListInfinite";

export const revalidate = 0; // Disable static caching for real-time filters

async function RestaurantList({ searchParams }: { searchParams: any }) {
  const params = await searchParams;
  const categories = params.categories?.split(",").filter(Boolean);
  const features = params.features?.split(",").filter(Boolean);
  const search = params.search;
  const sortBy = params.sortBy;
  const nearMe = params.nearMe === "true";
  const userLat = params.lat ? parseFloat(params.lat as string) : undefined;
  const userLng = params.lng ? parseFloat(params.lng as string) : undefined;

  const result = await RestaurantService.getRestaurantsPaginated({
    page: 1,
    pageSize: 6, // 6 items as requested
    search,
    categoryNames: categories,
    featureNames: features,
    sortBy,
    status: "PUBLISHED",
    nearMe,
    userLat,
    userLng,
  });

  const items = result.success ? result.data?.items || [] : [];
  const total = result.success ? result.data?.total || 0 : 0;

  return <RestaurantListInfinite initialItems={items} initialTotal={total} />;
}

export default async function RestaurantsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  return (
    <div className="bg-white min-h-screen">
      {/* Search & Discover Hero - Premium Aesthetic */}
      <section className="bg-white border-b border-gray-100 pt-6 sm:pt-16 pb-6 sm:pb-24 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-50/50 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-[80px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 sm:gap-12 text-center sm:text-left">
            <div className="max-w-3xl space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-900 text-white text-[8px] sm:text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg">
                <UtensilsCrossed className="w-3 h-3" /> Premier Venues
              </div>
              <h1 className="text-3xl sm:text-7xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                Beyond The <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 uppercase">
                   Plate.
                </span>
              </h1>
              <p className="text-sm sm:text-lg text-gray-400 font-medium leading-relaxed max-w-xl mx-auto sm:mx-0">
                 Explore the most celebrated restaurants, cafes, and bars in the city. Real menus, real voices.
              </p>
            </div>
            
            <div className="w-full md:w-auto pb-4">
              <div className="flex items-center gap-2">
                <div className="bg-white p-1.5 sm:p-2 flex-1 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl shadow-blue-100 border border-gray-100 flex items-center group focus-within:ring-4 focus-within:ring-blue-50 transition-all">
                  <MainSearchBar 
                    placeholder="Find restaurant..." 
                    className="w-full md:w-80 lg:w-96"
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

      {/* Grid Section */}
      <section className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6 sm:py-16">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-16">
          {/* Sidebar */}
          <aside
            className="hidden lg:block w-80 shrink-0"
          >
            <div className="sticky top-24">
               <RestaurantFilters />
            </div>
          </aside>

          {/* Results Grid */}
          <div className="flex-1 space-y-6 sm:space-y-12">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-50 text-blue-600 rounded-lg sm:rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-xl font-black text-gray-900 uppercase tracking-tighter">Verified Hubs</h2>
                  <p className="text-[8px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Updated hourly</p>
                </div>
              </div>
            </div>

            <Suspense fallback={<RestaurantGridSkeleton count={6} />}>
               <RestaurantList searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
