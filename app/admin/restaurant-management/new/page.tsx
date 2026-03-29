"use client";

import { useState } from "react";
import { RestaurantForm } from "@/components/restaurant/RestaurantForm";
import { RestaurantFeatures } from "@/components/restaurant/RestaurantFeatures";
import { MealForm } from "@/components/meal/MealForm";
import { MealCard } from "@/components/meal/MealCard";
import {
  RestaurantFormData,
  NoiseLevel,
  PrivacyLevel,
} from "@/lib/types/restaurant";
import { MealFormData, PortionSize } from "@/lib/types/meal";
import { useRouter } from "next/navigation";
import { createRestaurant } from "../actions";
import { addMenuItemToRestaurant } from "../menu-item-actions";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,
} from "@/components/ui";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";

interface MealWithId extends MealFormData {
  id: string;
  imageUrl?: string;
}

export default function NewRestaurantPage() {
  const router = useRouter();

  // Restaurant data state
  const [restaurantData, setRestaurantData] = useState<RestaurantFormData>({
    name: "",
    location: "",
    features: {
      isLuxury: false,
      isGrabAndGo: false,
      noiseLevel: NoiseLevel.MODERATE,
      privacyLevel: PrivacyLevel.PUBLIC,
    },
  });

  // Meals state
  const [meals, setMeals] = useState<MealWithId[]>([]);
  const [showMealForm, setShowMealForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealWithId | null>(null);
  const [loading, setLoading] = useState(false);
  const [createdRestaurantId, setCreatedRestaurantId] = useState<string | null>(
    null,
  );
  const [showFeatures, setShowFeatures] = useState(false); // Show features immediately
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const handleRestaurantSubmit = (data: RestaurantFormData) => {
    setRestaurantData(data);
    // Don't auto-create, just show the features section
    console.log("Restaurant details saved:", data);
  };

  const handleMealSubmit = async (data: MealFormData) => {
    if (!createdRestaurantId) {
      alert("Please create the restaurant first before adding menu items");
      return;
    }

    try {
      // Convert MealFormData to MenuItemFormData
      const menuItemData = {
        ...data,
      };

      // Add menu item to restaurant (creates menu item if needed)
      const result = await addMenuItemToRestaurant(
        createdRestaurantId,
        menuItemData
      );

      if (result.success && result.data) {
        console.log("Menu item added successfully:", result.data);

        // Update local state
        if (editingMeal) {
          setMeals((prev) =>
            prev.map((meal) =>
              meal.id === editingMeal.id
                ? {
                    ...data,
                    id: editingMeal.id,
                    imageUrl: editingMeal.imageUrl,
                  }
                : meal,
            ),
          );
        } else {
          const newMeal: MealWithId = {
            ...data,
            id: result.data.menuItem.id,
            imageUrl: data.image ? URL.createObjectURL(data.image) : undefined,
          };
          setMeals((prev) => [...prev, newMeal]);
        }

        // Reset form
        setShowMealForm(false);
        setEditingMeal(null);
      } else {
        alert(`Failed to add menu item: ${result.error}`);
      }
    } catch (error) {
      console.error("Error adding menu item:", error);
      alert("Failed to add menu item");
    }
  };

  const handleEditMeal = (meal: MealWithId) => {
    setEditingMeal(meal);
    setShowMealForm(true);
  };

  const handleDeleteMeal = (id: string) => {
    setMeals((prev) => prev.filter((meal) => meal.id !== id));
  };

  const handleFinalSubmit = async (overrideStatus?: "DRAFT" | "PUBLISHED") => {
    if (!restaurantData.name || !restaurantData.location) {
      alert("Please fill in restaurant details first");
      return;
    }

    const finalStatus = overrideStatus || status;

    setLoading(true);
    try {
      // Convert form data to our API format
      const restaurantInput = {
        name: restaurantData.name,
        location: restaurantData.location,
        logoUrl: restaurantData.logo ? "temp-logo-url" : undefined, // TODO: Handle file upload
        status: finalStatus,
        noiselevel: restaurantData.features.noiseLevel,
        privacylevel: restaurantData.features.privacyLevel,
        featureIds: selectedFeatures,
      };

      // Create restaurant using our server action
      const result = await createRestaurant(restaurantInput);

      if (result.success) {
        // Store the created restaurant ID for features
        if (result.data) {
          setCreatedRestaurantId(result.data.id);
        }

        // TODO: Later we'll also create meals
        console.log("Restaurant created successfully:", result.data);
        console.log("Meals to be added:", meals);

        // Show success message but don't redirect - let user add features
        alert(
          `Restaurant "${restaurantData.name}" created successfully! Now you can add features and menu items.`,
        );
      } else {
        alert(`Failed to create restaurant: ${result.error}`);
      }
    } catch (error) {
      console.error("Error creating restaurant:", error);
      alert("Failed to create restaurant");
    } finally {
      setLoading(false);
    }
  };

  const handleMealFormCancel = () => {
    setShowMealForm(false);
    setEditingMeal(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  Add New Restaurant
                </h1>
                <Badge variant={status === "DRAFT" ? "outline" : "default"}>
                  {status}
                </Badge>
              </div>
              <p className="mt-2 text-gray-600">
                Fill in the restaurant details and add meals to the menu.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => router.push("/admin/restaurant-management")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStatus("DRAFT");
                  handleFinalSubmit("DRAFT");
                }}
                disabled={loading || !restaurantData.name}
              >
                {loading && status === "DRAFT" ? "Saving..." : "Save as Draft"}
              </Button>
              <Button
                onClick={() => {
                  setStatus("PUBLISHED");
                  handleFinalSubmit("PUBLISHED");
                }}
                disabled={loading || !restaurantData.name}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading && status === "PUBLISHED" ? "Publishing..." : "Publish Restaurant"}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="restaurant" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="restaurant">Restaurant Details</TabsTrigger>
              <TabsTrigger value="meals">
                Menu Items {meals.length > 0 && `(${meals.length})`}
              </TabsTrigger>
            </TabsList>

            {/* Restaurant Details Tab */}
            <TabsContent value="restaurant">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Restaurant Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RestaurantForm
                      mode="create"
                      onSubmit={handleRestaurantSubmit}
                      restaurantId={createdRestaurantId || undefined}
                    />

                    {/* Features Section - Always Visible */}
                    {!createdRestaurantId && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Restaurant Features
                        </h3>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <p className="text-sm text-blue-800">
                            💡 Select features for your restaurant. These will
                            be saved when you create the restaurant.
                          </p>
                        </div>
                        <RestaurantFeatures
                          restaurantId="temp"
                          selectedFeatures={selectedFeatures}
                          onFeaturesChange={setSelectedFeatures}
                          disabled={false}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Success message when restaurant is created */}
                {createdRestaurantId && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-4">
                        <div className="text-green-600 text-4xl mb-4">✅</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Restaurant Created Successfully!
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Your restaurant "{restaurantData.name}" has been
                          created. You can now add menu items or go to the
                          restaurant to edit features.
                        </p>
                        <div className="flex justify-center space-x-2">
                          <Button
                            onClick={() =>
                              router.push(
                                `/admin/restaurant-management/${createdRestaurantId}/edit`,
                              )
                            }
                          >
                            Edit Features
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() =>
                              router.push("/admin/restaurant-management")
                            }
                          >
                            Finish Later
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Meals Tab */}
            <TabsContent value="meals">
              <div className="space-y-6">
                {/* Add Meal Button */}
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Menu Items
                    </h2>
                    <p className="text-sm text-gray-600">
                      Add meals to your restaurant's menu
                    </p>
                  </div>
                  <Button onClick={() => setShowMealForm(true)}>
                    Add Meal
                  </Button>
                </div>

                {/* Meal Form */}
                {showMealForm && (
                  <MealForm
                    onSubmit={handleMealSubmit}
                    onCancel={handleMealFormCancel}
                    mode="restaurant"
                    initialData={editingMeal || { restaurantId: "temp" }}
                  />
                )}

                {/* Meals List */}
                {meals.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Added Meals ({meals.length})
                    </h3>
                    <div className="grid gap-4">
                      {meals.map((meal) => (
                        <MealCard
                          key={meal.id}
                          meal={meal}
                          onEdit={handleEditMeal}
                          onDelete={handleDeleteMeal}
                          showActions={true}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <div className="text-gray-400 text-5xl mb-4">🍽️</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No meals added yet
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Start by adding your first menu item
                        </p>
                        <Button onClick={() => setShowMealForm(true)}>
                          Add Your First Meal
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
