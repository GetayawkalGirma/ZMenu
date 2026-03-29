"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRestaurant, updateRestaurant } from "../../actions";
import { 
  addMenuItemToRestaurant, 
  removeMenuItemFromRestaurant,
  updateRestaurantMenuItem 
} from "../../menu-item-actions";
import { RestaurantForm } from "@/components/restaurant/RestaurantForm";
import { MealForm } from "@/components/meal/MealForm";
import { MealCard } from "@/components/meal/MealCard";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui";
import type { CreateRestaurantInput } from "@/lib/validations/restaurant.validation";
import { NoiseLevel, PrivacyLevel } from "@/lib/types/restaurant";
import { MealFormData, PortionSize } from "@/lib/types/meal";

interface MealWithId extends MealFormData {
  id: string;
  imageUrl?: string;
  restaurantMenuId?: string; // ID from the junction table
}
export default function EditRestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState<string>("");
  const [restaurant, setRestaurant] = useState<CreateRestaurantInput | null>(
    null,
  );
  const [meals, setMeals] = useState<MealWithId[]>([]);
  const [showMealForm, setShowMealForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealWithId | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadParams = async () => {
      const { id } = await params;
      setRestaurantId(id);
      loadRestaurant(id);
    };

    loadParams();
  }, [params]);

  const loadRestaurant = async (id: string) => {
    try {
      const result = await getRestaurant(id);
      if (result.success && result.data) {
        // Convert database format to form format
        const r = result.data as any;
        const formData: CreateRestaurantInput = {
          name: r.name || "",
          location: r.location || "",
          logoUrl: r.logoUrl || undefined,
          logoId: r.logoId || undefined,
          menuImageUrl: r.menuImageUrl || undefined,
          menuImageId: r.menuImageId || undefined,
          status: (r.status as "DRAFT" | "PUBLISHED") || "DRAFT",
          rating: r.rating || undefined,
          noiselevel: r.noiselevel || undefined,
          privacylevel: r.privacylevel || undefined,
        };
        setRestaurant(formData);

        // Load meals
        if (r.menuItems) {
          const loadedMeals: MealWithId[] = r.menuItems.map((item: any) => ({
            id: item.menuItem.id,
            restaurantMenuId: item.id,
            name: item.menuItem.name,
            description: item.menuItem.description || "",
            price: item.price,
            isAvailable: item.isAvailable,
            categoryId: item.menuItem.categoryId,
            portionSize: item.portionSize,
            spicyLevel: item.spicyLevel,
            preparationTime: item.preparationTime,
            calories: item.calories,
            ingredients: item.ingredients || [],
            tags: item.menuItem.tags || [],
            imageUrl: item.imageUrl || undefined,
          }));
          setMeals(loadedMeals);
        }
      } else {
        setError("Restaurant not found");
      }
    } catch (err) {
      console.error("Error loading restaurant:", err);
      setError("Failed to load restaurant");
    } finally {
      setLoading(false);
    }
  };

  const handleMealSubmit = async (data: MealFormData) => {
    if (!restaurantId) return;

    setSaving(true);
    try {
      if (editingMeal && editingMeal.restaurantMenuId) {
        // Update existing restaurant menu item
        const updateData = {
          price: data.price,
          isAvailable: data.isAvailable,
          portionSize: data.portionSize,
          spicyLevel: data.spicyLevel,
          preparationTime: data.preparationTime,
          restaurantId: restaurantId,
        };

        const result = await updateRestaurantMenuItem(editingMeal.restaurantMenuId, updateData);
        if (result.success) {
          setMeals((prev) =>
            prev.map((meal) =>
              meal.restaurantMenuId === editingMeal.restaurantMenuId
                ? { ...data, id: meal.id, restaurantMenuId: meal.restaurantMenuId, imageUrl: meal.imageUrl }
                : meal
            )
          );
        } else {
          alert(`Failed to update meal: ${result.error}`);
        }
      } else {
        // Add new meal to restaurant
        const menuItemData = {
          ...data,
        };

        const result = await addMenuItemToRestaurant(restaurantId, menuItemData);
        if (result.success && result.data) {
          const newMeal: MealWithId = {
            ...data,
            id: result.data.menuItem.id,
            restaurantMenuId: result.data.restaurantMenu.id,
            imageUrl: data.imageUrl,
          };
          setMeals((prev) => [...prev, newMeal]);
        } else {
          alert(`Failed to add meal: ${result.error}`);
        }
      }
      setShowMealForm(false);
      setEditingMeal(null);
    } catch (error) {
      console.error("Error saving meal:", error);
      alert("Failed to save meal");
    } finally {
      setSaving(false);
    }
  };

  const handleEditMeal = (meal: MealWithId) => {
    setEditingMeal(meal);
    setShowMealForm(true);
  };

  const handleDeleteMeal = async (id: string) => {
    if (!restaurantId) return;

    const mealToDelete = meals.find((m) => m.id === id);
    if (!mealToDelete) return;

    if (!confirm(`Are you sure you want to remove ${mealToDelete.name} from this restaurant?`)) {
      return;
    }

    setSaving(true);
    try {
      const result = await removeMenuItemFromRestaurant(restaurantId, id);
      if (result.success) {
        setMeals((prev) => prev.filter((meal) => meal.id !== id));
      } else {
        alert(`Failed to remove meal: ${result.error}`);
      }
    } catch (error) {
      console.error("Error removing meal:", error);
      alert("Failed to remove meal");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (data: any) => {
    if (!restaurantId) return;

    setSaving(true);
    setError(null);

    try {
      // Convert form data to API format
      const updateData = {
        name: data.name,
        location: data.location,
        logoUrl: data.logoUrl,
        rating: data.rating,
        noiselevel: data.features?.noiseLevel || data.noiselevel,
        privacylevel: data.features?.privacyLevel || data.privacylevel,
      };

      const result = await updateRestaurant(restaurantId, updateData);

      if (result.success) {
        alert("Restaurant updated successfully!");
        router.push(`/admin/restaurant-management/${restaurantId}`);
      } else {
        setError(result.error || "Failed to update restaurant");
      }
    } catch (err) {
      setError("Failed to update restaurant");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading restaurant...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Error</h1>
              <p className="text-gray-600 mb-8">{error}</p>
              <Button
                onClick={() => router.push("/admin/restaurant-management")}
              >
                Back to Restaurants
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Edit Restaurant
              </h1>
              <p className="mt-2 text-gray-600">
                Update restaurant information
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/admin/restaurant-management/${restaurantId}`)
              }
            >
              Cancel
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Restaurant Details</TabsTrigger>
              <TabsTrigger value="meals">
                Menu Items {meals.length > 0 && `(${meals.length})`}
              </TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Restaurant Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <RestaurantForm
                    mode="edit"
                    initialData={{
                      name: restaurant.name,
                      location: restaurant.location,
                      logoUrl: (restaurant as any).logoUrl,
                      logoId: (restaurant as any).logoId,
                      menuImageUrl: (restaurant as any).menuImageUrl,
                      menuImageId: (restaurant as any).menuImageId,
                      features: {
                        isLuxury: false,
                        isGrabAndGo: false,
                        noiseLevel: (restaurant.noiselevel as NoiseLevel) || NoiseLevel.MODERATE,
                        privacyLevel: (restaurant.privacylevel as PrivacyLevel) || PrivacyLevel.PUBLIC,
                      },
                    }}
                    onSubmit={handleSubmit}
                    loading={saving}
                    restaurantId={restaurantId}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Meals Tab */}
            <TabsContent value="meals">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Menu Items
                    </h2>
                    <p className="text-sm text-gray-600">
                      Manage meals offered by this restaurant
                    </p>
                  </div>
                  <Button onClick={() => setShowMealForm(true)} disabled={saving}>
                    Add Meal
                  </Button>
                </div>

                {/* Meal Form */}
                {showMealForm && (
                  <MealForm
                    onSubmit={handleMealSubmit}
                    onCancel={() => {
                      setShowMealForm(false);
                      setEditingMeal(null);
                    }}
                    initialData={editingMeal || { restaurantId }}
                  />
                )}

                {/* Meals List */}
                {meals.length > 0 ? (
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
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <div className="text-gray-400 text-5xl mb-4">🍽️</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No meals added yet
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          This restaurant doesn't have any menu items.
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
