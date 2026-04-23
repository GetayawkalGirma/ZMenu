export const revalidate = 21600; // ISR: rebuild at most every 6 hours

export async function generateStaticParams() {
  const meals = await MenuItemService.getAllMenuItems();
  return meals.map((meal) => ({
    id: meal.id,
  }));
}

import { MenuItemService } from "@/services/menu-item/menu-item.service";
import { Badge, Button } from "@/components/ui";
import {
  ArrowLeft,
  Layers,
  Store,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import MealListingsClient from "./MealListingsClient";

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

  const res = meal as any;
  const restaurants = res.restaurants || [];

  const preferredHeroImage =
    restaurants.find((r: any) => r.imageUrl)?.imageUrl || res.imageUrl;

  const listingsPayload = restaurants.map((rm: any) => ({
    id: rm.id,
    name: rm.name,
    price: typeof rm.price === "number" ? rm.price : Number(rm.price) || 0,
    portionSize: rm.portionSize ?? null,
    isAvailable: Boolean(rm.isAvailable),
    restaurantId: rm.restaurantId,
    imageUrl: rm.imageUrl ?? null,
    restaurant: rm.restaurant
      ? {
          name: rm.restaurant.name ?? null,
          location: rm.restaurant.location ?? null,
          latitude:
            rm.restaurant.latitude != null &&
            !Number.isNaN(Number(rm.restaurant.latitude))
              ? Number(rm.restaurant.latitude)
              : null,
          longitude:
            rm.restaurant.longitude != null &&
            !Number.isNaN(Number(rm.restaurant.longitude))
              ? Number(rm.restaurant.longitude)
              : null,
        }
      : null,
  }));

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <section className="bg-white border-b border-gray-100 pt-6 sm:pt-12 pb-6 sm:pb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/20 -skew-x-12 translate-x-24 hidden sm:block" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link
            href="/search"
            className="inline-flex items-center text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-blue-600 transition-colors mb-4 sm:items-center sm:mb-8"
          >
            <ArrowLeft className="w-3 sm:w-3.5 h-3 sm:h-3.5 mr-2" /> Back
          </Link>

          <div className="flex flex-col md:flex-row gap-6 sm:gap-12 items-center justify-between">
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
                    <span className="mx-1 text-gray-200 font-medium sm:text-sm">/</span>
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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-4 pb-16 sm:pb-32">
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-4 sm:mb-8 gap-4 sm:gap-8 text-center sm:text-left">
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
        </div>

        <MealListingsClient
          listings={listingsPayload}
          fallbackImageUrl={res.imageUrl || ""}
        />
      </section>

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
                &quot;A global staple representing {res.category?.name || "premium"}{" "}
                traditions, priced efficiently across current venues.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
