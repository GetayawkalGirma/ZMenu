import Link from "next/link";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";

// Mock data for demonstration
const restaurants = [
  {
    id: '1',
    name: 'The Garden Bistro',
    location: '123 Main St, Downtown',
    logoUrl: '/api/placeholder/200/200',
    features: {
      isLuxury: true,
      isGrabAndGo: false,
      noiseLevel: 'quiet',
      privacyLevel: 'semi_private'
    },
    mealCount: 24,
    avgPrice: 28.50,
    categories: ['breakfast', 'lunch', 'dinner']
  },
  {
    id: '2',
    name: 'Quick Bites Cafe',
    location: '456 Oak Ave, Midtown',
    logoUrl: '/api/placeholder/200/200',
    features: {
      isLuxury: false,
      isGrabAndGo: true,
      noiseLevel: 'moderate',
      privacyLevel: 'public'
    },
    mealCount: 18,
    avgPrice: 12.75,
    categories: ['breakfast', 'lunch', 'snack']
  },
  {
    id: '3',
    name: 'Sushi Paradise',
    location: '789 Pine Rd, Uptown',
    logoUrl: '/api/placeholder/200/200',
    features: {
      isLuxury: true,
      isGrabAndGo: false,
      noiseLevel: 'quiet',
      privacyLevel: 'private'
    },
    mealCount: 32,
    avgPrice: 45.00,
    categories: ['lunch', 'dinner']
  },
  {
    id: '4',
    name: 'Burger Haven',
    location: '321 Elm St, Westside',
    logoUrl: '/api/placeholder/200/200',
    features: {
      isLuxury: false,
      isGrabAndGo: true,
      noiseLevel: 'loud',
      privacyLevel: 'public'
    },
    mealCount: 15,
    avgPrice: 15.50,
    categories: ['lunch', 'dinner', 'snack']
  },
  {
    id: '5',
    name: 'Pasta Palace',
    location: '654 Maple Dr, Eastside',
    logoUrl: '/api/placeholder/200/200',
    features: {
      isLuxury: false,
      isGrabAndGo: false,
      noiseLevel: 'moderate',
      privacyLevel: 'semi_private'
    },
    mealCount: 28,
    avgPrice: 22.00,
    categories: ['lunch', 'dinner']
  },
  {
    id: '6',
    name: 'The Coffee Corner',
    location: '987 Cedar Ln, Downtown',
    logoUrl: '/api/placeholder/200/200',
    features: {
      isLuxury: false,
      isGrabAndGo: true,
      noiseLevel: 'quiet',
      privacyLevel: 'public'
    },
    mealCount: 12,
    avgPrice: 8.50,
    categories: ['breakfast', 'snack']
  }
];

export default function RestaurantsPage() {
  return (
    <div className="flex-1">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Restaurants</h1>
              <p className="mt-2 text-gray-600">
                Discover restaurants and explore their detailed menus
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search restaurants..."
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Features</option>
                <option value="luxury">Luxury Dining</option>
                <option value="grab-go">Grab & Go</option>
                <option value="quiet">Quiet Atmosphere</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurants Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-gray-400 text-lg">Restaurant Image</span>
                </div>
                <CardTitle className="text-xl">{restaurant.name}</CardTitle>
                <p className="text-gray-600">{restaurant.location}</p>
              </CardHeader>
              
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {restaurant.features.isLuxury && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      Luxury
                    </span>
                  )}
                  {restaurant.features.isGrabAndGo && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Grab & Go
                    </span>
                  )}
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                    {restaurant.features.noiseLevel}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full capitalize">
                    {restaurant.features.privacyLevel.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Meals Available:</span>
                    <span className="font-medium">{restaurant.mealCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Average Price:</span>
                    <span className="font-medium">${restaurant.avgPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Categories:</span>
                    <span className="font-medium">{restaurant.categories.join(', ')}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <Link href={`/restaurants/${restaurant.id}`}>
                    <Button size="sm">View Menu</Button>
                  </Link>
                  <Link href={`/restaurants/${restaurant.id}#meals`}>
                    <Button variant="outline" size="sm">
                      Browse Meals
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Restaurants
          </Button>
        </div>
      </div>
    </div>
  );
}
