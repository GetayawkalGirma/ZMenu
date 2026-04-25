"use server";

import { revalidatePath } from "next/cache";
import { RestaurantService } from "@/services/restaurant/restaurant.service";
import { MenuItemService, RestaurantMenuService } from "@/services/menu-item/menu-item.service";
import { createRestaurantSchema } from "@/lib/validations/restaurant.validation";
import { PublicSubmissionService } from "@/services/restaurant/public-submission.service";

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
 */
export async function bulkSubmitRestaurant(formData: FormData) {
  try {
    // 1. Extract restaurant fields
    const name = formData.get("name") as string;
    const location = formData.get("location") as string;
    const geoLocation = formData.get("geoLocation") as string | null;
    const logo = formData.get("logo") as File | null;
    const menuImage = formData.get("menuImage") as File | null;
    const menuImages = formData.getAll("menuImages") as File[];
    const sourceInfoJson = formData.get("sourceInfo") as string | null;
    
    let sourceInfo = {};
    if (sourceInfoJson) {
      try { sourceInfo = JSON.parse(sourceInfoJson); } catch {}
    }

    // Validate core fields
    createRestaurantSchema.parse({
      name,
      location,
      geoLocation: geoLocation || undefined,
      status: "DRAFT",
    });

    // 2. Parse meals JSON
    const mealsJson = formData.get("meals") as string;
    let meals: any[] = [];
    if (mealsJson) {
      try { meals = JSON.parse(mealsJson); } catch {}
    }

    // 3. Map meal images from formData
    const mealImagesMap = new Map<string, File>();
    meals.forEach((meal) => {
      const file = formData.get(`mealImage_${meal.localId}`) as File | null;
      if (file && file.size > 0) {
        mealImagesMap.set(meal.localId, file);
      }
    });

    // 4. Delegate to specialized PublicSubmissionService
    const result = await PublicSubmissionService.submitRestaurant({
      name,
      location,
      geoLocation: geoLocation || undefined,
      logo: logo && logo.size > 0 ? logo : undefined,
      menuImage: menuImage && menuImage.size > 0 ? menuImage : undefined,
      menuImages: menuImages.filter(f => f.size > 0),
      sourceInfo,
      meals,
      mealImages: mealImagesMap,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error("Bulk submit failed:", error);
    return { success: false, error: error.message || "Failed to submit restaurant" };
  }
}
