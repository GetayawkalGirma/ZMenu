"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from "../../actions";
import {
  linkMenuItemToRestaurant,
  updateRestaurantMenuItem,
  removeMenuItemFromRestaurant,
  getRestaurantMenu,
} from "../../menu-item-actions";
import { RestaurantForm } from "@/components/restaurant/RestaurantForm";
import { AddRestaurantMenu } from "@/components/meal/AddRestaurantMenu";
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
import type { RestaurantMenu, RestaurantMenuFormData } from "@/lib/types/meal";
import { StatusDialog, StatusType } from "@/components/ui";

export default function EditRestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState<string>("");
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<RestaurantMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialFeatureIds, setInitialFeatureIds] = useState<string[]>([]);

  // Status Dialog State
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusType, setStatusType] = useState<StatusType>("info");
  const [statusTitle, setStatusTitle] = useState("");
  const [statusDescription, setStatusDescription] = useState("");
  const [statusAction, setStatusAction] = useState<(() => void) | undefined>();

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
        const r = result.data as any;
        const featureIds = r.features?.map((f: any) => f.feature.id) || [];
        setInitialFeatureIds(featureIds);
        setRestaurant(r);

        // Load menu items via service (hydrates images)
        const menuResult = await getRestaurantMenu(id);
        if (menuResult.success && menuResult.data) {
          setMenuItems(menuResult.data.items);
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

  const handleSubmit = async (data: any) => {
    if (!restaurantId) return;

    setSaving(true);
    setError(null);

    try {
      const updateData = {
        ...data,
        status: data.status, // Explicitly pass status
        noiselevel: data.features?.noiseLevel || data.noiselevel,
        privacylevel: data.features?.privacyLevel || data.privacylevel,
        featureIds: data.featureIds || [],
      };

      const result = await updateRestaurant(restaurantId, updateData);

      if (result.success) {
        setStatusType("success");
        setStatusTitle("Update Successful");
        setStatusDescription("The restaurant details have been synchronized with the database.");
        setStatusAction(() => () => router.push(`/admin/restaurant-management/${restaurantId}`));
        setStatusOpen(true);
      } else {
        setStatusType("error");
        setStatusTitle("Update Failed");
        setStatusDescription(result.error || "A communication error occurred with the server.");
        setStatusOpen(true);
      }
    } catch (err: any) {
      setStatusType("error");
      setStatusTitle("Critical Error");
      setStatusDescription(err.message || "Failed to update restaurant due to a network issue.");
      setStatusOpen(true);
    } finally {
      setSaving(false);
    }
  };

  const handleAddMenuItem = async (data: RestaurantMenuFormData) => {
    const result = await linkMenuItemToRestaurant({
      ...data,
      restaurantId,
    });

    if (result.success && result.data) {
      const menuResult = await getRestaurantMenu(restaurantId);
      if (menuResult.success && menuResult.data) {
        setMenuItems(menuResult.data.items);
      }
    } else {
      alert(`Failed to add menu item: ${result.error}`);
      throw new Error(result.error);
    }
  };

  const handleUpdateMenuItem = async (id: string, data: RestaurantMenuFormData) => {
    const result = await updateRestaurantMenuItem(id, {
      ...data,
      restaurantId,
    });

    if (result.success) {
      const menuResult = await getRestaurantMenu(restaurantId);
      if (menuResult.success && menuResult.data) {
        setMenuItems(menuResult.data.items);
      }
    } else {
      alert(`Failed to update menu item: ${result.error}`);
      throw new Error(result.error);
    }
  };

  const handleDeleteMenuItem = async (
    restaurantMenuId: string,
  ) => {
    if (!confirm("Remove this item from the restaurant?")) return;

    const result = await removeMenuItemFromRestaurant(
      restaurantId,
      restaurantMenuId,
    );
    if (result.success) {
      setMenuItems((prev) =>
        prev.filter((item) => item.id !== restaurantMenuId),
      );
    } else {
      alert(`Failed to remove: ${result.error}`);
    }
  };

  const handleDeleteRestaurant = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this restaurant? This action is IRREVERSIBLE and will also delete all associated menu items and images.",
      )
    ) {
      return;
    }

    setSaving(true);
    try {
      const result = await deleteRestaurant(restaurantId);
      if (result.success) {
        router.push("/admin/restaurant-management");
      } else {
        alert(`Failed to delete restaurant: ${result.error}`);
      }
    } catch {
      alert("Failed to delete restaurant");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-500 font-medium">Loading restaurant...</p>
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
          <div className="px-4 py-6 sm:px-0 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Button onClick={() => router.push("/admin/restaurant-management")}>
              Back to Restaurants
            </Button>
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
                Update restaurant details, features, and menu items.
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
                Menu Items {menuItems.length > 0 && `(${menuItems.length})`}
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
                      geoLocation: (restaurant as any).geoLocation,
                      logoUrl: (restaurant as any).logoUrl,
                      logoId: (restaurant as any).logoId,
                      menuImageUrl: (restaurant as any).menuImageUrl,
                      menuImageId: (restaurant as any).menuImageId,
                      status: (restaurant as any).status,
                      features: {
                        isLuxury: false,
                        isGrabAndGo: false,
                        noiseLevel:
                          (restaurant.noiselevel as NoiseLevel) ||
                          NoiseLevel.MODERATE,
                        privacyLevel:
                          (restaurant.privacylevel as PrivacyLevel) ||
                          PrivacyLevel.PUBLIC,
                      },
                      latitude: restaurant.latitude,
                      longitude: restaurant.longitude,
                    }}
                    onSubmit={handleSubmit}
                    loading={saving}
                    restaurantId={restaurantId}
                    initialFeatureIds={initialFeatureIds}
                  />
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <div className="mt-8 pt-6 border-t border-red-100">
                <Card className="border-red-200 bg-red-50/30">
                  <CardHeader>
                    <CardTitle className="text-red-800 flex items-center gap-2"></CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-red-900 uppercase tracking-tight">
                          Delete Restaurant
                        </h4>
                        <p className="text-sm text-red-700">
                          This will permanently remove the restaurant, all its
                          menu items, and images.
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteRestaurant}
                        disabled={saving}
                        className="bg-red-600 hover:bg-red-700 shadow-md font-bold"
                      >
                        Delete this restaurant
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Menu Items Tab */}
            <TabsContent value="meals">
              <AddRestaurantMenu
                restaurantId={restaurantId}
                existingItems={menuItems}
                onAdd={handleAddMenuItem}
                onUpdate={handleUpdateMenuItem}
                onDelete={handleDeleteMenuItem}
                onRefresh={() => loadRestaurant(restaurantId)}
                loading={saving}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <StatusDialog 
        open={statusOpen}
        onOpenChange={setStatusOpen}
        type={statusType}
        title={statusTitle}
        description={statusDescription}
        onAction={statusAction}
        actionLabel={statusType === "success" ? "View Restaurant" : "Try Again"}
      />
    </div>
  );
}
