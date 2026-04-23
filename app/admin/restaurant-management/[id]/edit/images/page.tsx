// Server Component — no "use client".
// Fetches restaurant, menu, and image pool on the server so the full UI
// arrives pre-rendered with data — no loading spinner on first paint.

import { getRestaurant } from "../../../actions";
import { getRestaurantMenu, getRestaurantImagePool } from "../../../menu-item-actions";
import ImageLibraryClient from "./ImageLibraryClient";
import { Button } from "@/components/ui";
import Link from "next/link";

export default async function ImageLibraryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [restaurantResult, menuResult, poolResult] = await Promise.all([
    getRestaurant(id),
    getRestaurantMenu(id),
    getRestaurantImagePool(id),
  ]);

  if (!restaurantResult.success || !restaurantResult.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-black text-gray-900 mb-2 uppercase">
            Restaurant not found
          </h1>
          <p className="text-gray-500 mb-6">
            {restaurantResult.error || "This restaurant does not exist."}
          </p>
          <Link href="/admin/restaurant-management">
            <Button>Back to Restaurants</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ImageLibraryClient
      restaurantId={id}
      initialRestaurant={restaurantResult.data}
      initialMenuItems={menuResult.data?.items || []}
      initialImagePool={poolResult.data || []}
    />
  );
}
