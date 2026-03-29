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
    }

    return result;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Zod")) {
      return { success: false, error: "Validation failed: " + error.message };
    }
    return { success: false, error: "Failed to update restaurant" };
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

export async function getRestaurant(id: string) {
  return await RestaurantService.getRestaurantById(id);
}

export async function searchRestaurants(query: string) {
  return await RestaurantService.searchRestaurants(query);
}
