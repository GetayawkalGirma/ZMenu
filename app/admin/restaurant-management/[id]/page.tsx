import { getRestaurant } from "../actions";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from "@/components/ui";
import { RestaurantFeaturesView } from "@/components/restaurant/RestaurantFeaturesView";
import { RestaurantStatusToggle } from "@/components/restaurant/RestaurantStatusToggle";
import Link from "next/link";
import { Eye, EyeOff, MapPin, Star, Volume2, ShieldCheck, Clock, Crosshair, Utensils } from "lucide-react";
import { CalculateCoordinatesButton } from "@/components/restaurant/CalculateCoordinatesButton";
import { cn } from "@/lib/utils";

export default async function RestaurantViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getRestaurant(id);

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Restaurant Not Found
              </h1>
              <p className="text-gray-600 mb-8">
                The restaurant you're looking for doesn't exist.
              </p>
              <Link href="/admin/restaurant-management">
                <Button>Back to Restaurants</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const restaurant = result.data;
  const isPublished = restaurant.status === "PUBLISHED";

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          {/* Header */}
          <div className="mb-6 sm:mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
                {restaurant.logoUrl ? (
                    <img
                        src={restaurant.logoUrl}
                        alt="Logo"
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-gray-100 shadow-sm"
                    />
                ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-gray-300">
                        <MapPin className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                )}
                <div className="space-y-1 sm:space-y-2">
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                        <h1 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tighter uppercase">
                            {restaurant.name || "Unnamed Restaurant"}
                        </h1>
                        <Badge className={cn(
                            "px-3 py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest border-0",
                            isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        )}>
                            {isPublished ? <Eye className="w-3 h-3 mr-1.5 inline" /> : <EyeOff className="w-3 h-3 mr-1.5 inline" />}
                            {restaurant.status}
                        </Badge>
                    </div>
                    <p className="text-xs sm:text-gray-400 font-medium flex items-center justify-center sm:justify-start gap-1.5 italic">
                        <MapPin className="w-3.5 h-3.5" />
                        {restaurant.location || "Location not set"}
                    </p>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full lg:w-auto">
              <Link href={`/admin/restaurant-management/${restaurant.id}/menu`} className="w-full lg:flex-none order-2 sm:order-1">
                <Button variant="outline" className="w-full h-10 sm:h-11 px-4 sm:px-6 rounded-xl font-black uppercase tracking-widest text-[8px] sm:text-[10px] border-gray-100 hover:bg-gray-50 flex items-center justify-center gap-2">
                    <Utensils className="w-3.5 h-3.5" />
                    View Menu
                </Button>
              </Link>
              <Link href={`/admin/restaurant-management/${restaurant.id}/edit`} className="w-full lg:flex-none order-1 sm:order-2">
                <Button className="w-full h-10 sm:h-11 px-4 sm:px-6 rounded-xl font-black uppercase tracking-widest text-[8px] sm:text-[10px] bg-gray-900 hover:bg-black text-white shadow-xl shadow-gray-100">
                    Edit Details
                </Button>
              </Link>
              <Link href="/admin/restaurant-management" className="w-full lg:flex-none order-3">
                <Button variant="outline" className="w-full h-10 sm:h-11 px-4 sm:px-6 rounded-xl font-black uppercase tracking-widest text-[8px] sm:text-[10px] border-gray-100 hover:bg-gray-50">
                    All Venues
                </Button>
              </Link>
            </div>
          </div>

          {/* Restaurant Details */}
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <Card className="rounded-2xl sm:rounded-[2.5rem] border-gray-100 shadow-sm overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 sm:px-8 py-4 sm:py-6">
                  <CardTitle className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-gray-400">Core Attributes</CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-8 grid grid-cols-2 sm:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-1 sm:space-y-2">
                    <h3 className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400">Current Rating</h3>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-50 rounded-lg sm:rounded-xl flex items-center justify-center text-yellow-600">
                            <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                        </div>
                        <p className="text-base sm:text-2xl font-black text-gray-900">{restaurant.rating ? `${restaurant.rating}/5` : "N/A"}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Acoustics</h3>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <Volume2 className="w-5 h-5" />
                        </div>
                        <p className="text-xl font-bold text-gray-900 capitalize">{restaurant.noiselevel || "Moderate"}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Privacy Setting</h3>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <p className="text-xl font-bold text-gray-900 capitalize">{restaurant.privacylevel || "Public"}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Registered Since</h3>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <Clock className="w-5 h-5" />
                        </div>
                        <p className="text-xl font-bold text-gray-900">
                            {new Date(restaurant.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                  </div>

                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Menu Composition</h3>
                    <Link href={`/admin/restaurant-management/${restaurant.id}/menu`}>
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                <Utensils className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">View Menu</p>
                                <p className="text-[10px] text-gray-400 font-medium italic">Click to see all items</p>
                            </div>
                        </div>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Restaurant Features */}
              <div className="rounded-2xl sm:rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm bg-white">
                <RestaurantFeaturesView restaurantId={restaurant.id} />
              </div>

              {/* Map View */}
              {restaurant.geoLocation?.includes("<iframe") && (
                <Card className="overflow-hidden shadow-sm border-gray-100 rounded-2xl sm:rounded-[2.5rem]">
                  <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 sm:px-8 py-4 sm:py-6">
                    <CardTitle className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Spatial Coordinates
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: restaurant.geoLocation.replace(/width="\d+"/, 'width="100%"').replace(/height="\d+"/, 'height="450"') 
                      }} 
                      className="w-full h-[300px] sm:h-[450px] [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-none grayscale contrast-125"
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6 sm:space-y-8">
              <Card className="rounded-2xl sm:rounded-[2.5rem] border-gray-100 shadow-sm overflow-hidden bg-white">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 sm:px-8 py-4 sm:py-6">
                  <CardTitle className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-gray-400">Visibility Console</CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-8 space-y-4">
                  <div className={cn(
                      "p-4 rounded-xl border text-center space-y-1 sm:space-y-2",
                      isPublished ? "bg-green-50/50 border-green-100" : "bg-yellow-50/50 border-yellow-100"
                  )}>
                      <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400">Current Status</p>
                      <p className={cn(
                          "text-xl sm:text-2xl font-black uppercase tracking-tighter",
                          isPublished ? "text-green-600" : "text-yellow-600"
                      )}>{restaurant.status}</p>
                  </div>
                  
                  <RestaurantStatusToggle id={restaurant.id} currentStatus={restaurant.status} />
                  
                  <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium text-center px-2 sm:px-4 leading-relaxed italic">
                      {isPublished 
                        ? "This restaurant is live on the platform. Any changes are immediately visible." 
                        : "Only administrators can see this restaurant. Publish it to make it visible to users."}
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl sm:rounded-[2.5rem] border-gray-100 shadow-sm overflow-hidden bg-white">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 sm:px-8 py-4 sm:py-6">
                  <CardTitle className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                    <Crosshair className="w-4 h-4" />
                    Geospatial Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-gray-300 block mb-1">Latitude</span>
                        <p className="text-xs font-bold text-gray-600">{restaurant.latitude?.toFixed(6) || "Pending"}</p>
                      </div>
                      <div>
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-gray-300 block mb-1">Longitude</span>
                        <p className="text-xs font-bold text-gray-600">{restaurant.longitude?.toFixed(6) || "Pending"}</p>
                      </div>
                  </div>
                  
                  <CalculateCoordinatesButton id={restaurant.id} />
                  
                  <p className="text-[8px] sm:text-[9px] text-gray-400 font-medium text-center px-2 leading-relaxed italic">
                    Coordinates are extracted automatically from the iframe. Use the button above to manually re-sync.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl sm:rounded-[2.5rem] border-gray-100 shadow-sm overflow-hidden bg-white">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 sm:px-8 py-4 sm:py-6">
                  <CardTitle className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-gray-400">System Metadata</CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div>
                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-gray-300 block mb-1">Database Reference</span>
                    <p className="font-mono text-[9px] sm:text-[10px] text-gray-400 truncate">{restaurant.id}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-gray-300 block mb-1">Created At</span>
                        <p className="text-[10px] sm:text-xs font-bold text-gray-600">{new Date(restaurant.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-gray-300 block mb-1">Last Update</span>
                        <p className="text-[10px] sm:text-xs font-bold text-gray-600">{new Date(restaurant.updatedAt).toLocaleDateString()}</p>
                      </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
