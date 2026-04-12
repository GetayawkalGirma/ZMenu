import Link from "next/link";
import { Button } from "@/components/ui";
import { RestaurantService } from "@/services/restaurant/restaurant.service";
import { UtensilsCrossed, TrendingUp, Search } from "lucide-react";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { RestaurantFilters } from "@/components/search/RestaurantFilters";

export default async function RestaurantsPage() {
  const result = await RestaurantService.getAllRestaurants();
  const restaurants: any[] = result.success ? result.data || [] : [];

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Hero Search Section */}
      <section className="relative bg-white pt-20 pb-32 overflow-hidden border-b border-gray-100">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 -right-24 w-64 h-64 bg-indigo-500 rounded-full blur-[100px]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="max-w-3xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-100 shadow-sm">
                <TrendingUp className="w-3 h-3" />
                <span>Exploring Addis Ababa</span>
              </div>
              <h1 className="text-5xl sm:text-7xl font-black text-gray-900 tracking-tighter leading-[0.9]">
                Find Your <br />
                Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 uppercase">Crave.</span>
              </h1>
              <p className="mt-8 text-lg sm:text-xl text-gray-400 font-medium max-w-xl leading-relaxed">
                Browse through real-time menus, prices, and locations of top-tier restaurants in the city. No more guessing.
              </p>
            </div>
            
            <div className="w-full md:w-auto pb-4">
              <div className="bg-white p-2 rounded-2xl shadow-2xl shadow-blue-100 border border-gray-100 flex items-center group focus-within:ring-4 focus-within:ring-blue-50 transition-all">
                <div className="pl-4 text-gray-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Restaurant or Cuisine..."
                  className="pl-3 pr-10 py-4 bg-transparent focus:outline-none w-full md:w-64 font-bold text-gray-900 placeholder:text-gray-300"
                />
                <Button size="lg" className="bg-gray-900 hover:bg-black rounded-xl px-8 h-12 font-black uppercase tracking-widest text-[10px] shadow-lg">
                  Explore
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Listing Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-32">
        <div className="flex flex-col md:flex-row gap-8">
          <RestaurantFilters />
          
          <div className="flex-1">
            {restaurants.length > 0 ? (
              <div className="grid grid-cols-1 gap-8">
                {restaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            ) : (
          <div className="text-center py-40 bg-white rounded-[40px] shadow-2xl shadow-gray-100 border border-gray-50 overflow-hidden relative group">
            <div className="relative z-10">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-700">
                <UtensilsCrossed className="w-10 h-10 text-gray-200" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tighter">Directory is quiet...</h3>
              <p className="text-gray-400 font-medium text-lg max-w-sm mx-auto leading-relaxed">
                Be the pioneer. Add the first restaurant and start the culinary movement.
              </p>
              <Link href="/admin/restaurant-management/new" className="mt-12 inline-block">
                <Button className="rounded-2xl px-12 h-16 font-black uppercase tracking-widest text-xs bg-blue-600 shadow-2xl shadow-blue-200 hover:bg-black transition-all">
                  Initialize Directory
                </Button>
              </Link>
            </div>
            {/* Aesthetic background blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -ml-32 -mb-32" />
          </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
