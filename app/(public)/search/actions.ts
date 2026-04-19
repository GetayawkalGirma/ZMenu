"use server";

import { MenuItemService } from "@/services/menu-item/menu-item.service";

export async function getMenuItemsAction(params: {
  page: number;
  pageSize: number;
  search?: string;
  categoryNames?: string[];
  foodCategoryTypes?: string[];
  nearMe?: boolean;
  userLat?: number;
  userLng?: number;
}) {
  return await MenuItemService.getMenuItemsPaginated(params);
}
