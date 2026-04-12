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
      <section className="bg-white border-b border-gray-100 pt-12 pb-10 relative overflow-hidden">
        {/* Subtle Decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/20 -skew-x-12 translate-x-24" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link
            href="/search"
            className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-blue-600 transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-2" /> Back to Market
          </Link>

          <div className="flex flex-col md:flex-row gap-12 items-center justify-between">
            {/* Insight Text (Left) */}
            <div className="flex-1 space-y-6">
              <div className="space-y-4">
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-600 border-none rounded-lg px-4 py-1 font-black text-[10px] uppercase tracking-widest"
                >
                  {res.category?.name || "Global Dish"}
                </Badge>
                <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                  {meal.name}
                </h1>
              </div>

              <p className="text-lg text-gray-400 font-medium leading-relaxed max-w-2xl">
                {meal.description ||
                  "A standard definition of this culinary masterpiece. Explore how different venues prepare their own unique interpretations."}
              </p>

              {/* Stats Bar (Like Admin) */}
              <div className="pt-8 border-t border-gray-100 flex flex-wrap items-center gap-8">
                <div>
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">
                    Market Avg
                  </span>
                  <span className="text-2xl font-black text-gray-900">
                    {res.avgPrice ? formatPrice(res.avgPrice) : "—"}
                  </span>
                </div>
                <div className="w-px h-8 bg-gray-100 hidden sm:block" />
                <div>
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">
                    Price Range
                  </span>
                  <div className="text-lg font-black text-gray-900">
                    {res.minPrice ? formatPrice(res.minPrice) : "—"}
                    <span className="mx-2 text-gray-200 font-medium text-sm">
                      /
                    </span>
                    {res.maxPrice ? formatPrice(res.maxPrice) : "—"}
                  </div>
                </div>
                <div className="w-px h-8 bg-gray-100 hidden sm:block" />
                <div>
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">
                    Citations
                  </span>
                  <span className="text-2xl font-black text-blue-600">
                    {restaurants.length} Spots
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-4">
                {meal.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-50 text-gray-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-gray-100"
                  >
                    # {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Visual Hero (Right - Smaller) */}
            <div className="w-full md:w-64 aspect-square rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white bg-gray-50 shrink-0 relative group">
              <img
                src={
                  preferredHeroImage ||
                  "https://placehold.co/600x600?text=Premium+Meal"
                }
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt={meal.name}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Market Comparison Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-24 sm:pb-32">
        <div className="flex flex-col sm:flex-row items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
              <Layers className="w-6 h-6" />
              <span className="text-xs font-black uppercase tracking-[0.3em]">
                Market Listings
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tighter uppercase">
              Compare Venues
            </h2>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
            {["Recommended", "Price Low"].map((opt) => (
              <button
                key={opt}
                className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 rounded-xl transition-all"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {restaurants.length > 0 ? (
            restaurants.map((rm: any) => (
              <Card
                key={rm.id}
                className="group overflow-hidden border-0 shadow-sm shadow-gray-200 hover:shadow-xl transition-all duration-300 rounded-3xl bg-white"
              >
                <div className="flex flex-col sm:flex-row relative h-auto sm:h-52">
                  {/* Compact Visual with Fade */}
                  <div className="relative w-full sm:w-[35%] h-48 sm:h-auto overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-transparent via-white/10 to-white z-10 pointer-events-none" />
                    <img
                      src={
                        rm.imageUrl ||
                        res.imageUrl ||
                        "https://placehold.co/600x400?text=Premium+Meal"
                      }
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      alt={rm.name}
                    />
                    {rm.portionSize && (
                      <div className="absolute top-4 left-4 z-20 px-3 h-6 bg-gray-900/80 backdrop-blur-md rounded-lg flex items-center justify-center text-white text-[8px] font-black uppercase tracking-widest shadow-xl">
                        {rm.portionSize}
                      </div>
                    )}
                  </div>

                  {/* Compact Content Area */}
                  <div className="flex-1 p-5 sm:p-6 relative z-20 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="inline-flex items-center text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1 truncate max-w-full">
                            <Store className="w-2.5 h-2.5 mr-1" />
                            {rm.restaurant?.name}
                          </div>
                          <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase leading-tight truncate group-hover:text-blue-600 transition-colors">
                            {rm.name}
                          </h3>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xl font-black text-green-600 tabular-nums">
                            {formatPrice(rm.price)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                        <div className="flex items-center">
                          <Navigation className="w-3 h-3 mr-1 text-gray-300" />
                          <span className="truncate max-w-[120px]">
                            {rm.restaurant?.location || "Addis Area"}
                          </span>
                        </div>
                        {rm.spicyLevel > 0 && (
                          <div className="flex items-center text-orange-600">
                            <Flame className="w-3 h-3 mr-1 fill-orange-500/20" />
                            Lev {rm.spicyLevel}
                          </div>
                        )}
                        <div
                          className={cn(
                            "px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest ",
                            rm.isAvailable
                              ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                              : "text-gray-400 bg-gray-50 border-gray-100",
                          )}
                        >
                          {rm.isAvailable ? "In Stock" : "Sold Out"}
                        </div>
                      </div>

                      {/* Ingredients chips (More Info) */}
                      {rm.ingredients && rm.ingredients.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {rm.ingredients.slice(0, 4).map((ing: string) => (
                            <span
                              key={ing}
                              className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded-md text-[8px] font-bold uppercase border border-gray-100"
                            >
                              {ing}
                            </span>
                          ))}
                          {rm.ingredients.length > 4 && (
                            <span className="text-[8px] text-gray-300 self-center">
                              +{rm.ingredients.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <Link href={`/restaurants/${rm.restaurantId}`}>
                        <Button className="w-full h-10 rounded-xl bg-gray-900 hover:bg-black font-black text-[9px] uppercase tracking-[0.2em] shadow-lg shadow-gray-100 transition-all hover:scale-[1.02]">
                          Visit Venue
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-32 text-center bg-white border-2 border-dashed border-gray-100 rounded-[3rem]">
              <h3 className="text-xl font-bold text-gray-300 uppercase tracking-widest">
                No Active Market Listings
              </h3>
              <p className="mt-2 text-gray-400">
                Try searching for other culinary concepts.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Global Meal Stats Bento */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-200">
            <TrendingUp className="w-8 h-8 mb-6 text-blue-200" />
            <h4 className="text-sm font-black uppercase tracking-widest text-blue-100 mb-2">
              Market Stability
            </h4>
            <p className="text-3xl font-black tracking-tight uppercase">
              High Demand
            </p>
            <p className="mt-4 text-blue-100/70 text-sm font-medium">
              Currently indexed across {restaurants.length} major districts in
              Addis Ababa.
            </p>
          </div>
          <div className="md:col-span-2 bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-gray-200 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-6">
                Culinary Perspective
              </h4>
              <p className="text-2xl font-black tracking-tight leading-relaxed text-gray-200 italic uppercase">
                &quot;A global staple representing{" "}
                {res.category?.name || "various"} culinary traditions, usually
                priced between{" "}
                {res.minPrice ? formatPrice(res.minPrice) : "ETB 100"} and{" "}
                {res.maxPrice ? formatPrice(res.maxPrice) : "ETB 1000"}.&quot;
              </p>
            </div>
            <div className="mt-8 flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              ZMenu Analytics Ver {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
