"use server";

import { revalidatePath } from "next/cache";
import { RestaurantService } from "@/services/restaurant/restaurant.service";
import {
  createRestaurantSchema,
  updateRestaurantSchema,
} from "@/lib/validations/restaurant.validation";
import type {
  CreateRestaurantInput,
  UpdateRestaurantInput,
} from "@/lib/validations/restaurant.validation";

// Server Actions - Validation layer + Service calls
export async function createRestaurant(data: CreateRestaurantInput) {
  try {
    // Validate input with Zod
    const validatedData = createRestaurantSchema.parse(data);

    // Call service (no validation there)
    const result = await RestaurantService.createRestaurant(validatedData);

    if (result.success) {
      revalidatePath("/admin/restaurant-management");
    }

    return result;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Zod")) {
      return { success: false, error: "Validation failed: " + error.message };
    }
    return { success: false, error: "Failed to create restaurant" };
  }
}

export async function updateRestaurant(
  id: string,
  data: UpdateRestaurantInput,
) {
  try {
    // Validate input with Zod
    const validatedData = updateRestaurantSchema.parse(data);

    // Call service (no validation there)
    const result = await RestaurantService.updateRestaurant(id, validatedData);

    if (result.success) {
      revalidatePath("/admin/restaurant-management");
      revalidatePath(`/admin/restaurant-management/${id}`);
    }

    return result;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Zod")) {
      return { success: false, error: "Validation failed: " + error.message };
    }
    return { success: false, error: "Failed to update restaurant" };
  }
}

export async function toggleRestaurantStatus(id: string, currentStatus: string) {
  try {
    const newStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    
    // We can skip full validation here as we are only changing the status
    const result = await RestaurantService.updateRestaurant(id, { 
      status: newStatus as any 
    } as any);

    if (result.success) {
      revalidatePath("/admin/restaurant-management");
      revalidatePath(`/admin/restaurant-management/${id}`);
    }

    return result;
  } catch (error) {
    return { success: false, error: "Failed to toggle restaurant status" };
  }
}

export async function deleteRestaurant(id: string) {
  const result = await RestaurantService.deleteRestaurant(id);

  if (result.success) {
    revalidatePath("/admin/restaurant-management");
  }

  return result;
}

export async function getRestaurants() {
  return await RestaurantService.getAllRestaurants();
}

export async function getPaginatedRestaurants(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
}) {
  return await RestaurantService.getRestaurantsPaginated(params);
}

export async function getRestaurant(id: string) {
  return await RestaurantService.getRestaurantById(id);
}

export async function searchRestaurants(query: string) {
   return await RestaurantService.searchRestaurants(query);
}
 
export async function calculateCoordinates(id: string) {
  try {
    const res = await RestaurantService.getRestaurantById(id);
    if (!res.success || !res.data) return { success: false, error: "Restaurant not found" };
    
    // This will trigger the extractCoordinates logic in the service
    const result = await RestaurantService.updateRestaurant(id, {
      geoLocation: (res.data as any).geoLocation
    } as any);
 
    if (result.success) {
      revalidatePath(`/admin/restaurant-management/${id}`);
    }
    return result;
  } catch (error) {
    return { success: false, error: "Failed to calculate coordinates" };
  }
}
