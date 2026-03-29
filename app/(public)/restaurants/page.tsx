import Link from "next/link";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { RestaurantService } from "@/services/restaurant/restaurant.service";

export default async function RestaurantsPage() {
  const result = await RestaurantService.getAllRestaurants();
  const restaurants: any[] = result.success ? result.data || [] : [];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                Explore <span className="text-blue-600">Restaurants</span>
              </h1>
              <p className="mt-2 text-gray-600 font-medium max-w-lg">
                Discover the best dining spots and explore their detailed menus and exclusive offers.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search directory..."
                  className="pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-all"
                />
              </div>
              <Button size="lg" className="rounded-xl shadow-lg shadow-blue-100">Search</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurants Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {restaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurants.map((restaurant) => (
              <Card key={restaurant.id} className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl bg-white">
                <CardHeader className="p-0">
                  <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                    {restaurant.logoUrl ? (
                      <img 
                        src={restaurant.logoUrl} 
                        alt={restaurant.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <span className="text-4xl mb-2">🍽️</span>
                        <span className="text-xs font-bold uppercase tracking-widest">No Image</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      {restaurant.featureLabels?.includes('Luxury') && (
                        <span className="px-3 py-1 bg-black/80 backdrop-blur-md text-white text-[10px] font-black rounded-full uppercase tracking-tighter shadow-xl">
                          ✨ Luxury
                        </span>
                      )}
                      {restaurant.status === 'PUBLISHED' && (
                        <span className="px-3 py-1 bg-green-500 text-white text-[10px] font-black rounded-full uppercase tracking-tighter shadow-xl">
                          ● Open
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate">
                      {restaurant.name}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium flex items-center mt-1">
                      <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      {restaurant.location || "Location not specified"}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {restaurant.featureLabels?.slice(0, 3).map((label: string) => (
                      <span key={label} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md uppercase tracking-tight">
                        {label}
                      </span>
                    ))}
                    {restaurant.categories?.slice(0, 2).map((cat: string) => (
                      <span key={cat} className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md uppercase tracking-tight">
                        {cat}
                      </span>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                    <div>
                      <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Items</span>
                      <span className="text-lg font-black text-gray-900">{restaurant.mealCount || 0}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Avg Price</span>
                      <span className="text-lg font-black text-gray-900">
                        {restaurant.avgPrice > 0 ? `ETB ${Math.round(restaurant.avgPrice)}` : "—"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Link href={`/restaurants/${restaurant.id}`} className="flex-1">
                      <Button className="w-full h-11 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100">
                        View Menu
                      </Button>
                    </Link>
                    <Link href={`/restaurants/${restaurant.id}#meals`}>
                      <Button variant="outline" className="h-11 px-4 rounded-xl border-gray-200 hover:bg-gray-50 font-bold">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="text-6xl mb-6 grayscale opacity-20">🏙️</div>
            <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">No Restaurants Found</h3>
            <p className="text-gray-500 font-medium">We couldn't find any restaurants in the directory at the moment.</p>
            <Link href="/admin/restaurant-management/new" className="mt-8 inline-block">
              <Button variant="outline" className="rounded-xl px-8 h-12 font-black uppercase tracking-tight">Add Your First Restaurant</Button>
            </Link>
          </div>
        )}

        {/* Load More */}
        {restaurants.length > 0 && (
          <div className="text-center mt-16">
            <Button variant="outline" size="lg" className="rounded-xl px-12 h-14 font-black border-2 border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-600 transition-all uppercase tracking-widest text-xs">
              View All Directory Listings
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
