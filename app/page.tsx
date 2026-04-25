export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Counter,
} from "@/components/ui";
import {
  Search,
  MapPin,
  Utensils,
  Star,
  TrendingUp,
  ChevronRight,
  Globe,
  Layers,
} from "lucide-react";
import { RestaurantService } from "@/services/restaurant/restaurant.service";
import { getPublicStats } from "./admin/dashboard-data";

export default async function HomePage() {
  const [result, stats] = await Promise.all([
    // Only fetch 3 featured restaurants for the hero section
    RestaurantService.getFeaturedRestaurants(3), 
    getPublicStats(),
  ]);
  const restaurants = result.success ? result.data || [] : [];

  return (
    <div className="flex-1 bg-white">
      {/* Immersive Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-white">
        {/* Premium Background Blooms */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10 text-center lg:text-left">
              <div className="inline-flex items-center space-x-3 px-4 py-2 bg-blue-50/50 backdrop-blur-md rounded-2xl border border-blue-100 text-blue-600 shadow-sm">
                <TrendingUp className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  The Future of Dining in Addis
                </span>
              </div>

              <h1 className="text-6xl sm:text-8xl md:text-9xl font-black text-gray-900 tracking-tighter leading-[0.8] uppercase">
                Explore <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
                  Taste.
                </span>
              </h1>

              <p className="max-w-xl text-xl text-gray-400 font-medium leading-relaxed mx-auto lg:mx-0">
                A curated directory surfacing the authentic menus, real prices,
                and hidden gems of the city. No more outdated PDF menus.
              </p>

              {/* Dynamic Stats Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-8">
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                    <Counter value={stats.publishedRestaurants} />+
                  </span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                    Live Venues
                  </span>
                </div>
                <div className="w-px h-10 bg-gray-100 hidden sm:block" />
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                    <Counter value={stats.foodListings} />+
                  </span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                    Unique Meals
                  </span>
                </div>
                <div className="w-px h-10 bg-gray-100 hidden sm:block" />
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                    <Counter value={stats.drinkListings} />+
                  </span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                    Drink Options
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                <Link href="/search">
                  <Button className="h-16 px-10 rounded-2xl bg-gray-900 hover:bg-blue-600 font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 transition-all hover:scale-105">
                    Search for your meal
                  </Button>
                </Link>
                <Link
                  href="/restaurants"
                  className="group flex items-center text-xs font-black uppercase tracking-[0.3em] text-gray-400 hover:text-blue-600 transition-colors"
                >
                  Where to Eat{" "}
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Decorative Bento Hero element */}
            <div className="hidden lg:grid grid-cols-2 gap-6 relative">
              <div className="bg-gray-50 rounded-[3rem] aspect-[4/5] mt-12 overflow-hidden border-8 border-white shadow-2xl relative group">
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
                  className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                  alt="Restaurant Interior"
                />
                <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-transparent transition-colors" />
              </div>
              <div className="space-y-6">
                <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200 aspect-square flex flex-col justify-end">
                  <Utensils className="w-8 h-8 mb-4 text-blue-200" />
                  <h4 className="text-4xl font-black tracking-tighter uppercase leading-none">
                    Real <br /> Menus.
                  </h4>
                </div>
                <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-gray-200 aspect-[4/5] overflow-hidden relative group">
                  <img
                    src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80"
                    className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity"
                    alt="Food"
                  />
                  <div className="relative z-10 h-full flex flex-col justify-end">
                    <Star className="w-8 h-8 mb-4 text-orange-400 fill-orange-400" />
                    <h4 className="text-3xl font-black tracking-tighter uppercase leading-none">
                      Curated <br /> Experts.
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Partners */}
      <section className="py-32 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4 block">
                Hand Picked
              </span>
              <h2 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                Featured <span className="text-gray-300 italic">Venues.</span>
              </h2>
            </div>
            <Link href="/restaurants">
              <Button
                variant="outline"
                className="h-14 px-8 rounded-2xl border-2 border-gray-200 font-black text-[10px] uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all"
              >
                Full Collection
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {restaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                href={`/restaurants/${restaurant.id}`}
                className="group"
              >
                <Card className="overflow-hidden border-0 bg-transparent shadow-none group-hover:-translate-y-2 transition-transform duration-500">
                  <div className="relative h-[450px] rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl shadow-gray-200 transition-all group-hover:shadow-blue-100 group-hover:border-blue-50">
                    <img
                      src={
                        restaurant.logoUrl ||
                        "https://placehold.co/600x800?text=ZDish"
                      }
                      alt={restaurant.name || "Restaurant"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />

                    <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                          {restaurant.name}
                        </h3>
                        <div className="flex items-center text-[10px] font-black text-blue-300 uppercase tracking-widest">
                          <MapPin className="w-3 h-3 mr-1.5" />{" "}
                          {restaurant.location || "Addis Ababa"}
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                        <ChevronRight className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition Bento */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8 bg-gray-900 rounded-[3rem] p-12 sm:p-20 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600 rounded-full blur-[100px] opacity-20 -mr-40 -mt-40 group-hover:opacity-30 transition-opacity duration-700" />
              <Globe className="w-12 h-12 mb-8 text-blue-500" />
              <h3 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase leading-[0.9] mb-8">
                The Modern <br /> Standard for <br />{" "}
                <span className="text-blue-500">Discoverability.</span>
              </h3>
              <p className="max-w-md text-gray-400 font-medium text-lg leading-relaxed">
                We bridge the gap between hungry diners and culinary artisans
                with a data-first approach to menus. No more blurry photos or
                outdated prices.
              </p>
            </div>

            <div className="md:col-span-4 space-y-8">
              <div className="bg-blue-600 rounded-[3rem] p-12 text-white shadow-2xl shadow-blue-200 h-full flex flex-col justify-between">
                <Layers className="w-10 h-10 mb-8 text-blue-200" />
                <div>
                  <h4 className="text-3xl font-black tracking-tighter uppercase mb-2">
                    Market <br /> Insights.
                  </h4>
                  <p className="text-blue-100 font-bold text-sm tracking-tight">
                    Real-time cross-venue comparisons in seconds.
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                {
                  icon: <MapPin />,
                  label: "Geo Verified",
                  sub: "100% Locations",
                },
                { icon: <Search />, label: "Smart Query", sub: "Meal Focused" },
                {
                  icon: <CircleDot />,
                  label: "Live Stats",
                  sub: (
                    <>
                      <Counter value={stats.totalRestaurantMeals} /> Active Items
                    </>
                  ),
                },
                {
                  icon: <TrendingUp />,
                  label: "Trending",
                  sub: "Popular Cuisines",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 border border-gray-100 italic">
                    {item.icon}
                  </div>
                  <h5 className="font-black text-gray-900 uppercase tracking-tighter leading-none mb-1">
                    {item.label}
                  </h5>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {item.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Support components (placeholder for icons used)
function CircleDot({ className }: { className?: string }) {
  return (
    <div
      className={`w-2 h-2 rounded-full border-2 border-current ${className}`}
    />
  );
}
