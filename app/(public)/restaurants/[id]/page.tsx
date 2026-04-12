import { RestaurantService } from "@/services/restaurant/restaurant.service";
import { 
  Badge, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui";
import { 
  MapPin, 
  Clock, 
  Globe, 
  Info, 
  ChefHat, 
  ArrowLeft,
  Navigation,
  Utensils,
  LayoutGrid,
  Leaf,
  GlassWater,
  IceCream,
  Beef,
  Flame,
  Droplets,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { RestaurantFeaturesView } from "@/components/restaurant/RestaurantFeaturesView";
import { RestaurantMenuFilters } from "@/components/search/RestaurantMenuFilters";
import { PortionSize } from "@/lib/types/meal";
import { formatPrice } from "@/lib/utils";

export default async function PublicRestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await RestaurantService.getRestaurantById(id);

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-8">
           <Info className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">NotFound</h1>
        <p className="mt-4 text-gray-400 font-medium">This culinary destination has moved or doesn&apos;t exist.</p>
        <Link href="/restaurants" className="mt-12">
          <Button variant="outline" className="rounded-2xl px-10 h-14 font-black uppercase tracking-widest text-[10px]">
             Back to Directory
          </Button>
        </Link>
      </div>
    );
  }

  const restaurant = result.data as any;
  const menuItems = restaurant.menuItems || [];

  return (
    <div className="bg-white min-h-screen">
      {/* Immersive Header Banner */}
      <div className="relative h-[60vh] w-full bg-gray-900 overflow-hidden">
        <img 
          src={restaurant.logoUrl || "https://placehold.co/1200x600?text=ZMenu"} 
          className="w-full h-full object-cover opacity-60 scale-105 blur-sm"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-black/20" />
        
        <div className="absolute bottom-0 left-0 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <Link href="/restaurants" className="inline-flex items-center text-xs font-black uppercase tracking-widest text-gray-700 hover:text-blue-600 transition-colors mb-12 bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl">
               <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
               <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                     <div className="px-4 py-1.5 bg-blue-600 text-white text-[9px] font-black rounded-full uppercase tracking-[0.2em] shadow-2xl shadow-blue-400">
                        {restaurant.status === 'PUBLISHED' ? 'Verified Partner' : 'Community Seeded'}
                     </div>
                  </div>
                  <h1 className="text-6xl sm:text-8xl font-black text-gray-900 tracking-tighter leading-none uppercase">
                     {restaurant.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-6 pt-2">
                     <div className="flex items-center text-gray-500 font-bold uppercase tracking-tight text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                        {restaurant.location || "Addis Ababa"}
                     </div>
                     <div className="flex items-center text-gray-500 font-bold uppercase tracking-tight text-sm">
                        <Utensils className="w-4 h-4 mr-2 text-blue-600" />
                        {menuItems.length} Meals Indexed
                     </div>
                  </div>
               </div>

               {restaurant.geoLocation && (
                 <a 
                   href={restaurant.geoLocation} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center bg-gray-900 text-white px-8 h-16 rounded-[2rem] font-black uppercase tracking-[0.1em] text-xs hover:bg-blue-600 hover:scale-105 transition-all shadow-2xl shadow-gray-200"
                 >
                   <Navigation className="w-4 h-4 mr-3" /> Get Directions
                 </a>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Grid Split */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          
          {/* Main Discovery Content */}
          <div className="lg:col-span-8 space-y-24">
            
            {/* Visual Menu Section */}
            <section id="menu">
              <div className="flex items-center justify-between mb-12 border-b border-gray-100 pb-8">
                 <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase flex items-center gap-4">
                    <LayoutGrid className="w-8 h-8 text-blue-600" />
                    Live Menu
                 </h2>
                 <div className="hidden sm:flex space-x-2">
                    {["All", "Popular", "New"].map(filter => (
                      <button key={filter} className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 rounded-xl transition-all">
                        {filter}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {menuItems.length > 0 ? (
                  menuItems.map((rm: any) => (
                  <Card key={rm.id} className="group overflow-hidden border-0 shadow-sm shadow-gray-200 hover:shadow-xl transition-all duration-300 rounded-3xl bg-white flex flex-col h-full">
                    <div className="relative h-48 sm:h-56 overflow-hidden">
                       <img 
                         src={rm.imageUrl || (rm.menuItem?.image ? `/api/files/download/${rm.menuItem.image.path}` : "https://placehold.co/600x400?text=No+Photo")} 
                         className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-700" 
                         alt={rm.name}
                       />
                         <div className="absolute top-4 right-4 h-10 px-4 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl font-black text-blue-600 text-sm tracking-tighter border border-white/40">
                            {formatPrice(rm.price)}
                         </div>
                      </div>
                      <div className="p-8 flex flex-col flex-1">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-2">
                                {(() => {
                                   const cat = (rm.menuItem?.category?.name || "").toLowerCase();
                                   if (cat.includes('drink')) return <GlassWater className="w-3.5 h-3.5 text-blue-500" />;
                                   if (cat.includes('dessert') || cat.includes('sweet')) return <IceCream className="w-3.5 h-3.5 text-pink-500" />;
                                   return <Utensils className="w-3.5 h-3.5 text-gray-400" />;
                                })()}
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">
                                   {rm.menuItem?.category?.name || "Premium Dish"}
                                </span>
                             </div>
                             {rm.dietaryCategory === "YETSOM" ? (
                                <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-lg px-2 py-0.5 text-[8px] font-black uppercase flex items-center gap-1">
                                   <Leaf className="w-2.5 h-2.5" /> Fasting
                                </Badge>
                             ) : (
                                <Badge className="bg-red-50 text-red-500 border-none rounded-lg px-2 py-0.5 text-[8px] font-black uppercase flex items-center gap-1">
                                   <Beef className="w-2.5 h-2.5 text-red-500" /> Meat
                                </Badge>
                             )}
                          </div>

                          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter group-hover:text-blue-600 transition-colors leading-tight">
                            {rm.name}
                          </h3>
                          <p className="text-xs text-gray-400 font-medium line-clamp-2 leading-relaxed">
                            {rm.description || "The finest selection from their culinary team."}
                          </p>

                          {(rm.menuItem?.spicyLevel > 0 || rm.spicyLevel > 0) && (
                            <div className="flex items-center text-orange-600 text-[10px] font-bold uppercase tracking-tight">
                               <Flame className="w-3.5 h-3.5 mr-1 text-orange-500" />
                               Spicy Level {rm.menuItem?.spicyLevel || rm.spicyLevel}
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                           <div className="flex items-center space-x-4">
                              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center">
                                 <Clock className="w-3 h-3 mr-1" /> 25m
                              </span>
                              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center">
                                 <ChefHat className="w-3 h-3 mr-1" /> {rm.portionSize || "1P"}
                              </span>
                           </div>
                           <Link href={`/meals/${rm.menuItem?.id || rm.id}`}>
                              <Button variant="ghost" className="h-10 px-0 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-transparent hover:text-gray-900 group-hover:translate-x-1 transition-all">
                                 Info
                                 <ChevronRight className="w-3 h-3 ml-1" />
                              </Button>
                           </Link>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100 italic font-medium text-gray-400">
                    No menu items have been indexed for this location yet.
                  </div>
                )}
              </div>
            </section>

             {/* Dynamic Embed for Location */}
            {restaurant.geoLocation?.includes("<iframe") && (
              <section className="space-y-8">
                 <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase flex items-center gap-4">
                    <Globe className="w-8 h-8 text-indigo-600" />
                    Find the spot
                 </h2>
                 <div className="w-full h-[500px] rounded-[3rem] overflow-hidden shadow-2xl shadow-indigo-100 border-8 border-white p-0">
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: restaurant.geoLocation.replace(/width="\d+"/, 'width="100%"').replace(/height="\d+"/, 'height="100%"') 
                      }} 
                      className="w-full h-full [&>iframe]:border-none"
                    />
                 </div>
              </section>
            )}
          </div>

          {/* Premium Sidebar Info */}
          <div className="lg:col-span-4 space-y-12">
            
            {/* Live Menu Filters */}
            <RestaurantMenuFilters />

            {/* Aesthetic Identity Card */}
            <div className="bg-gray-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-blue-200/40 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-blue-600/30 transition-all duration-700" />
               
               <div className="relative z-10 space-y-8">
                  <div className="space-y-2">
                     <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">About</span>
                     <h3 className="text-3xl font-black tracking-tighter leading-tight uppercase">Culinary Identity</h3>
                  </div>
                  
                  <div className="space-y-6">
                     <div className="flex items-center justify-between py-4 border-b border-white/5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rating</span>
                        <span className="text-xl font-black text-white">⭐ {restaurant.rating || "4.5"}/5</span>
                     </div>
                     <div className="flex items-center justify-between py-4 border-b border-white/5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Noise</span>
                        <span className="text-sm font-black text-blue-400 uppercase tracking-widest leading-none">{restaurant.noiselevel || "Quiet"}</span>
                     </div>
                     <div className="flex items-center justify-between py-4 border-b border-white/5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Privacy</span>
                        <span className="text-sm font-black text-indigo-400 uppercase tracking-widest leading-none">{restaurant.privacylevel || "Standard"}</span>
                     </div>
                  </div>

                  <div className="pt-4">
                     <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-sm">
                        <p className="text-sm text-gray-300 font-medium leading-relaxed italic">
                           &quot;A quintessential spot for food enthusiasts looking for authentic flavors and consistent pricing.&quot;
                        </p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Features (View Only) */}
            <section className="space-y-6">
               <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] px-2 mb-4">Venue Features</h3>
               <div className="px-2">
                  <RestaurantFeaturesView restaurantId={restaurant.id} />
               </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
