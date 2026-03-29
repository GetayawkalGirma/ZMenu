import { MenuItemService } from "@/services/menu-item/menu-item.service";
import { 
  Badge, 
  Button, 
  Card 
} from "@/components/ui";
import { 
  ArrowLeft, 
  Utensils, 
  Info,
  Layers,
  Store,
  Navigation,
  ChevronRight,
  TrendingUp,
  CircleDot
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

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
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Meal Missing</h1>
        <Link href="/search" className="mt-8">
          <Button variant="outline">Browse All Meals</Button>
        </Link>
      </div>
    );
  }

  // Cast for extended properties from service
  const res = meal as any;
  const restaurants = res.restaurants || [];

  return (
    <div className="bg-gray-50/50 min-h-screen">
      {/* Dynamic Header Section */}
      <section className="bg-white border-b border-gray-100 pt-12 pb-20 sm:pt-20 sm:pb-32 relative overflow-hidden">
        {/* Subtle Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-50/30 -skew-x-12 translate-x-32" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link href="/search" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-blue-600 transition-colors mb-12">
            <ArrowLeft className="w-3 h-3 mr-2" /> Back to Market
          </Link>

          <div className="flex flex-col lg:flex-row gap-16 items-start">
            {/* Visual Hero */}
            <div className="w-full lg:w-1/2 aspect-square max-w-[500px] rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border-8 border-white bg-gray-50 flex-shrink-0 relative group">
              <img 
                src={res.imageUrl || "https://placehold.co/800x800?text=Premium+Meal"} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                alt={meal.name}
              />
              <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40">
                 <div className="flex items-center justify-between">
                    <div>
                       <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">Market Avg</span>
                       <span className="text-2xl font-black text-gray-900">{res.avgPrice ? formatPrice(res.avgPrice) : "—"}</span>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Citations</span>
                       <span className="text-2xl font-black text-gray-900">{restaurants.length} Spots</span>
                    </div>
                 </div>
              </div>
            </div>

            {/* Insight Text */}
            <div className="flex-1 space-y-8 lg:pt-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none rounded-lg px-4 py-1 font-black text-[10px] uppercase tracking-widest">
                  {res.category?.name || "Global Dish"}
                </Badge>
                <h1 className="text-5xl sm:text-7xl font-black text-gray-900 tracking-tighter uppercase leading-[0.85]">
                  {meal.name}
                </h1>
              </div>

              <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-xl">
                {meal.description || "A standard definition of this culinary masterpiece. Explore how different venues prepare their own unique interpretations."}
              </p>

              <div className="flex flex-wrap gap-3">
                {meal.tags?.map(tag => (
                  <span key={tag} className="px-5 py-2 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-200/50">
                    # {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Comparison Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="flex flex-col sm:flex-row items-end justify-between mb-16 gap-8">
           <div className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600">
                 <Layers className="w-6 h-6" />
                 <span className="text-xs font-black uppercase tracking-[0.3em]">Market Listings</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tighter uppercase">Compare Venues</h2>
           </div>
           <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
              {["Lowest Price", "Rating"].map(opt => (
                <button key={opt} className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 rounded-xl transition-all">
                   {opt}
                </button>
              ))}
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {restaurants.length > 0 ? (
            restaurants.map((rm: any) => (
              <Card key={rm.id} className="group overflow-hidden border-0 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:shadow-blue-100/40 transition-all duration-500 rounded-[2.5rem] bg-white border-l-8 border-l-transparent hover:border-l-blue-600">
                <div className="flex flex-col sm:flex-row">
                   <div className="sm:w-1/3 aspect-square sm:aspect-auto overflow-hidden relative">
                      <img 
                        src={rm.imageUrl || res.imageUrl || "https://placehold.co/400x400?text=Meal"} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        alt=""
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
                   </div>
                   <div className="flex-1 p-8 sm:p-10 flex flex-col justify-between">
                      <div className="space-y-6">
                         <div className="flex justify-between items-start">
                            <div className="space-y-1">
                               <div className="flex items-center text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">
                                  <Store className="w-3 h-3 mr-2" /> 
                                  {rm.restaurant?.name}
                               </div>
                               <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                                  {rm.name}
                               </h3>
                            </div>
                            <div className="text-right">
                               <span className="block text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Serving Price</span>
                               <span className="text-2xl font-black text-green-600">{formatPrice(rm.price)}</span>
                            </div>
                         </div>
                         
                         <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
                            <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                               <Navigation className="w-3.5 h-3.5 mr-1.5 text-gray-300" />
                               {rm.restaurant?.location || "Area Unspecified"}
                            </div>
                            <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                               <CircleDot className="w-3.5 h-3.5 mr-1.5 text-gray-300" />
                               {rm.portionSize || "Standard"}
                            </div>
                         </div>
                      </div>

                      <div className="mt-8 flex gap-3">
                         <Link href={`/restaurants/${rm.restaurantId}`} className="flex-1">
                           <Button className="w-full h-12 rounded-2xl bg-gray-900 hover:bg-black font-black text-[10px] uppercase tracking-widest shadow-xl">
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
               <h3 className="text-xl font-bold text-gray-300 uppercase tracking-widest">No Active Market Listings</h3>
               <p className="mt-2 text-gray-400">Try searching for other culinary concepts.</p>
            </div>
          )}
        </div>
      </section>

      {/* Global Meal Stats Bento */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-200">
               <TrendingUp className="w-8 h-8 mb-6 text-blue-200" />
               <h4 className="text-sm font-black uppercase tracking-widest text-blue-100 mb-2">Market Stability</h4>
               <p className="text-3xl font-black tracking-tight uppercase">High Demand</p>
               <p className="mt-4 text-blue-100/70 text-sm font-medium">Currently indexed across {restaurants.length} major districts in Addis Ababa.</p>
            </div>
            <div className="md:col-span-2 bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-gray-200 flex flex-col justify-between">
               <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-6">Culinary Perspective</h4>
                  <p className="text-2xl font-black tracking-tight leading-relaxed text-gray-200 italic uppercase">
                    &quot;A global staple representing {res.category?.name || 'various'} culinary traditions, usually priced between {res.minPrice ? formatPrice(res.minPrice) : 'ETB 100'} and {res.maxPrice ? formatPrice(res.maxPrice) : 'ETB 1000'}.&quot;
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
