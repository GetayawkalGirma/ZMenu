import { getRestaurant } from "../actions";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import { RestaurantFeaturesView } from "@/components/restaurant/RestaurantFeaturesView";
import Link from "next/link";

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {restaurant.name || "Unnamed Restaurant"}
              </h1>
              <p className="mt-2 text-gray-600">
                Restaurant Details and Management
              </p>
            </div>
            <div className="space-x-2">
              <Link href={`/admin/restaurant-management/${restaurant.id}/edit`}>
                <Button>Edit Restaurant</Button>
              </Link>
              <Link href="/admin/restaurant-management">
                <Button variant="outline">Back to List</Button>
              </Link>
            </div>
          </div>

          {/* Restaurant Details */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Restaurant Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Name</h3>
                    <p className="text-lg">{restaurant.name || "Not set"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Location
                    </h3>
                    <p className="text-lg">
                      {restaurant.location || "Not set"}
                    </p>
                  </div>
                  {restaurant.logoUrl && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Logo
                      </h3>
                      <img
                        src={restaurant.logoUrl}
                        alt="Restaurant Logo"
                        className="w-32 h-32 rounded-lg object-cover mt-2"
                      />
                    </div>
                  )}
                  {restaurant.rating && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Rating
                      </h3>
                      <p className="text-lg">⭐ {restaurant.rating}/5</p>
                    </div>
                  )}
                  {restaurant.noiselevel && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Noise Level
                      </h3>
                      <p className="text-lg capitalize">
                        {restaurant.noiselevel}
                      </p>
                    </div>
                  )}
                  {restaurant.privacylevel && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Privacy Level
                      </h3>
                      <p className="text-lg capitalize">
                        {restaurant.privacylevel}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Restaurant Features */}
              <RestaurantFeaturesView restaurantId={restaurant.id} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link
                    href={`/admin/restaurant-management/${restaurant.id}/edit`}
                  >
                    <Button className="w-full">Edit Restaurant</Button>
                  </Link>
                  <Link href="/admin/restaurant-management">
                    <Button variant="outline" className="w-full">
                      Back to List
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">ID:</span>
                    <p className="font-mono">{restaurant.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <p>{new Date(restaurant.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Updated:</span>
                    <p>{new Date(restaurant.updatedAt).toLocaleString()}</p>
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
