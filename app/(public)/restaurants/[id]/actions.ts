"use server";

import { RestaurantMenuService } from "@/services/menu-item/menu-item.service";

export async function getRestaurantMenuAction(params: {
  restaurantId: string;
  page: number;
  pageSize: number;
  search?: string;
  foodCategoryType?: string;
  dietaryCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  spicyLevel?: number;
  portionSize?: string;
  categoryNames?: string[];
  sortBy?: string;
}) {
  return await RestaurantMenuService.getRestaurantMenu(params);
}
