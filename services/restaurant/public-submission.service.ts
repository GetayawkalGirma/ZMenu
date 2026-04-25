import { RestaurantService } from "./restaurant.service";
import { RestaurantMenuService } from "../menu-item/menu-item.service";
import { RestaurantMenuRepository } from "@/repositories/menu-item.repository";
import { revalidatePath } from "next/cache";

export class PublicSubmissionService {
  /**
   * High-performance submission for public users.
   * Handles restaurant creation, multi-page menu uploads, and bulk meal linking
   * with concurrency control to prevent DB timeouts.
   */
  static async submitRestaurant(data: {
    name: string;
    location: string;
    geoLocation?: string;
    logo?: File;
    menuImage?: File; // Primary
    menuImages?: File[]; // All pages
    sourceInfo?: any;
    meals: any[];
    mealImages: Map<string, File>; // localId -> File
  }) {
    // 1. Create the restaurant (Primary images)
    // RestaurantService.createRestaurant already handles LOGO and MENU registration
    const restaurantResult = await RestaurantService.createRestaurant({
      name: data.name,
      location: data.location,
      geoLocation: data.geoLocation,
      status: "DRAFT",
      logo: data.logo,
      menuImage: data.menuImage,
      menuImages: data.menuImages,
      sourceInfo: data.sourceInfo,
    } as any);

    if (!restaurantResult.success || !restaurantResult.data) {
      throw new Error(restaurantResult.error || "Failed to create restaurant");
    }

    const restaurantId = restaurantResult.data.id;

    // 2. Link meals in batches to prevent DB connection pool exhaustion
    const BATCH_SIZE = 5;
    let linkedCount = 0;

    for (let i = 0; i < data.meals.length; i += BATCH_SIZE) {
      const batch = data.meals.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async (meal) => {
        try {
          const mealImage = data.mealImages.get(meal.localId);

          const rm = await RestaurantMenuService.linkMenuItemToRestaurant({
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

          // Enrich Image Library with MEAL usage type
          if (rm && (rm as any).imageId) {
            await RestaurantMenuRepository.rememberRestaurantImage({
              restaurantId,
              imageId: (rm as any).imageId,
              sourceRestaurantMenuId: rm.id,
              usageType: "MEAL",
            });
          }

          return true;
        } catch (err) {
          console.error(`Failed to link meal ${meal.name}:`, err);
          return false;
        }
      });

      const results = await Promise.all(batchPromises);
      linkedCount += results.filter(Boolean).length;
    }

    // 3. Revalidate paths
    revalidatePath("/restaurants");
    revalidatePath("/Food");
    revalidatePath("/search");

    return {
      restaurantId,
      restaurantName: data.name,
      mealsLinked: linkedCount,
      totalMeals: data.meals.length,
    };
  }
}
