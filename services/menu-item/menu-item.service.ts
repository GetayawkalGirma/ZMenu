import {
  MenuItemRepository,
  RestaurantMenuRepository,
  CategoryRepository,
} from "@/repositories/menu-item.repository";
import { fileService } from "@/services/file/file.service";
import type {
  MenuItem,
  MealFormData,
  RestaurantMenu,
  Category,
  RestaurantImageOption,
} from "@/lib/types/meal";

export class MenuItemService {
  // Get all menu items
  static async getAllMenuItems(): Promise<MenuItem[]> {
    try {
      const items = await MenuItemRepository.getAll();
      items.forEach((item) => {
        if ((item as any).image) {
          (item as any).imageUrl = fileService.getPublicUrl(
            (item as any).image.path,
          );
        }
      });
      return items;
    } catch (error) {
      console.error("Failed to get menu items:", error);
      throw new Error("Failed to fetch menu items");
    }
  }

  // Get menu item by ID
  static async getMenuItemById(id: string): Promise<MenuItem | null> {
    try {
      const item = await MenuItemRepository.getById(id);
      if (item) {
        // Hydrate global image
        if ((item as any).image) {
          (item as any).imageUrl = fileService.getPublicUrl(
            (item as any).image.path,
          );
        }

        // Hydrate restaurant-specific images
        if ((item as any).restaurants) {
          (item as any).restaurants.forEach((rm: any) => {
            if (rm.image) {
              rm.imageUrl = fileService.getPublicUrl(rm.image.path);
            }
          });
        }
      }
      return item;
    } catch (error) {
      console.error("Failed to get menu item:", error);
      throw new Error("Failed to fetch menu item");
    }
  }

  // Search menu items
  static async searchMenuItems(query: string): Promise<MenuItem[]> {
    try {
      const items = await MenuItemRepository.search(query);
      items.forEach((item) => {
        if ((item as any).image) {
          (item as any).imageUrl = fileService.getPublicUrl(
            (item as any).image.path,
          );
        }
      });
      return items;
    } catch (error) {
      console.error("Failed to search meals:", error);
      throw new Error("Failed to search meals");
    }
  }

  static async getMenuItemsPaginated(params: {
    page: number;
    pageSize: number;
    search?: string;
    categoryId?: string;
    categoryNames?: string[];
    foodCategoryTypes?: string[];
    sortBy?: string;
    nearMe?: boolean;
    userLat?: number;
    userLng?: number;
  }): Promise<{ items: MenuItem[]; total: number; totalPages: number }> {
    try {
      const { items, total } = await MenuItemRepository.getPaginated(params);
      items.forEach((item) => {
        if ((item as any).image) {
          (item as any).imageUrl = fileService.getPublicUrl(
            (item as any).image.path,
          );
        }
      });
      return {
        items,
        total,
        totalPages: Math.ceil(total / params.pageSize),
      };
    } catch (error) {
      console.error("Failed to get paginated menu items:", error);
      throw new Error("Failed to fetch menu items");
    }
  }

  // Get menu items by category
  static async getMenuItemsByCategory(categoryId: string): Promise<MenuItem[]> {
    try {
      const items = await MenuItemRepository.getByCategory(categoryId);
      items.forEach((item) => {
        if ((item as any).image) {
          (item as any).imageUrl = fileService.getPublicUrl(
            (item as any).image.path,
          );
        }
      });
      return items;
    } catch (error) {
      console.error("Failed to get menu items by category:", error);
      throw new Error("Failed to fetch menu items by category");
    }
  }

  // Create or update menu item (Global Abstract Food)
  static async createOrUpdateMenuItem(
    data: Pick<
      MealFormData,
      | "name"
      | "description"
      | "categoryId"
      | "type"
      | "tags"
      | "image"
      | "removeImage"
    >,
  ): Promise<{ menuItem: MenuItem; isNew: boolean }> {
    try {
      let imageId: string | undefined | null;

      // Handle image upload if provided
      if (data.image && data.image instanceof File) {
        const buffer = Buffer.from(await data.image.arrayBuffer());
        const uploadedFile = await fileService.uploadFile(
          buffer,
          data.image.name,
          data.image.type,
        );
        imageId = uploadedFile.id;
      } else if (data.removeImage) {
        imageId = null; // Explicit removal
      }

      let categoryId = data.categoryId;

      // Handle fallback or named categories
      if (
        !categoryId ||
        categoryId === "temp-category" ||
        ["breakfast", "lunch", "dinner", "snack", "dessert", "drinks"].includes(
          categoryId.toLowerCase(),
        )
      ) {
        const categories = await CategoryRepository.getAll();
        const searchName =
          categoryId && categoryId !== "temp-category" ? categoryId : "Lunch";
        const category = categories.find(
          (c) => c.name.toLowerCase() === searchName.toLowerCase(),
        );

        if (category) {
          categoryId = category.id;
        } else if (categories.length > 0) {
          categoryId = categories[0].id;
        } else {
          throw new Error(
            "No categories found in the database. Please create categories first.",
          );
        }
      }

      // Check if menu item with same name and category already exists
      const existingItems = await MenuItemRepository.search(data.name);
      const existingItem = existingItems.find(
        (item) =>
          item.name.toLowerCase() === data.name.toLowerCase() &&
          item.categoryId === categoryId,
      );

      if (existingItem) {
        // Update existing item
        const updatedItem = await MenuItemRepository.update(existingItem.id, {
          name: data.name,
          description: data.description,
          categoryId,
          type: data.type,
          tags: data.tags,
          imageId:
            imageId === null
              ? null
              : (imageId ?? existingItem.imageId ?? undefined),
        });

        if ((updatedItem as any).image) {
          (updatedItem as any).imageUrl = fileService.getPublicUrl(
            (updatedItem as any).image.path,
          );
        }

        return { menuItem: updatedItem, isNew: false };
      } else {
        // Create new item
        const newItem = await MenuItemRepository.create({
          name: data.name,
          description: data.description,
          categoryId,
          type: data.type,
          tags: data.tags,
          imageId: imageId || undefined,
        });

        if ((newItem as any).image) {
          (newItem as any).imageUrl = fileService.getPublicUrl(
            (newItem as any).image.path,
          );
        }

        return { menuItem: newItem, isNew: true };
      }
    } catch (error) {
      console.error("Failed to create or update menu item:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to save menu item",
      );
    }
  }

  // Update global menu item
  static async updateMenuItem(
    id: string,
    data: Partial<
      Pick<
        MealFormData,
        "name" | "description" | "categoryId" | "tags" | "image" | "removeImage"
      >
    >,
  ): Promise<MenuItem> {
    try {
      let imageId: string | undefined | null;
      if (data.image && data.image instanceof File) {
        const buffer = Buffer.from(await data.image.arrayBuffer());
        const uploadedFile = await fileService.uploadFile(
          buffer,
          data.image.name,
          data.image.type,
        );
        imageId = uploadedFile.id;
      } else if (data.removeImage) {
        imageId = null;
      }

      const updatedItem = await MenuItemRepository.update(id, {
        ...data,
        imageId: imageId === null ? null : (imageId ?? (data as any).imageId),
      });

      if ((updatedItem as any).image) {
        (updatedItem as any).imageUrl = fileService.getPublicUrl(
          (updatedItem as any).image.path,
        );
      }

      return updatedItem;
    } catch (error) {
      console.error("Failed to update menu item:", error);
      throw new Error("Failed to update menu item");
    }
  }

  // Delete menu item
  static async deleteMenuItem(id: string): Promise<MenuItem> {
    try {
      return await MenuItemRepository.delete(id);
    } catch (error) {
      console.error("Failed to delete menu item:", error);
      throw new Error("Failed to delete menu item");
    }
  }

  // Get all categories
  static async getAllCategories(): Promise<Category[]> {
    try {
      return await CategoryRepository.getAll();
    } catch (error) {
      console.error("Failed to get categories:", error);
      throw new Error("Failed to fetch categories");
    }
  }
}

export class RestaurantMenuService {
  // Get restaurant menu with optional pagination and filtering
  static async getRestaurantMenu(params: {
    restaurantId?: string; // Optional for global food discovery
    page?: number;
    pageSize?: number;
    search?: string;
    foodCategoryType?: string;
    dietaryCategory?: string;
    minPrice?: number;
    maxPrice?: number;
    spicyLevel?: number;
    portionSize?: string;
    categoryNames?: string[];
    sortBy?: string;
    userLat?: number;
    userLng?: number;
    nearMe?: boolean;
  }): Promise<{ items: RestaurantMenu[]; total: number; totalPages: number }> {
    try {
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;

      const { items, total } = await RestaurantMenuRepository.getPaginated({
        ...params,
        page,
        pageSize,
      });

      items.forEach((rm) => {
        if ((rm as any).image) {
          (rm as any).imageUrl = fileService.getPublicUrl(
            (rm as any).image.path,
          );
        }
        if ((rm as any).menuItem?.image) {
          (rm as any).menuItem.imageUrl = fileService.getPublicUrl(
            (rm as any).menuItem.image.path,
          );
        }
      });

      return {
        items,
        total,
        totalPages: Math.ceil(total / pageSize),
      };
    } catch (error) {
      console.error("Failed to get restaurant menu:", error);
      throw new Error("Failed to fetch restaurant menu");
    }
  }

  // Link an existing global MenuItem to a restaurant with restaurant-specific details
  static async linkMenuItemToRestaurant(
    data: import("@/lib/types/meal").RestaurantMenuFormData,
  ): Promise<RestaurantMenu> {
    try {
      let imageId: string | undefined | null = data.imageId;

      if (data.image && data.image instanceof File) {
        const buffer = Buffer.from(await data.image.arrayBuffer());
        const uploadedFile = await fileService.uploadFile(
          buffer,
          data.image.name,
          data.image.type,
        );
        imageId = uploadedFile.id;
      } else if (data.removeImage) {
        imageId = null;
      }

      const globalMenuItem = await MenuItemRepository.getById(data.menuItemId);
      if (!globalMenuItem) {
        throw new Error("Selected menu item was not found.");
      }
      const variantName = (
        data.name?.trim() ||
        globalMenuItem.name?.trim() ||
        ""
      ).trim();
      if (!variantName) {
        throw new Error("Variant name is required.");
      }

      const existingVariant =
        await RestaurantMenuRepository.findRestaurantVariantByName({
          restaurantId: data.restaurantId,
          menuItemId: data.menuItemId,
          variantName,
        });
      if (existingVariant) {
        throw new Error(
          `"${variantName}" already exists for this restaurant and base menu item.`,
        );
      }

      const rm = await RestaurantMenuRepository.addMenuItemToRestaurant({
        restaurantId: data.restaurantId,
        menuItemId: data.menuItemId,
        price: data.price,
        portionSize: data.portionSize,
        spicyLevel: data.spicyLevel,
        preparationTime: data.preparationTime,
        ingredients: data.ingredients,
        calories: data.calories,
        isAvailable: data.isAvailable,
        isPopular: data.isPopular,
        isRecommended: data.isRecommended,
        sortOrder: data.sortOrder,
        name: variantName,
        description: data.description,
        foodCategoryType: data.foodCategoryType,
        dietaryCategory: data.dietaryCategory,
        imageId: imageId === null ? null : imageId,
      });

      if ((rm as any).image) {
        (rm as any).imageUrl = fileService.getPublicUrl((rm as any).image.path);
      }
      if ((rm as any).menuItem?.image) {
        (rm as any).menuItem.imageUrl = fileService.getPublicUrl(
          (rm as any).menuItem.image.path,
        );
      }
      return rm;
    } catch (error) {
      console.error("Failed to link menu item to restaurant:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to link menu item to restaurant",
      );
    }
  }

  // Add/Link a menu item to a restaurant
  static async addMenuItemToRestaurant(
    restaurantId: string,
    data: MealFormData,
  ): Promise<{
    restaurantMenu: RestaurantMenu;
    menuItem: MenuItem;
    isNew: boolean;
  }> {
    try {
      // 1. Ensure the global MenuItem exists (link or create)
      const { menuItem, isNew } = await MenuItemService.createOrUpdateMenuItem({
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        tags: data.tags,
        image: data.image,
        removeImage: data.removeImage,
      });

      let imageId: string | undefined | null;
      // Handle restaurant-specific image upload
      if (data.restImage && data.restImage instanceof File) {
        const buffer = Buffer.from(await data.restImage.arrayBuffer());
        const uploadedFile = await fileService.uploadFile(
          buffer,
          data.restImage.name,
          data.restImage.type,
        );
        imageId = uploadedFile.id;
      } else if (data.removeRestImage) {
        imageId = null;
      }

      const variantName = (
        data.restName?.trim() ||
        data.name?.trim() ||
        menuItem.name?.trim() ||
        ""
      ).trim();
      if (!variantName) {
        throw new Error("Variant name is required.");
      }

      const existingVariant =
        await RestaurantMenuRepository.findRestaurantVariantByName({
          restaurantId,
          menuItemId: menuItem.id,
          variantName,
        });
      if (existingVariant) {
        throw new Error(
          `"${variantName}" already exists for this restaurant and base menu item.`,
        );
      }

      // 2. Create new restaurant-specific link
      const restaurantMenu =
        await RestaurantMenuRepository.addMenuItemToRestaurant({
          restaurantId,
          menuItemId: menuItem.id,
          price: data.price || 0,
          portionSize: data.portionSize,
          spicyLevel: data.spicyLevel,
          preparationTime: data.preparationTime,
          ingredients: data.ingredients,
          calories: data.calories,
          isAvailable: data.isAvailable,
          isPopular: data.isPopular,
          isRecommended: data.isRecommended,
          imageUrl: data.imageUrl,
          imageId: imageId || undefined,
          sortOrder: data.sortOrder,
          name: variantName,
          description: data.restDescription || data.description,
          foodCategoryType: data.foodCategoryType,
          dietaryCategory: data.dietaryCategory,
        });

      if ((restaurantMenu as any).image) {
        (restaurantMenu as any).imageUrl = fileService.getPublicUrl(
          (restaurantMenu as any).image.path,
        );
      }

      return { restaurantMenu, menuItem, isNew };
    } catch (error) {
      console.error("Failed to add menu item to restaurant:", error);
      throw new Error("Failed to add menu item to restaurant");
    }
  }

  // Update restaurant-specific menu item
  static async updateRestaurantMenuItem(
    id: string,
    data: Partial<MealFormData>,
  ): Promise<RestaurantMenu> {
    try {
      let imageId: string | undefined | null = (data as any).imageId;
      if (data.image && data.image instanceof File) {
        const buffer = Buffer.from(await data.image.arrayBuffer());
        const uploadedFile = await fileService.uploadFile(
          buffer,
          data.image.name,
          data.image.type,
        );
        imageId = uploadedFile.id;
      } else if (data.removeImage) {
        imageId = null;
      }

      // Update restaurant-specific fields
      const updatedItem =
        await RestaurantMenuRepository.updateRestaurantMenuItem(id, {
          name: data.restName || data.name,
          description: data.restDescription || data.description,
          foodCategoryType: data.foodCategoryType,
          dietaryCategory: data.dietaryCategory,
          price: data.price,
          portionSize: data.portionSize,
          spicyLevel: data.spicyLevel,
          preparationTime: data.preparationTime,
          ingredients: data.ingredients,
          calories: data.calories,
          isAvailable: data.isAvailable,
          isPopular: data.isPopular,
          isRecommended: data.isRecommended,
          imageUrl: data.imageUrl,
          imageId: imageId === null ? null : imageId,
          sortOrder: data.sortOrder,
          menuItemId: data.menuItemId,
        });

      if ((updatedItem as any).image) {
        (updatedItem as any).imageUrl = fileService.getPublicUrl(
          (updatedItem as any).image.path,
        );
      }

      return updatedItem;
    } catch (error) {
      console.error("Failed to update restaurant menu item:", error);
      throw new Error("Failed to update restaurant menu item");
    }
  }

  // Remove menu item from restaurant
  static async removeMenuItemFromRestaurant(
    restaurantMenuId: string,
  ): Promise<RestaurantMenu> {
    try {
      return await RestaurantMenuRepository.removeMenuItemFromRestaurant(
        restaurantMenuId,
      );
    } catch (error) {
      console.error("Failed to remove menu item from restaurant:", error);
      throw new Error("Failed to remove menu item from restaurant");
    }
  }

  // Get restaurants that offer a specific menu item
  static async getRestaurantsByMenuItem(
    menuItemId: string,
  ): Promise<RestaurantMenu[]> {
    try {
      const items =
        await RestaurantMenuRepository.getRestaurantsByMenuItem(menuItemId);

      items.forEach((rm) => {
        if ((rm as any).image) {
          (rm as any).imageUrl = fileService.getPublicUrl(
            (rm as any).image.path,
          );
        }
        if ((rm as any).menuItem?.image) {
          (rm as any).menuItem.imageUrl = fileService.getPublicUrl(
            (rm as any).menuItem.image.path,
          );
        }
      });

      return items;
    } catch (error) {
      console.error("Failed to get restaurants by menu item:", error);
      throw new Error("Failed to fetch restaurants for menu item");
    }
  }

  // Get all restaurant menu items globally
  static async getAllRestaurantMenus(): Promise<RestaurantMenu[]> {
    try {
      const items = await RestaurantMenuRepository.getAll();

      items.forEach((rm) => {
        if ((rm as any).image) {
          (rm as any).imageUrl = fileService.getPublicUrl(
            (rm as any).image.path,
          );
        }
        if ((rm as any).menuItem?.image) {
          (rm as any).menuItem.imageUrl = fileService.getPublicUrl(
            (rm as any).menuItem.image.path,
          );
        }
      });

      return items;
    } catch (error) {
      console.error("Failed to get all restaurant menus:", error);
      throw new Error("Failed to fetch global restaurant menu list");
    }
  }

  // Get restaurant menu item by ID
  static async getRestaurantMenuById(id: string): Promise<RestaurantMenu | null> {
    try {
      const rm = await RestaurantMenuRepository.getById(id);
      if (rm) {
        if ((rm as any).image) {
          (rm as any).imageUrl = fileService.getPublicUrl((rm as any).image.path);
        }
        if ((rm as any).menuItem?.image) {
          (rm as any).menuItem.imageUrl = fileService.getPublicUrl(
            (rm as any).menuItem.image.path,
          );
        }
      }
      return rm;
    } catch (error) {
      console.error("Failed to get restaurant menu item:", error);
      throw new Error("Failed to fetch restaurant menu item");
    }
  }

  static async getRestaurantImagePool(
    restaurantId: string,
    excludeRestaurantMenuId?: string,
  ): Promise<RestaurantImageOption[]> {
    try {
      const imagePool = await RestaurantMenuRepository.getRestaurantImagePool(
        restaurantId,
        excludeRestaurantMenuId,
      );

      return imagePool.map((image) => ({
        ...image,
        imageUrl: fileService.getPublicUrl(image.imageUrl),
      }));
    } catch (error) {
      console.error("Failed to get restaurant image pool:", error);
      throw new Error("Failed to fetch restaurant image pool");
    }
  }

  static async swapRestaurantMenuImage(
    restaurantMenuId: string,
    imageId: string,
  ): Promise<RestaurantMenu> {
    try {
      const restaurantMenu = await RestaurantMenuRepository.updateRestaurantMenuItem(
        restaurantMenuId,
        { imageId },
      );

      if ((restaurantMenu as any).image) {
        (restaurantMenu as any).imageUrl = fileService.getPublicUrl(
          (restaurantMenu as any).image.path,
        );
      }

      return restaurantMenu;
    } catch (error) {
      console.error("Failed to swap restaurant menu image:", error);
      throw new Error("Failed to swap restaurant menu image");
    }
  }
}
