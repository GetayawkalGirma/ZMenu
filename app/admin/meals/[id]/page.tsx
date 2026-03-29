"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getMealById, getRestaurantsForMeal } from "../actions";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";
import { ArrowLeft, MapPin, Clock, Flame } from "lucide-react";
import type { MenuItem, RestaurantMenu } from "@/lib/types/meal";
import { PortionSize } from "@/lib/types/meal";

export default function MealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const mealId = resolvedParams.id;

  const [meal, setMeal] = useState<MenuItem | null>(null);
  const [restaurants, setRestaurants] = useState<RestaurantMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mealId) {
      loadMealData();
    }
  }, [mealId]);

  const loadMealData = async () => {
    setLoading(true);
    try {
      // Load meal details
      const mealResult = await getMealById(mealId);
      if (mealResult.success && mealResult.data) {
        setMeal(mealResult.data);
      } else {
        setError(mealResult.error || "Failed to load meal");
        return;
      }

      // Load restaurants that serve this meal
      const restaurantResult = await getRestaurantsForMeal(mealId);
      if (restaurantResult.success && restaurantResult.data) {
        setRestaurants(restaurantResult.data);
      }
    } catch (error) {
      setError("Failed to load meal data");
    } finally {
      setLoading(false);
    }
  };

  const getPortionSizeLabel = (portionSize: PortionSize | null | undefined) => {
    if (!portionSize) return "Not specified";
    switch (portionSize) {
      case PortionSize.ONE_PERSON:
        return "One Person";
      case PortionSize.TWO_PEOPLE:
        return "Two People";
      case PortionSize.THREE_PEOPLE:
        return "Three People";
      case PortionSize.FAMILY:
        return "Family";
      default:
        return portionSize;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading meal details...</div>
      </div>
    );
  }

  if (error || !meal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{error || "Meal not found"}</div>
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
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Meals
            </Button>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{meal.name}</h1>
                <p className="mt-2 text-gray-600">{meal.description}</p>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {meal.tags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-blue-600 border-blue-200">
                      #{tag}
                    </Badge>
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
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Global Specification</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                        <p className="text-gray-600">
                          {meal.description || "No description available"}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Category</h4>
                        <Badge variant="secondary">
                          {meal.category?.name || "Uncategorized"}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          Food Type: {meal.category?.foodType} | {meal.category?.dietaryCategory}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar - Analytics */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Market Intelligence</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900">Average Price</h4>
                        <p className="text-2xl font-bold text-green-600">
                          {meal.avgPrice ? `${meal.avgPrice.toFixed(2)} birr` : "N/A"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <h4 className="text-xs font-medium text-gray-500">Min Price</h4>
                          <p className="font-semibold text-gray-700">{meal.minPrice || "N/A"} birr</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-medium text-gray-500">Max Price</h4>
                          <p className="font-semibold text-gray-700">{meal.maxPrice || "N/A"} birr</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Price Points</span>
                          <span className="font-medium">{meal.priceCount || 0}</span>
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
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-gray-500 mb-4">No restaurants currently serve this meal.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {restaurants.map((rm) => (
                      <Card key={rm.id} className="overflow-hidden">
                        <div className="flex h-full">
                          {rm.imageUrl && (
                            <div className="w-1/3 flex-shrink-0">
                              <img src={rm.imageUrl} alt={meal.name} className="h-full w-full object-cover" />
                            </div>
                          )}
                          <div className="p-4 flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-gray-900">{rm.restaurant?.name || "Unknown"}</h3>
                              <Badge variant={rm.isAvailable ? "default" : "outline"}>
                                {rm.isAvailable ? "Available" : "Sold Out"}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center text-xs text-gray-500 mb-3">
                              <MapPin className="w-3 h-3 mr-1" />
                              {rm.restaurant?.location || "No location"}
                            </div>

                            <div className="text-xl font-bold text-green-600 mb-3">{rm.price} birr</div>

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
                                ) : "Not spicy"}
                              </div>
                              <div className="col-span-2 text-gray-400">
                                {getPortionSizeLabel(rm.portionSize)}
                              </div>
                            </div>
                            
                            {rm.ingredients && rm.ingredients.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-1">
                                {rm.ingredients.slice(0, 3).map(i => (
                                  <span key={i} className="text-[10px] bg-gray-50 px-1 rounded text-gray-500">{i}</span>
                                ))}
                                {rm.ingredients.length > 3 && <span className="text-[10px] text-gray-400">+{rm.ingredients.length - 3} more</span>}
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
