"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
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
  StatusDialog,
  StatusType,
  ConfirmDialog,
} from "@/components/ui";
import type { RestaurantMenu, RestaurantMenuFormData } from "@/lib/types/meal";
import { NoiseLevel, PrivacyLevel } from "@/lib/types/restaurant";
import { Image as ImageIcon } from "lucide-react";

interface Props {
  restaurantId: string;
  initialRestaurant: any;
  initialMenuItems: RestaurantMenu[];
  initialFeatureIds: string[];
}

export function EditRestaurantClient({
  restaurantId,
  initialRestaurant,
  initialMenuItems,
  initialFeatureIds,
}: Props) {
  const router = useRouter();

  // State is initialized from server-fetched props — no useEffect fetch needed.
  const [restaurant, setRestaurant] = useState<any>(initialRestaurant);
  const [menuItems, setMenuItems] = useState<RestaurantMenu[]>(initialMenuItems);
  const [saving, setSaving] = useState(false);

  const [statusOpen, setStatusOpen] = useState(false);
  const [statusType, setStatusType] = useState<StatusType>("info");
  const [statusTitle, setStatusTitle] = useState("");
  const [statusDescription, setStatusDescription] = useState("");
  const [statusAction, setStatusAction] = useState<(() => void) | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const refreshMenu = async () => {
    const menuResult = await getRestaurantMenu(restaurantId);
    if (menuResult.success && menuResult.data) {
      setMenuItems(menuResult.data.items);
    }
  };

  const handleSubmit = async (data: any) => {
    setSaving(true);
    try {
      const result = await updateRestaurant(restaurantId, {
        ...data,
        status: data.status,
        noiselevel: data.features?.noiseLevel || data.noiselevel,
        privacylevel: data.features?.privacyLevel || data.privacylevel,
        featureIds: data.featureIds || [],
      });

      if (result.success) {
        setRestaurant((prev: any) => ({ ...prev, ...data }));
        setStatusType("success");
        setStatusTitle("Update Successful");
        setStatusDescription("Restaurant details have been saved.");
        setStatusAction(() => () =>
          router.push(`/admin/restaurant-management/${restaurantId}`)
        );
      } else {
        setStatusType("error");
        setStatusTitle("Update Failed");
        setStatusDescription(result.error || "Something went wrong.");
      }
    } catch (err: any) {
      setStatusType("error");
      setStatusTitle("Error");
      setStatusDescription(err.message || "Failed to update restaurant.");
    } finally {
      setSaving(false);
      setStatusOpen(true);
    }
  };

  const handleAddMenuItem = async (data: RestaurantMenuFormData) => {
    const result = await linkMenuItemToRestaurant({ ...data, restaurantId });
    if (result.success) {
      await refreshMenu();
    } else {
      alert(`Failed to add menu item: ${result.error}`);
      throw new Error(result.error);
    }
  };

  const handleUpdateMenuItem = async (id: string, data: RestaurantMenuFormData) => {
    const result = await updateRestaurantMenuItem(id, { ...data, restaurantId });
    if (result.success) {
      await refreshMenu();
    } else {
      alert(`Failed to update menu item: ${result.error}`);
      throw new Error(result.error);
    }
  };

  const handleDeleteMenuItem = async (restaurantMenuId: string) => {
    const result = await removeMenuItemFromRestaurant(restaurantId, restaurantMenuId);
    if (result.success) {
      setMenuItems((prev) => prev.filter((item) => item.id !== restaurantMenuId));
    } else {
      alert(`Failed to remove: ${result.error}`);
    }
  };

  const handleDeleteRestaurant = async () => {
    setSaving(true);
    try {
      const result = await deleteRestaurant(restaurantId);
      if (result.success) {
        router.push("/admin/restaurant-management");
      } else {
        alert(`Failed to delete: ${result.error}`);
        setDeleteDialogOpen(false);
      }
    } catch {
      alert("Failed to delete restaurant");
      setDeleteDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">

          {/* Header — rendered server-side so the restaurant name is in the HTML immediately */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/admin/restaurant-management")}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors border border-gray-200"
                title="All Restaurants"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                  Edit Restaurant
                </h1>
                <p className="mt-0.5 text-sm text-gray-500 italic">
                  {restaurant?.name}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-black uppercase tracking-widest"
                onClick={() =>
                  router.push(
                    `/admin/restaurant-management/${restaurantId}/edit/images`
                  )
                }
              >
                <ImageIcon className="w-4 h-4" />
                Image Library
              </Button>
              <Button
                variant="outline"
                className="text-xs font-black uppercase tracking-widest"
                onClick={() =>
                  router.push(`/admin/restaurant-management/${restaurantId}`)
                }
              >
                View Page
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Restaurant Details</TabsTrigger>
              <TabsTrigger value="meals">
                Menu Items{menuItems.length > 0 ? ` (${menuItems.length})` : ""}
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
                      geoLocation: restaurant.geoLocation,
                      logoUrl: restaurant.logoUrl,
                      logoId: restaurant.logoId,
                      menuImageUrl: restaurant.menuImageUrl,
                      menuImageId: restaurant.menuImageId,
                      status: restaurant.status,
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
                    <CardTitle className="text-red-800" />
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
                        onClick={() => setDeleteDialogOpen(true)}
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
                onRefresh={refreshMenu}
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

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Restaurant"
        description={`"${restaurant?.name}" will be permanently removed along with all menu items and images. This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={saving}
        onConfirm={handleDeleteRestaurant}
      />
    </div>
  );
}
