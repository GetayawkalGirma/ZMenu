"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getMealById, getRestaurantsForMeal } from "../actions";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@/components/ui";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";
import { ArrowLeft, MapPin, Clock, Flame, Tag } from "lucide-react";
import type { MenuItem, RestaurantMenu } from "@/lib/types/meal";
import { PortionSize } from "@/lib/types/meal";
import { formatPrice } from "@/lib/utils";

export default function MealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const mealId = resolvedParams.id;

  const [meal, setMeal] = useState<MenuItem | null>(null);
  const [restaurants, setRestaurants] = useState<RestaurantMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mealId) loadMealData();
  }, [mealId]);

  const loadMealData = async () => {
    setLoading(true);
    try {
      const mealResult = await getMealById(mealId);
      if (mealResult.success && mealResult.data) {
        setMeal(mealResult.data);
      } else {
        setError(mealResult.error || "Failed to load meal");
        return;
      }

      const restaurantResult = await getRestaurantsForMeal(mealId);
      if (restaurantResult.success && restaurantResult.data) {
        setRestaurants(restaurantResult.data);
      }
    } catch {
      setError("Failed to load meal data");
    } finally {
      setLoading(false);
    }
  };

  const getPortionSizeLabel = (
    portionSize: PortionSize | null | undefined,
  ) => {
    if (!portionSize) return "Not specified";
    const labels: Record<string, string> = {
      [PortionSize.ONE_PERSON]: "One Person",
      [PortionSize.TWO_PEOPLE]: "Two People",
      [PortionSize.THREE_PEOPLE]: "Three People",
      [PortionSize.FAMILY]: "Family",
    };
    return labels[portionSize] || portionSize;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-4" />
          <div className="text-gray-500 font-medium">Loading meal details...</div>
        </div>
      </div>
    );
  }

  if (error || !meal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">
            {error || "Meal not found"}
          </div>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Meals
            </Button>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                  {meal.name}
                </h1>
                {meal.description && (
                  <p className="mt-2 text-gray-500">{meal.description}</p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 border-blue-100"
                  >
                    {meal.category?.name || "Uncategorized"}
                  </Badge>
                  {meal.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center text-xs px-2 py-0.5 rounded-md bg-gray-50 text-gray-500 border border-gray-100 font-medium"
                    >
                      <Tag className="w-2.5 h-2.5 mr-1 opacity-60" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="description">Meal Info</TabsTrigger>
              <TabsTrigger value="restaurants">
                Available at ({restaurants.length} Restaurants)
              </TabsTrigger>
            </TabsList>

            {/* Meal Info Tab */}
            <TabsContent value="description">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-gray-100 shadow-sm">
                    <CardHeader>
                      <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          Description
                        </h4>
                        <p className="text-gray-700">
                          {meal.description || "No description available"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          Category
                        </h4>
                        <Badge variant="secondary">
                          {meal.category?.name || "Uncategorized"}
                        </Badge>
                      </div>
                      {meal.tags && meal.tags.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1.5">
                            Tags
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {meal.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar - Analytics */}
                <div className="space-y-6">
                  <Card className="border-gray-100 shadow-sm">
                    <CardHeader>
                      <CardTitle>Market Intelligence</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Average Price
                        </h4>
                        <p className="text-2xl font-bold text-green-600">
                          {meal.avgPrice
                            ? formatPrice(meal.avgPrice)
                            : "N/A"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <h4 className="text-xs font-medium text-gray-500">
                            Min Price
                          </h4>
                          <p className="font-semibold text-gray-700">
                            {meal.minPrice
                              ? formatPrice(meal.minPrice)
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-xs font-medium text-gray-500">
                            Max Price
                          </h4>
                          <p className="font-semibold text-gray-700">
                            {meal.maxPrice
                              ? formatPrice(meal.maxPrice)
                              : "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">
                            Restaurants Serving
                          </span>
                          <span className="font-semibold">
                            {meal.priceCount || 0}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Restaurants Tab */}
            <TabsContent value="restaurants">
              <div className="space-y-6">
                {restaurants.length === 0 ? (
                  <Card className="border-gray-100 shadow-sm">
                    <CardContent className="py-12 text-center">
                      <p className="text-gray-500">
                        No restaurants currently serve this meal.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {restaurants.map((rm) => (
                      <Card
                        key={rm.id}
                        className="overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex h-full">
                          {rm.imageUrl && (
                            <div className="w-1/3 flex-shrink-0">
                              <img
                                src={rm.imageUrl}
                                alt={meal.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div className="p-4 flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-gray-900">
                                {rm.restaurant?.name || "Unknown"}
                              </h3>
                              <Badge
                                variant={
                                  rm.isAvailable ? "default" : "outline"
                                }
                              >
                                {rm.isAvailable ? "Available" : "Sold Out"}
                              </Badge>
                            </div>

                            <div className="flex items-center text-xs text-gray-500 mb-3">
                              <MapPin className="w-3 h-3 mr-1" />
                              {rm.restaurant?.location || "No location"}
                            </div>

                            <div className="text-xl font-bold text-green-600 mb-3">
                              {formatPrice(rm.price)}
                            </div>

                            <div className="grid grid-cols-2 gap-y-2 text-xs">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-blue-500" />
                                {rm.preparationTime || "?"} min
                              </div>
                              <div className="flex items-center gap-1">
                                {rm.spicyLevel && rm.spicyLevel > 0 ? (
                                  <>
                                    <Flame className="w-3 h-3 text-orange-500" />
                                    Level {rm.spicyLevel}
                                  </>
                                ) : (
                                  "Not spicy"
                                )}
                              </div>
                              <div className="col-span-2 text-gray-400">
                                {getPortionSizeLabel(rm.portionSize)}
                              </div>
                            </div>

                            {rm.ingredients && rm.ingredients.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-1">
                                {rm.ingredients.slice(0, 3).map((i) => (
                                  <span
                                    key={i}
                                    className="text-[10px] bg-gray-50 px-1.5 py-0.5 rounded text-gray-500"
                                  >
                                    {i}
                                  </span>
                                ))}
                                {rm.ingredients.length > 3 && (
                                  <span className="text-[10px] text-gray-400">
                                    +{rm.ingredients.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
