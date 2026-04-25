"use server";

import { revalidatePath } from "next/cache";
import { RestaurantService } from "@/services/restaurant/restaurant.service";
import { MenuItemService, RestaurantMenuService } from "@/services/menu-item/menu-item.service";
import { createRestaurantSchema } from "@/lib/validations/restaurant.validation";

/**
 * Search global menu items for the public meal search
 */
export async function searchGlobalMenuItems(query: string) {
  try {
    const items = await MenuItemService.searchMenuItems(query);
    return {
      success: true,
      data: items.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        categoryId: item.categoryId,
        category: item.category,
        imageUrl: item.imageUrl,
        tags: item.tags || [],
      })),
    };
  } catch (error) {
    console.error("Failed to search menu items:", error);
    return { success: false, error: "Failed to search menu items", data: [] };
  }
}

/**
 * Bulk submit: Creates a restaurant and all its menu items in one go.
 * This is called when the user clicks "Upload Everything".
 */
export async function bulkSubmitRestaurant(formData: FormData) {
  try {
    // 1. Extract restaurant fields
    const name = formData.get("name") as string;
    const location = formData.get("location") as string;
    const logo = formData.get("logo") as File | null;
    const menuImage = formData.get("menuImage") as File | null;
    const sourceInfoJson = formData.get("sourceInfo") as string | null;
    let sourceInfo = {};
    if (sourceInfoJson) {
      try { sourceInfo = JSON.parse(sourceInfoJson); } catch {}
    }

    // Validate core fields
    createRestaurantSchema.parse({
      name,
      location,
      status: "DRAFT",
    });

    // 2. Create the restaurant
    const restaurantResult = await RestaurantService.createRestaurant({
      name,
      location,
      status: "DRAFT",
      logo: logo && logo.size > 0 ? logo : undefined,
      menuImage: menuImage && menuImage.size > 0 ? menuImage : undefined,
      sourceInfo,
    });

    if (!restaurantResult.success || !restaurantResult.data) {
      return { success: false, error: restaurantResult.error || "Failed to create restaurant" };
    }

    const restaurantId = restaurantResult.data.id;

    // 3. Parse meals JSON from formData
    const mealsJson = formData.get("meals") as string;
    let meals: Array<{
      menuItemId: string;
      name: string;
      price: number;
      foodCategoryType?: string;
      dietaryCategory?: string;
      portionSize?: string;
      spicyLevel?: number;
      description?: string;
      ingredients?: string[];
    }> = [];

    if (mealsJson) {
      try {
        meals = JSON.parse(mealsJson);
      } catch {
        console.error("Failed to parse meals JSON");
      }
    }

    // 4. Link each meal to the restaurant
    let linkedCount = 0;
    for (const meal of meals) {
      try {
        // Also handle per-meal images
        const mealImageKey = `mealImage_${meal.menuItemId}`;
        const mealImage = formData.get(mealImageKey) as File | null;

        await RestaurantMenuService.linkMenuItemToRestaurant({
          restaurantId,
          menuItemId: meal.menuItemId,
          name: meal.name,
          price: meal.price,
          foodCategoryType: meal.foodCategoryType as any,
          dietaryCategory: meal.dietaryCategory as any,
          portionSize: meal.portionSize as any,
          spicyLevel: meal.spicyLevel,
          description: meal.description,
          ingredients: meal.ingredients || [],
          isAvailable: true,
          isPopular: false,
          isRecommended: false,
          image: mealImage && mealImage.size > 0 ? mealImage : undefined,
        });
        linkedCount++;
      } catch (err) {
        console.error(`Failed to link meal ${meal.name}:`, err);
      }
    }

    revalidatePath("/restaurants");
    revalidatePath("/Food");
    revalidatePath("/search");

    return {
      success: true,
      data: {
        restaurantId,
        restaurantName: name,
        mealsLinked: linkedCount,
        totalMeals: meals.length,
      },
    };
  } catch (error: any) {
    console.error("Bulk submit failed:", error);
    return { success: false, error: error.message || "Failed to submit restaurant" };
  }
}
