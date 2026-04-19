"use server";

import { RestaurantService } from "@/services/restaurant/restaurant.service";

export async function getRestaurantsAction(params: {
  page: number;
  pageSize: number;
  search?: string;
  categoryNames?: string[];
  featureNames?: string[];
  sortBy?: string;
}) {
  return await RestaurantService.getRestaurantsPaginated({
    ...params,
    status: "PUBLISHED", // Public view only sees published restaurants
  });
}
