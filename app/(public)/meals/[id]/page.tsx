export const revalidate = 86400; // Cache for 24 hours

export async function generateStaticParams() {
  const meals = await MenuItemService.getAllMenuItems();
  return meals.map((meal) => ({
    id: meal.id,
  }));
}

import { MenuItemService } from "@/services/menu-item/menu-item.service";
import { Badge, Button, Card } from "@/components/ui";
import {
  ArrowLeft,
  Utensils,
  Info,
  Layers,
  Store,
  Navigation,
  ChevronRight,
  TrendingUp,
  CircleDot,
  Clock,
  ChefHat,
  Flame,
  LayoutGrid,
} from "lucide-react";
import Link from "next/link";
import { formatPrice, cn } from "@/lib/utils";

export default async function PublicMealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meal = await MenuItemService.getMenuItemById(id);

  if (!meal) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">
          Meal Missing
        </h1>
        <Link href="/search" className="mt-8">
          <Button variant="outline">Browse All Meals</Button>
        </Link>
      </div>
    );
  }

  // Cast for extended properties from service
  const res = meal as any;
  const restaurants = res.restaurants || [];

  // Prioritize the FIRST restaurant-specific image found as the hero
  const preferredHeroImage =
    restaurants.find((r: any) => r.imageUrl)?.imageUrl || res.imageUrl;

  return (
    <div className="bg-gray-50/50 min-h-screen">
      {/* Dynamic Header Section */}
      <section className="bg-white border-b border-gray-100 pt-6 sm:pt-12 pb-6 sm:pb-10 relative overflow-hidden">
        {/* Subtle Decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/20 -skew-x-12 translate-x-24 hidden sm:block" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link
            href="/search"
            className="inline-flex items-center text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-blue-600 transition-colors mb-4 sm:items-center sm:mb-8"
          >
            <ArrowLeft className="w-3 sm:w-3.5 h-3 sm:h-3.5 mr-2" /> Back
          </Link>

          <div className="flex flex-col md:flex-row gap-6 sm:gap-12 items-center justify-between">
            {/* Visual Hero (Top on Mobile) */}
            <div className="w-32 h-32 sm:w-64 sm:h-64 aspect-square rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-xl sm:shadow-2xl border-4 border-white bg-gray-50 shrink-0 relative group order-first md:order-last">
              <img
                src={
                  preferredHeroImage ||
                  "https://placehold.co/600x600?text=Premium+Meal"
                }
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt={meal.name}
              />
            </div>

            {/* Insight Text (Left) */}
            <div className="flex-1 space-y-4 sm:space-y-6 text-center md:text-left w-full">
              <div className="space-y-2 sm:space-y-4">
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-600 border-none rounded-lg px-3 sm:px-4 py-0.5 sm:py-1 font-black text-[8px] sm:text-[10px] uppercase tracking-widest inline-flex"
                >
                  {res.category?.name || "Global Dish"}
                </Badge>
                <h1 className="text-3xl sm:text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                  {meal.name}
                </h1>
              </div>

              <p className="text-sm sm:text-lg text-gray-400 font-medium leading-relaxed max-w-2xl mx-auto md:mx-0">
                {meal.description ||
                  "A masterfully selected culinary masterpiece. Explore how different venues prepare their own unique interpretations."}
              </p>

              {/* Stats Bar */}
              <div className="pt-4 sm:pt-8 border-t border-gray-100 flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-8">
                <div>
                  <span className="text-[8px] sm:text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">
                    Market Avg
                  </span>
                  <span className="text-lg sm:text-2xl font-black text-gray-900">
                    {res.avgPrice ? formatPrice(res.avgPrice) : "—"}
                  </span>
                </div>
                <div className="w-px h-6 sm:h-8 bg-gray-100 hidden xs:block" />
                <div>
                  <span className="text-[8px] sm:text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">
                    Price Range
                  </span>
                  <div className="text-sm sm:text-lg font-black text-gray-900">
                    {res.minPrice ? formatPrice(res.minPrice) : "—"}
                    <span className="mx-1 text-gray-200 font-medium sm:text-sm">
                      /
                    </span>
                    {res.maxPrice ? formatPrice(res.maxPrice) : "—"}
                  </div>
                </div>
                <div className="w-px h-6 sm:h-8 bg-gray-100 hidden xs:block" />
                <div>
                  <span className="text-[8px] sm:text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">
                    Citations
                  </span>
                  <span className="text-lg sm:text-2xl font-black text-blue-600">
                    {restaurants.length} Spots
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-1 sm:gap-2 pt-2 sm:pt-4">
                {meal.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 sm:px-3 sm:py-1 bg-gray-50 text-gray-400 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest border border-gray-100"
                  >
                    # {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Comparison Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-4 pb-16 sm:pb-32">
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-8 sm:mb-16 gap-4 sm:gap-8 text-center sm:text-left">
          <div className="space-y-2 sm:space-y-4">
            <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 text-blue-600">
              <Layers className="w-4 h-4 sm:w-6 sm:h-6" />
              <span className="text-[8px] sm:text-xs font-black uppercase tracking-[0.3em]">
                Market Listings
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tighter uppercase">
              Compare Venues
            </h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 bg-white p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm">
            {["Recommended", "Price Low"].map((opt) => (
              <button
                key={opt}
                className="px-4 py-1.5 sm:px-6 sm:py-2.5 text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 rounded-lg sm:rounded-xl transition-all"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* HIGH DENSITY COMPARISON GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
          {restaurants.length > 0 ? (
            restaurants.map((rm: any) => (
              <Card
                key={rm.id}
                className="group overflow-hidden border-0 shadow-sm shadow-gray-200 hover:shadow-xl transition-all duration-300 rounded-xl sm:rounded-3xl bg-white"
              >
                <div className="flex flex-col relative h-full">
                  {/* Visual Header - High Density on Mobile */}
                  <div className="relative w-full aspect-square sm:h-48 overflow-hidden shrink-0">
                    <img
                      src={
                        rm.imageUrl ||
                        res.imageUrl ||
                        "https://placehold.co/600x400?text=Premium+Meal"
                      }
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      alt={rm.name}
                    />
                    <div className="absolute top-1 left-1 sm:top-2 sm:left-2 z-20 px-1.5 h-4 sm:h-5 bg-gray-900/80 backdrop-blur-md rounded-md flex items-center justify-center text-white text-[6px] sm:text-[7px] font-black uppercase tracking-widest">
                      {rm.portionSize || "1P"}
                    </div>
                    <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 z-20 bg-white/95 px-2 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-lg shadow-xl border border-white/20">
                       <span className="text-[10px] sm:text-base font-black text-green-600">
                          {formatPrice(rm.price)}
                       </span>
                    </div>
                  </div>

                  {/* Content Area - Optimized Padding */}
                  <div className="p-2 sm:p-6 flex flex-col justify-between flex-1 space-y-2 sm:space-y-4">
                    <div className="space-y-1 sm:space-y-2">
                       <div className="flex items-center text-[7px] sm:text-[9px] font-black text-blue-600 uppercase tracking-widest truncate">
                          <Store className="w-2 sm:w-2.5 h-2 sm:h-2.5 mr-1" />
                          {rm.restaurant?.name}
                       </div>
                       <h3 className="text-[10px] sm:text-lg font-black text-gray-900 tracking-tight uppercase leading-tight truncate group-hover:text-blue-600 transition-colors">
                          {rm.name}
                       </h3>
                       
                       <div className="flex flex-wrap items-center gap-1 sm:gap-3 text-[7px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                          <div className="flex items-center">
                            <Navigation className="w-2 sm:w-2.5 h-2 sm:h-2.5 mr-0.5 sm:mr-1 text-gray-300" />
                            <span className="truncate max-w-[50px] sm:max-w-[80px]">{rm.restaurant?.location || "Addis"}</span>
                          </div>
                       </div>
                    </div>

                    <div className="pt-1 sm:pt-2 border-t border-gray-50 flex items-center justify-between gap-1">
                       <div className={cn(
                          "px-1 py-0.5 rounded-md border text-[6px] font-black uppercase tracking-widest hidden xs:block",
                          rm.isAvailable ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-gray-400 bg-gray-50 border-gray-100"
                       )}>
                          {rm.isAvailable ? "In Stock" : "Sold Out"}
                       </div>
                       <Link href={`/restaurants/${rm.restaurantId}`} className="flex-1 sm:flex-none">
                          <Button size="sm" className="w-full sm:w-auto h-7 sm:h-8 rounded-md sm:rounded-lg bg-gray-900 hover:bg-black font-black text-[7px] sm:text-[8px] uppercase tracking-widest transition-all px-2">
                             Menu
                          </Button>
                       </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white border-2 border-dashed border-gray-100 rounded-[2rem]">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No Listings Available</p>
            </div>
          )}
        </div>
      </section>

      {/* Global Meal Stats Bento */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
          <div className="bg-blue-600 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 text-white shadow-xl sm:shadow-2xl shadow-blue-200">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 mb-4 sm:mb-6 text-blue-200" />
            <h4 className="text-[8px] sm:text-sm font-black uppercase tracking-widest text-blue-100 mb-1 sm:mb-2">
              Market Stability
            </h4>
            <p className="text-xl sm:text-3xl font-black tracking-tight uppercase">
              High Demand
            </p>
            <p className="mt-2 sm:mt-4 text-blue-100/70 text-[10px] sm:text-sm font-medium">
              Indexed across {restaurants.length} districts in Addis.
            </p>
          </div>
          <div className="md:col-span-2 bg-gray-900 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 text-white shadow-xl sm:shadow-2xl shadow-gray-200 flex flex-col justify-between">
            <div>
              <h4 className="text-[8px] sm:text-sm font-black uppercase tracking-widest text-gray-500 mb-4 sm:mb-6">
                Culinary Perspective
              </h4>
              <p className="text-lg sm:text-2xl font-black tracking-tight leading-relaxed text-gray-200 italic uppercase">
                &quot;A global staple representing {res.category?.name || "premium"} traditions, priced efficiently across current venues.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
