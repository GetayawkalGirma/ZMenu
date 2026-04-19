import { RestaurantService } from "@/services/restaurant/restaurant.service";
import { RestaurantMenuService } from "@/services/menu-item/menu-item.service";
import { 
  Badge, 
  Button, 
} from "@/components/ui";
import { 
  MapPin, 
  Globe, 
  Info, 
  ArrowLeft,
  Navigation,
  Utensils,
  LayoutGrid,
} from "lucide-react";
import Link from "next/link";
import { RestaurantFeaturesView } from "@/components/restaurant/RestaurantFeaturesView";
import { RestaurantMenuFilters } from "@/components/search/RestaurantMenuFilters";
import { RestaurantMenuInfinite } from "@/components/restaurant/RestaurantMenuInfinite";
import { Suspense } from "react";

export const revalidate = 0; // Disable static caching for real-time filters

async function MenuList({ 
  restaurantId, 
  searchParams, 
  restaurant 
}: { 
  restaurantId: string; 
  searchParams: any;
  restaurant: any;
}) {
  const params = await searchParams;
  const categories = params.categories?.split(",").filter(Boolean);
  const search = params.search;
  const dietary = params.dietary;
  const sortBy = params.sortBy;
  const spicy = params.spicy ? parseInt(params.spicy as string) : undefined;
  const minPrice = params.minPrice ? parseFloat(params.minPrice as string) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice as string) : undefined;

  const result = await RestaurantMenuService.getRestaurantMenu({
    restaurantId,
    page: 1,
    pageSize: 12,
    search,
    dietaryCategory: dietary,
    categoryNames: categories,
    sortBy,
    spicyLevel: spicy,
    minPrice,
    maxPrice,
  });

  return (
    <RestaurantMenuInfinite 
      restaurantId={restaurantId}
      initialItems={result.items}
      initialTotal={result.total}
      restaurant={restaurant}
    />
  );
}

export default async function PublicRestaurantDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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

  // Directions logic: Extract URL from iframe if present, otherwise construct from name/location
  let directionsUrl = "";
  const isIframe = restaurant.geoLocation?.includes("<iframe");
  
  if (isIframe) {
    // Try to extract src from iframe
    const srcMatch = restaurant.geoLocation.match(/src="([^"]+)"/);
    if (srcMatch && srcMatch[1]) {
        // If it's a google maps embed, we can transform it or just use the query-based directions which is more reliable
        const query = encodeURIComponent(`${restaurant.name} ${restaurant.location || ""}`.trim());
        directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
    }
  } else if (restaurant.geoLocation && restaurant.geoLocation.startsWith("http")) {
    directionsUrl = restaurant.geoLocation;
  }
  
  // Final fallback if we still don't have a good directions URL
  if (!directionsUrl) {
    const query = encodeURIComponent(`${restaurant.name} ${restaurant.location || ""}`.trim());
    directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Immersive Header Banner */}
      <div className="relative h-[40vh] sm:h-[64vh] w-full bg-gray-900 overflow-hidden">
        <img 
          src={restaurant.logoUrl || "https://placehold.co/1200x600?text=ZMenu"} 
          className="w-full h-full object-cover opacity-60 scale-105 blur-sm"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-black/20" />
        
        <div className="absolute bottom-0 left-0 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-16 text-center sm:text-left">
            <Link href="/restaurants" className="inline-flex items-center text-[8px] sm:text-xs font-black uppercase tracking-widest text-gray-700 hover:text-blue-600 transition-colors mb-6 sm:mb-12 bg-white/80 backdrop-blur-md px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-xl">
               <ArrowLeft className="w-3 sm:w-4 h-3 sm:h-4 mr-2" /> Back
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-12">
               <div className="space-y-2 sm:space-y-4">
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                     <div className="px-3 sm:px-4 py-1 sm:py-1.5 bg-blue-600 text-white text-[7px] sm:text-[9px] font-black rounded-full uppercase tracking-[0.2em] shadow-2xl shadow-blue-400">
                        {restaurant.status === 'PUBLISHED' ? 'Verified Partner' : 'Community Seeded'}
                     </div>
                  </div>
                  <h1 className="text-4xl sm:text-8xl font-black text-gray-900 tracking-tighter leading-none uppercase">
                     {restaurant.name}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 pt-1 sm:pt-2">
                     <div className="flex items-center text-gray-500 font-bold uppercase tracking-tight text-[10px] sm:text-sm">
                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-blue-600" />
                        {restaurant.location || "Addis Ababa"}
                     </div>
                     <div className="flex items-center text-gray-500 font-bold uppercase tracking-tight text-[10px] sm:text-sm">
                        <Utensils className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-blue-600" />
                        {restaurant.mealCount || 0} Meals
                     </div>
                  </div>
               </div>

               <a 
                 href={directionsUrl} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center justify-center bg-gray-900 text-white px-6 sm:px-8 h-12 sm:h-16 rounded-xl sm:rounded-[2rem] font-black uppercase tracking-[0.1em] text-[10px] sm:text-xs hover:bg-blue-600 hover:scale-105 transition-all shadow-2xl shadow-gray-200"
               >
                 <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 sm:mr-3" /> Directions
               </a>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Grid Split */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-10 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-20">
          
          {/* Main Discovery Content */}
          <div className="lg:col-span-8 space-y-12 sm:space-y-24">
            
            {/* Visual Menu Section */}
            <section id="menu">
              <div className="flex items-center justify-between mb-8 sm:mb-12 border-b border-gray-100 pb-4 sm:pb-8">
                 <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tighter uppercase flex items-center gap-2 sm:gap-4">
                    <LayoutGrid className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                    Menu
                 </h2>
                 
                 {/* Mobile Filter Trigger */}
                 <div className="lg:hidden">
                    <RestaurantMenuFilters 
                       trigger={
                         <Button variant="outline" className="h-10 rounded-xl px-4 border-gray-100 font-black uppercase text-[8px] tracking-widest flex items-center gap-2">
                            <Utensils className="w-3 h-3" /> Filter Menu
                         </Button>
                       }
                    />
                 </div>
              </div>

              <Suspense fallback={<div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-8">
                {Array.from({length: 8}).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-gray-50 animate-pulse rounded-2xl" />
                ))}
              </div>}>
                 <MenuList restaurantId={id} searchParams={searchParams} restaurant={restaurant} />
              </Suspense>
            </section>

             {/* Dynamic Embed for Location */}
            {restaurant.geoLocation?.includes("<iframe") && (
              <section className="space-y-6 sm:space-y-8">
                 <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tighter uppercase flex items-center gap-2 sm:gap-4">
                    <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
                    Locate
                 </h2>
                 <div className="w-full h-[300px] sm:h-[500px] rounded-2xl sm:rounded-[3rem] overflow-hidden shadow-2xl shadow-indigo-100 border-4 sm:border-8 border-white p-0">
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
          <div className="lg:col-span-4 space-y-8 sm:space-y-12">
            
            {/* Live Menu Filters */}
            <div className="hidden lg:block">
               <RestaurantMenuFilters />
            </div>

            {/* Aesthetic Identity Card */}
            <div className="bg-gray-900 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 text-white shadow-2xl shadow-blue-200/40 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-blue-600/20 rounded-full blur-[40px] sm:blur-[80px] -mr-16 -mt-16 sm:-mr-32 sm:-mt-32 group-hover:bg-blue-600/30 transition-all duration-700" />
               
               <div className="relative z-10 space-y-6 sm:space-y-8">
                  <div className="space-y-1 sm:space-y-2">
                     <span className="text-[8px] sm:text-[10px] font-black text-blue-400 uppercase tracking-widest">About</span>
                     <h3 className="text-xl sm:text-3xl font-black tracking-tighter leading-tight uppercase">Venue Identity</h3>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-6">
                     <div className="flex items-center justify-between py-2 sm:py-4 border-b border-white/5">
                        <span className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rating</span>
                        <span className="text-sm sm:text-xl font-black text-white">⭐ {restaurant.rating || "4.5"}/5</span>
                     </div>
                     <div className="flex items-center justify-between py-2 sm:py-4 border-b border-white/5">
                        <span className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Noise</span>
                        <span className="text-[10px] sm:text-sm font-black text-blue-400 uppercase tracking-widest leading-none">{restaurant.noiselevel || "Quiet"}</span>
                     </div>
                  </div>

                  <div className="pt-2 sm:pt-4">
                     <div className="p-4 sm:p-6 bg-white/5 rounded-xl sm:rounded-[2rem] border border-white/10 backdrop-blur-sm">
                        <p className="text-[10px] sm:text-sm text-gray-300 font-medium leading-relaxed italic">
                           &quot;A quintessential spot for food enthusiasts seeking authentic flavors.&quot;
                        </p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Features (View Only) */}
            <section className="space-y-4 sm:space-y-6">
               <h3 className="text-[8px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.3em] px-2 mb-2 sm:mb-4">Features</h3>
               <div className="px-2">
                  <RestaurantFeaturesView restaurantId={id} />
               </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
