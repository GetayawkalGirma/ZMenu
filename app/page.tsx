import Link from "next/link";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";

// Mock data for demonstration
const featuredRestaurants = [
  {
    id: "1",
    name: "The Garden Bistro",
    location: "123 Main St, Downtown",
    logoUrl: "/api/placeholder/200/200",
    features: {
      isLuxury: true,
      isGrabAndGo: false,
      noiseLevel: "quiet",
      privacyLevel: "semi_private",
    },
    mealCount: 24,
  },
  {
    id: "2",
    name: "Quick Bites Cafe",
    location: "456 Oak Ave, Midtown",
    logoUrl: "/api/placeholder/200/200",
    features: {
      isLuxury: false,
      isGrabAndGo: true,
      noiseLevel: "moderate",
      privacyLevel: "public",
    },
    mealCount: 18,
  },
  {
    id: "3",
    name: "Sushi Paradise",
    location: "789 Pine Rd, Uptown",
    logoUrl: "/api/placeholder/200/200",
    features: {
      isLuxury: true,
      isGrabAndGo: false,
      noiseLevel: "quiet",
      privacyLevel: "private",
    },
    mealCount: 32,
  },
];

export default function HomePage() {
  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Discover Your Next
              <span className="hunger-red"> Favorite Meal</span>
            </h1>
            <p className="mt-3 text-base text-gray-500 sm:mt-4 sm:text-xl lg:text-2xl">
              Browse restaurants, explore detailed menus, and find the perfect
              dish
            </p>
            <div className="mt-8 sm:mt-10">
              <Link href="/restaurants">
                <button className="cta-button text-white px-8 py-3 text-base font-medium rounded-md hover:shadow-lg transition-shadow">
                  Explore Restaurants
                </button>
              </Link>
              <Link href="/meals/search">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                >
                  Search Meals
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Restaurants
            </h2>
            <p className="text-lg text-gray-600">
              Explore popular restaurants and their diverse menus
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredRestaurants.map((restaurant) => (
              <Card
                key={restaurant.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-gray-400 text-lg">
                      Restaurant Image
                    </span>
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
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {restaurant.features.noiseLevel}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {restaurant.mealCount} meals available
                    </span>
                    <Link href={`/restaurants/${restaurant.id}`}>
                      <Button size="sm">View Menu</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/restaurants">
              <Button variant="outline" size="lg">
                View All Restaurants
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose ZMenu?
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about restaurant menus in one place
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">🍽️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Detailed Menus</h3>
              <p className="text-gray-600">
                Complete menu information with descriptions and categories
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Transparent Pricing
              </h3>
              <p className="text-gray-600">
                Clear pricing information and portion size details
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Search</h3>
              <p className="text-gray-600">
                Find exactly what you're looking for with smart filters
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
