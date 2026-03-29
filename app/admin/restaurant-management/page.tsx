import Link from "next/link";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import { getRestaurants } from "./actions";
import { RestaurantFeaturesView } from "@/components/restaurant/RestaurantFeaturesView";

// Fetch real data from server
async function fetchRestaurants() {
  const result = await getRestaurants();
  return result.success ? result.data : [];
}

export default async function RestaurantManagementPage() {
  const restaurants = await fetchRestaurants();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Restaurant Management
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your restaurants and their menus
              </p>
            </div>
            <Link href="/admin/restaurant-management/new">
              <Button>Add New Restaurant</Button>
            </Link>
          </div>

          {/* Restaurant List */}
          {restaurants && restaurants.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((restaurant) => (
                <Card
                  key={restaurant.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      {restaurant.logoUrl ? (
                        <img
                          src={restaurant.logoUrl}
                          alt={restaurant.name || "Restaurant"}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-2xl">🍽️</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {restaurant.name || "Unnamed Restaurant"}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          {restaurant.location || "No location"}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Created:{" "}
                        {new Date(restaurant.createdAt).toLocaleDateString()}
                      </div>
                      <div className="space-x-2">
                        <Link
                          href={`/admin/restaurant-management/${restaurant.id}/edit`}
                        >
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <Link
                          href={`/admin/restaurant-management/${restaurant.id}`}
                        >
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <div className="text-gray-400 text-5xl mb-4">🍽️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No restaurants yet
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Get started by adding your first restaurant
                  </p>
                  <Link href="/admin/restaurant-management/new">
                    <Button>Add Your First Restaurant</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
