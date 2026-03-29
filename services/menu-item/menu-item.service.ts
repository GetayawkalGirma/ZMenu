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
} from "@/lib/types/meal";

export class MenuItemService {
  // Get all menu items
  static async getAllMenuItems(): Promise<MenuItem[]> {
    try {
      return await MenuItemRepository.getAll();
    } catch (error) {
      console.error("Failed to get menu items:", error);
      throw new Error("Failed to fetch menu items");
    }
  }

  // Get menu item by ID
  static async getMenuItemById(id: string): Promise<MenuItem | null> {
    try {
      return await MenuItemRepository.getById(id);
    } catch (error) {
      console.error("Failed to get menu item:", error);
      throw new Error("Failed to fetch menu item");
    }
  }

  // Search menu items
  static async searchMenuItems(query: string): Promise<MenuItem[]> {
    try {
      return await MenuItemRepository.search(query);
    } catch (error) {
      console.error("Failed to search meals:", error);
      throw new Error("Failed to search meals");
    }
  }

  // Get menu items by category
  static async getMenuItemsByCategory(categoryId: string): Promise<MenuItem[]> {
    try {
      return await MenuItemRepository.getByCategory(categoryId);
    } catch (error) {
      console.error("Failed to get menu items by category:", error);
      throw new Error("Failed to fetch menu items by category");
    }
  }

  // Create or update menu item (Global Abstract Food)
  static async createOrUpdateMenuItem(
    data: Pick<MealFormData, "name" | "description" | "categoryId" | "tags" | "image" | "removeImage">,
  ): Promise<{ menuItem: MenuItem; isNew: boolean }> {
    try {
      let imageId: string | undefined | null;

      // Handle image upload if provided
      if (data.image && data.image instanceof File) {
        const buffer = Buffer.from(await data.image.arrayBuffer());
        const uploadedFile = await fileService.uploadFile(
          buffer,
          data.image.name,
          data.image.type
        );
        imageId = uploadedFile.id;
      } else if (data.removeImage) {
        imageId = null; // Explicit removal
      }

      let categoryId = data.categoryId;

      // Handle fallback or named categories
      if (!categoryId || categoryId === "temp-category" || ["breakfast", "lunch", "dinner", "snack", "dessert", "drinks"].includes(categoryId.toLowerCase())) {
        const categories = await CategoryRepository.getAll();
        const searchName = categoryId && categoryId !== "temp-category" ? categoryId : "Lunch";
        const category = categories.find(c => c.name.toLowerCase() === searchName.toLowerCase());
        
        if (category) {
          categoryId = category.id;
        } else if (categories.length > 0) {
          categoryId = categories[0].id;
        } else {
          throw new Error("No categories found in the database. Please create categories first.");
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
          tags: data.tags,
          imageId: imageId === null ? null : (imageId ?? existingItem.imageId ?? undefined),
        });

        return { menuItem: updatedItem, isNew: false };
      } else {
        // Create new item
        const newItem = await MenuItemRepository.create({
          name: data.name,
          description: data.description,
          categoryId,
          tags: data.tags,
          imageId: imageId || undefined,
        });

        return { menuItem: newItem, isNew: true };
      }
    } catch (error) {
      console.error("Failed to create or update menu item:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to save menu item");
    }
  }

  // Update global menu item
  static async updateMenuItem(
    id: string,
    data: Partial<Pick<MealFormData, "name" | "description" | "categoryId" | "tags" | "image" | "removeImage">>,
  ): Promise<MenuItem> {
    try {
      let imageId: string | undefined | null;
      if (data.image && data.image instanceof File) {
        const buffer = Buffer.from(await data.image.arrayBuffer());
        const uploadedFile = await fileService.uploadFile(
          buffer,
          data.image.name,
          data.image.type
        );
        imageId = uploadedFile.id;
      } else if (data.removeImage) {
        imageId = null;
      }

      return await MenuItemRepository.update(id, {
        ...data,
        imageId: imageId === null ? null : (imageId ?? (data as any).imageId),
      });
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
  // Get restaurant menu
  static async getRestaurantMenu(
    restaurantId: string,
  ): Promise<RestaurantMenu[]> {
    try {
      return await RestaurantMenuRepository.getRestaurantMenuItems(
        restaurantId,
      );
    } catch (error) {
      console.error("Failed to get restaurant menu:", error);
      throw new Error("Failed to fetch restaurant menu");
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
          data.restImage.type
        );
        imageId = uploadedFile.id;
      } else if (data.removeRestImage) {
        imageId = null;
      }

      // 2. Check if this restaurant already has this menu item
      const existingRestaurantMenu = await RestaurantMenuRepository.getRestaurantMenuItems(restaurantId);
      const existingLinkIdx = existingRestaurantMenu.findIndex(rm => rm.menuItemId === menuItem.id);

      if (existingLinkIdx > -1) {
        const existingLink = existingRestaurantMenu[existingLinkIdx];
        // Update existing restaurant-specific details
        const updatedRestaurantMenu = await RestaurantMenuRepository.updateRestaurantMenuItem(
          existingLink.id,
          {
            price: data.price,
            portionSize: data.portionSize,
            spicyLevel: data.spicyLevel,
            preparationTime: data.preparationTime,
            ingredients: data.ingredients,
            calories: data.calories,
            isAvailable: data.isAvailable ?? true,
            isPopular: data.isPopular,
            isRecommended: data.isRecommended,
            imageUrl: data.imageUrl,
            imageId: imageId === null ? null : (imageId ?? existingLink.imageId ?? undefined),
            sortOrder: data.sortOrder,
          }
        );

        return {
          restaurantMenu: updatedRestaurantMenu,
          menuItem,
          isNew: false,
        };
      } else {
        // Create new restaurant-specific link
        const restaurantMenu = await RestaurantMenuRepository.addMenuItemToRestaurant({
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
        });

        return { restaurantMenu, menuItem, isNew };
      }
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
      let imageId: string | undefined | null;
      if (data.image && data.image instanceof File) {
        const buffer = Buffer.from(await data.image.arrayBuffer());
        const uploadedFile = await fileService.uploadFile(
          buffer,
          data.image.name,
          data.image.type
        );
        imageId = uploadedFile.id;
      } else if (data.removeImage) {
        imageId = null;
      }

      // Update restaurant-specific fields
      return await RestaurantMenuRepository.updateRestaurantMenuItem(id, {
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
        imageId: imageId === null ? null : (imageId ?? (data as any).imageId),
        sortOrder: data.sortOrder,
      });
    } catch (error) {
      console.error("Failed to update restaurant menu item:", error);
      throw new Error("Failed to update restaurant menu item");
    }
  }

  // Remove menu item from restaurant
  static async removeMenuItemFromRestaurant(
    restaurantId: string,
    menuItemId: string,
  ): Promise<RestaurantMenu> {
    try {
      return await RestaurantMenuRepository.removeMenuItemFromRestaurant(
        restaurantId,
        menuItemId,
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
      return await RestaurantMenuRepository.getRestaurantsByMenuItem(
        menuItemId,
      );
    } catch (error) {
      console.error("Failed to get restaurants by menu item:", error);
      throw new Error("Failed to fetch restaurants for menu item");
    }
  }
}
