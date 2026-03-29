"use server";

import {
  MenuItemService,
  RestaurantMenuService,
} from "@/services/menu-item/menu-item.service";
import { revalidatePath } from "next/cache";
import type { MealFormData, MenuItem, Category } from "@/lib/types/meal";

export async function getPaginatedMeals(params: {
  page: number;
  pageSize: number;
  search?: string;
  categoryId?: string;
}) {
  try {
    const result = await MenuItemService.getMenuItemsPaginated(params);
    return {
      success: true,
      data: result.items,
      total: result.total,
      totalPages: result.totalPages,
    };
  } catch (error) {
    console.error("Failed to get paginated meals:", error);
    return { success: false, error: "Failed to fetch meals", data: [] as MenuItem[], total: 0, totalPages: 0 };
  }
}

export async function getCategories() {
  try {
    const categories = await MenuItemService.getAllCategories();
    return { success: true, data: categories };
  } catch (error) {
    console.error("Failed to get categories:", error);
    return { success: false, error: "Failed to fetch categories", data: [] as Category[] };
  }
}

export async function getAllMeals() {
  try {
    const meals = await MenuItemService.getAllMenuItems();
    return { success: true, data: meals };
  } catch (error) {
    console.error("Failed to get meals:", error);
    return { success: false, error: "Failed to fetch meals" };
  }
}

export async function getMealById(id: string) {
  try {
    const meal = await MenuItemService.getMenuItemById(id);
    return { success: true, data: meal };
  } catch (error) {
    console.error("Failed to get meal:", error);
    return { success: false, error: "Failed to fetch meal" };
  }
}

// Search meals
export async function searchMeals(query: string) {
  try {
    const meals = await MenuItemService.searchMenuItems(query);
    return { success: true, data: meals };
  } catch (error) {
    console.error("Failed to search meals:", error);
    return { success: false, error: "Failed to search meals" };
  }
}

// Create new meal
export async function createMeal(data: MealFormData) {
  try {
    const result = await MenuItemService.createOrUpdateMenuItem(data);
    revalidatePath("/admin/meals");
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to create meal:", error);
    return { success: false, error: "Failed to create meal" };
  }
}

// Update meal
export async function updateMeal(id: string, data: Partial<MealFormData>) {
  try {
    const meal = await MenuItemService.updateMenuItem(id, data);
    revalidatePath("/admin/meals");
    return { success: true, data: meal };
  } catch (error) {
    console.error("Failed to update meal:", error);
    return { success: false, error: "Failed to update meal" };
  }
}

// Delete meal
export async function deleteMeal(id: string) {
  try {
    const meal = await MenuItemService.deleteMenuItem(id);
    revalidatePath("/admin/meals");
    return { success: true, data: meal };
  } catch (error) {
    console.error("Failed to delete meal:", error);
    return { success: false, error: "Failed to delete meal" };
  }
}

// Get restaurants that serve this meal
export async function getRestaurantsForMeal(mealId: string) {
  try {
    const restaurants =
      await RestaurantMenuService.getRestaurantsByMenuItem(mealId);
    return { success: true, data: restaurants };
  } catch (error) {
    console.error("Failed to get restaurants for meal:", error);
    return { success: false, error: "Failed to fetch restaurants for meal" };
  }
}
