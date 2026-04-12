"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RestaurantForm } from "@/components/restaurant/RestaurantForm";
import { AddRestaurantMenu } from "@/components/meal/AddRestaurantMenu";
import { createRestaurant } from "../actions";
import { linkMenuItemToRestaurant, getRestaurantMenu } from "../menu-item-actions";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,
  Button,
  Card,
  CardContent,
} from "@/components/ui";
import type { RestaurantFormData } from "@/lib/types/restaurant";
import type { RestaurantMenu, RestaurantMenuFormData } from "@/lib/types/meal";

export default function NewRestaurantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [createdRestaurantId, setCreatedRestaurantId] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<RestaurantMenu[]>([]);

  const handleRestaurantSubmit = async (data: RestaurantFormData & { featureIds?: string[] }) => {
    setLoading(true);
    try {
      const restaurantInput = {
        ...data,
        status: "DRAFT" as const,
        noiselevel: data.features.noiseLevel,
        privacylevel: data.features.privacyLevel,
        featureIds: data.featureIds || [],
      };

      const result = await createRestaurant(restaurantInput);

      if (result.success && result.data) {
        setCreatedRestaurantId(result.data.id);
        alert(`Restaurant "${data.name}" created successfully! You can now add menu items.`);
      } else {
        alert(`Failed to create restaurant: ${result.error}`);
      }
    } catch {
      alert("Failed to create restaurant");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMenuItem = async (data: RestaurantMenuFormData) => {
    if (!createdRestaurantId) {
      alert("Please create the restaurant first before adding menu items.");
      return;
    }

    const result = await linkMenuItemToRestaurant({
      ...data,
      restaurantId: createdRestaurantId,
    });

    if (result.success && result.data) {
      const menuResult = await getRestaurantMenu(createdRestaurantId);
      if (menuResult.success && menuResult.data) {
        setMenuItems(menuResult.data);
      }
    } else {
      alert(`Failed to add menu item: ${result.error}`);
      throw new Error(result.error);
    }
  };

  const handleDeleteMenuItem = async (restaurantMenuId: string) => {
    if (!createdRestaurantId) return;
    if (!confirm("Remove this item from the restaurant?")) return;

    const { removeMenuItemFromRestaurant } = await import("../menu-item-actions");
    const result = await removeMenuItemFromRestaurant(
      createdRestaurantId,
      restaurantMenuId,
    );
    if (result.success) {
      setMenuItems((prev) => prev.filter((item) => item.id !== restaurantMenuId));
    } else {
      alert(`Failed to remove: ${result.error}`);
    }
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
                <Badge variant="outline">DRAFT</Badge>
              </div>
              <p className="mt-2 text-gray-600">
                Fill in the restaurant details, add features, and build the menu.
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push("/admin/restaurant-management")}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="restaurant" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="restaurant">Restaurant Details</TabsTrigger>
              <TabsTrigger value="meals" disabled={!createdRestaurantId}>
                Menu Items {menuItems.length > 0 && `(${menuItems.length})`}
              </TabsTrigger>
            </TabsList>

            {/* Restaurant Details Tab */}
            <TabsContent value="restaurant">
              <Card>
                <CardContent className="pt-6">
                  <RestaurantForm
                    mode="create"
                    onSubmit={handleRestaurantSubmit}
                    loading={loading}
                  />

                  {createdRestaurantId && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                      <p className="text-sm text-green-800 font-medium">
                        Restaurant created. Switch to the Menu Items tab to add meals.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Menu Items Tab */}
            <TabsContent value="meals">
              {createdRestaurantId ? (
                <AddRestaurantMenu
                  restaurantId={createdRestaurantId}
                  existingItems={menuItems}
                  onAdd={handleAddMenuItem}
                  onDelete={handleDeleteMenuItem}
                  loading={loading}
                />
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-10">
                      <div className="text-gray-300 text-5xl mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto"><path d="m5 11 4-7"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4c.2.8.9 1.2 1.7 1.2h10.4c.8 0 1.5-.4 1.7-1.2l1.6-7.4"/><path d="m9 11 1 9"/><path d="m15 11-1 9"/></svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        Create the restaurant first
                      </h3>
                      <p className="text-sm text-gray-500">
                        Fill in restaurant details in the first tab, then add menu items here.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
