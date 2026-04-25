import { RestaurantRepository } from "@/repositories/restaurant.repository";
import { RestaurantMenuRepository } from "@/repositories/menu-item.repository";
import { fileService } from "@/services/file/file.service";
import type {
  CreateRestaurantInput,
  UpdateRestaurantInput,
} from "@/lib/validations/restaurant.validation";
import type { Restaurant } from "@/repositories/restaurant.repository";

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Restaurant Service - Business Logic Layer (NO VALIDATION HERE)
export class RestaurantService {
  // Create restaurant
  static async createRestaurant(
    data: CreateRestaurantInput,
  ): Promise<ServiceResult<Restaurant>> {
    try {
      let logoId: string | undefined = (data as any).logoId;
      let menuImageId: string | undefined = (data as any).menuImageId;

      // Handle logo upload
      if (data.logo && data.logo instanceof File) {
        const buffer = Buffer.from(await data.logo.arrayBuffer());
        const uploadedFile = await fileService.uploadFile(
          buffer,
          data.logo.name,
          data.logo.type
        );
        logoId = uploadedFile.id;
      }

      // Handle menu image upload (primary)
      if (data.menuImage && data.menuImage instanceof File) {
        const buffer = Buffer.from(await data.menuImage.arrayBuffer());
        const uploadedFile = await fileService.uploadFile(
          buffer,
          data.menuImage.name,
          data.menuImage.type
        );
        menuImageId = uploadedFile.id;
      }

      // Handle multiple menu images (all pages)
      const menuImageIds: string[] = [];
      if (data.menuImages && Array.isArray(data.menuImages)) {
        for (const file of data.menuImages) {
          if (file instanceof File) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const uploadedFile = await fileService.uploadFile(
              buffer,
              file.name,
              file.type
            );
            menuImageIds.push(uploadedFile.id);
          }
        }
      }

      // Extract coordinates from geoLocation iframe
      const coords = this.extractCoordinates(data.geoLocation);

      // No validation - just business logic
      const restaurant = await RestaurantRepository.create({
        ...data,
        logoId,
        menuImageId,
        sourceInfo: (data as any).sourceInfo,
        latitude: coords?.lat,
        longitude: coords?.lng,
      } as any);

      // Hydrate URLs
      if (restaurant) {
        const logo = (restaurant as any).logo;
        const menuImage = (restaurant as any).menuImage;
        if (logo) (restaurant as any).logoUrl = fileService.getPublicUrl(logo.path);
        if (menuImage) (restaurant as any).menuImageUrl = fileService.getPublicUrl(menuImage.path);

        // Register in image library
        if (logoId) {
          await RestaurantMenuRepository.rememberRestaurantImage({
            restaurantId: restaurant.id,
            imageId: logoId,
            usageType: "LOGO",
          });
        }
        
        // Register ALL menu images (including the primary if it's in the list)
        // Note: we use a Set to avoid double-registering if the primary was also in the multi-list
        const allMenuIds = new Set(menuImageIds);
        if (menuImageId) allMenuIds.add(menuImageId);

        for (const id of allMenuIds) {
          await RestaurantMenuRepository.rememberRestaurantImage({
            restaurantId: restaurant.id,
            imageId: id,
            usageType: "MENU",
          });
        }
      }

      return { success: true, data: restaurant };
    } catch (error) {
      console.error("RestaurantService.createRestaurant error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create restaurant",
      };
    }
  }

  // Update restaurant
  static async updateRestaurant(
    id: string,
    data: UpdateRestaurantInput,
  ): Promise<ServiceResult<Restaurant>> {
    try {
      let logoId: string | undefined | null = (data as any).logoId;
      let menuImageId: string | undefined | null = (data as any).menuImageId;

      // Check existing restaurant to avoid losing IDs if they're not provided in update
      const existing = (await RestaurantRepository.getById(id)) as any;

      // Handle logo upload
      if (data.logo && data.logo instanceof File) {
        const buffer = Buffer.from(await data.logo.arrayBuffer());
        const uploadedFile = await fileService.uploadFile(
          buffer,
          data.logo.name,
          data.logo.type
        );
        logoId = uploadedFile.id;
      } else if (data.removeLogo) {
        logoId = null;
      }

      // Handle menu image upload
      if (data.menuImage && data.menuImage instanceof File) {
        const buffer = Buffer.from(await data.menuImage.arrayBuffer());
        const uploadedFile = await fileService.uploadFile(
          buffer,
          data.menuImage.name,
          data.menuImage.type
        );
        menuImageId = uploadedFile.id;
      } else if (data.removeMenuImage) {
        menuImageId = null;
      }

      // Extract coordinates from geoLocation iframe
      const coords = this.extractCoordinates(data.geoLocation);

      // No validation - just business logic
      const restaurant = await RestaurantRepository.update(id, {
        ...data,
        logoId: logoId === null ? null : (logoId ?? existing?.logoId),
        menuImageId: menuImageId === null ? null : (menuImageId ?? existing?.menuImageId),
        latitude: coords?.lat ?? existing?.latitude,
        longitude: coords?.lng ?? existing?.longitude,
      } as any);

      // Hydrate URLs
      if (restaurant) {
        const logo = (restaurant as any).logo;
        const menuImage = (restaurant as any).menuImage;
        if (logo) (restaurant as any).logoUrl = fileService.getPublicUrl(logo.path);
        if (menuImage) (restaurant as any).menuImageUrl = fileService.getPublicUrl(menuImage.path);

        // Register in image library
        if (logoId) {
          await RestaurantMenuRepository.rememberRestaurantImage({
            restaurantId: id,
            imageId: logoId,
          });
        }
        if (menuImageId) {
          await RestaurantMenuRepository.rememberRestaurantImage({
            restaurantId: id,
            imageId: menuImageId,
          });
        }
      }

      return { success: true, data: restaurant };
    } catch (error) {
      console.error("RestaurantService.updateRestaurant error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update restaurant",
      };
    }
  }

  // Delete restaurant
  static async deleteRestaurant(id: string): Promise<ServiceResult<void>> {
    try {
      // 1. Fetch restaurant with all files to clean up
      const restaurant = (await RestaurantRepository.getById(id)) as any;
      if (!restaurant) {
        return { success: false, error: "Restaurant not found" };
      }

      // 2. Collect all file IDs associated with this restaurant
      const fileIds = new Set<string>();
      if (restaurant.logoId) fileIds.add(restaurant.logoId);
      if (restaurant.menuImageId) fileIds.add(restaurant.menuImageId);
      
      // Collect images from the restaurant's menu items
      if (restaurant.menuItems) {
        restaurant.menuItems.forEach((rm: any) => {
          if (rm.imageId) fileIds.add(rm.imageId);
        });
      }

      // 3. Delete files from storage and DB (with reference counting in fileService)
      for (const fileId of fileIds) {
        try {
          await fileService.deleteFile(fileId);
        } catch (fileError) {
          console.error(`Failed to delete file ${fileId}:`, fileError);
          // Continue with other files/deletion even if one file fails
        }
      }

      // 4. Delete the restaurant record (cascades to RestaurantMenu and assignments)
      await RestaurantRepository.delete(id);

      return { success: true };
    } catch (error) {
      console.error("RestaurantService.deleteRestaurant error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete restaurant",
      };
    }
  }

  // Get paginated restaurants with advanced search/filter
  static async getRestaurantsPaginated(params: {
    page: number;
    pageSize: number;
    search?: string;
    status?: string;
    categoryNames?: string[];
    featureNames?: string[];
    sortBy?: string;
    userLat?: number;
    userLng?: number;
    nearMe?: boolean;
  }): Promise<ServiceResult<{ items: Restaurant[]; total: number; totalPages: number }>> {
    try {
      const { items, total } = await RestaurantRepository.getPaginated(params);

      items.forEach((r) => {
        const res = r as any;
        if (res.logo) res.logoUrl = fileService.getPublicUrl(res.logo.path);
        if (res.menuImage) res.menuImageUrl = fileService.getPublicUrl(res.menuImage.path);

        const menuItems = res.menuItems || [];
        res.mealCount = menuItems.length;

        const prices = menuItems.map((mi: any) => mi.price).filter((p: any) => typeof p === "number");
        res.avgPrice = prices.length > 0 ? prices.reduce((a: number, b: number) => a + b, 0) / prices.length : 0;

        const categoryNames = new Set<string>();
        menuItems.forEach((mi: any) => {
          if (mi.menuItem?.category?.name) categoryNames.add(mi.menuItem.category.name);
        });
        res.categories = Array.from(categoryNames);

        if (res.features) {
          res.featureLabels = res.features.map((f: any) => f.feature?.name).filter(Boolean);
        }
      });

      return {
        success: true,
        data: { items, total, totalPages: Math.ceil(total / params.pageSize) },
      };
    } catch (error) {
      console.error("RestaurantService.getRestaurantsPaginated error:", error);
      return { success: false, error: "Failed to fetch restaurants" };
    }
  }

  // Get featured (published) restaurants for home page
  static async getFeaturedRestaurants(limit = 3): Promise<ServiceResult<Restaurant[]>> {
    try {
      const restaurants = await RestaurantRepository.getPaginated({
        page: 1,
        pageSize: limit,
        status: "PUBLISHED",
        sortBy: "newest"
      });
      
      const items = restaurants.items;
      items.forEach(r => {
        const res = r as any;
        if (res.logo) res.logoUrl = fileService.getPublicUrl(res.logo.path);
        if (res.menuImage) res.menuImageUrl = fileService.getPublicUrl(res.menuImage.path);
      });

      return { success: true, data: items };
    } catch (error) {
      console.error("RestaurantService.getFeaturedRestaurants error:", error);
      return { success: false, error: "Failed to fetch featured restaurants" };
    }
  }

  // Get all restaurants
  static async getAllRestaurants(): Promise<ServiceResult<Restaurant[]>> {
    try {
      const restaurants = await RestaurantRepository.getAll();
      
      // Hydrate URLs and Metrics
      restaurants.forEach(r => {
        const res = r as any;
        
        // Hydrate URLs
        if (res.logo) res.logoUrl = fileService.getPublicUrl(res.logo.path);
        if (res.menuImage) res.menuImageUrl = fileService.getPublicUrl(res.menuImage.path);

        // Compute Metrics
        const menuItems = res.menuItems || [];
        res.mealCount = menuItems.length;
        
        // Average Price
        const prices = menuItems.map((mi: any) => mi.price).filter((p: any) => typeof p === 'number');
        res.avgPrice = prices.length > 0 ? prices.reduce((a: number, b: number) => a + b, 0) / prices.length : 0;
        
        // Unique Categories
        const categoryNames = new Set<string>();
        menuItems.forEach((mi: any) => {
          if (mi.menuItem?.category?.name) {
            categoryNames.add(mi.menuItem.category.name);
          }
        });
        res.categories = Array.from(categoryNames);

        // Features simplified for UI
        if (res.features) {
          res.featureLabels = res.features.map((f: any) => f.feature?.name).filter(Boolean);
        }
      });

      return { success: true, data: restaurants };
    } catch (error) {
      console.error("RestaurantService.getAllRestaurants error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch restaurants",
      };
    }
  }

  // Get restaurant by ID
  static async getRestaurantById(
    id: string,
  ): Promise<ServiceResult<Restaurant>> {
    try {
      const restaurant = await RestaurantRepository.getById(id);

      if (!restaurant) {
        return { success: false, error: "Restaurant not found" };
      }

      // Hydrate URLs
      const res = restaurant as any;
      if (res.logo) res.logoUrl = fileService.getPublicUrl(res.logo.path);
      if (res.menuImage) res.menuImageUrl = fileService.getPublicUrl(res.menuImage.path);
      
      // Hydrate Menu Items
      if (res.menuItems) {
        res.mealCount = res.menuItems.length;
        res.menuItems.forEach((rm: any) => {
          if (rm.image) {
            rm.imageUrl = fileService.getPublicUrl(rm.image.path);
          } else if (rm.menuItem?.image) {
            rm.imageUrl = fileService.getPublicUrl(rm.menuItem.image.path);
          }
        });
      }

      return { success: true, data: restaurant as any as Restaurant };
    } catch (error) {
      console.error("RestaurantService.getRestaurantById error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch restaurant",
      };
    }
  }

  // Bulk update restaurant and meal images
  static async bulkUpdateRestaurantImages(params: {
    restaurantId: string;
    logoId?: string | null;
    menuImageId?: string | null;
    assignments: { restaurantMenuId: string, imageId: string | null }[];
  }): Promise<ServiceResult<void>> {
    try {
      const { restaurantId, logoId, menuImageId, assignments } = params;

      await RestaurantRepository.prisma().$transaction(async (tx) => {
        // 1. Update Restaurant logo/menu image if provided
        if (logoId !== undefined || menuImageId !== undefined) {
          const updateData: any = {};
          if (logoId !== undefined) updateData.logoId = logoId;
          if (menuImageId !== undefined) updateData.menuImageId = menuImageId;
          
          await tx.restaurant.update({
            where: { id: restaurantId },
            data: updateData
          });
        }

        // 2. Update Meal assignments
        for (const assignment of assignments) {
          await tx.restaurantMenu.update({
            where: { id: assignment.restaurantMenuId },
            data: { imageId: assignment.imageId }
          });
        }
      });

      return { success: true };
    } catch (error) {
      console.error("RestaurantService.bulkUpdateRestaurantImages error:", error);
      return { success: false, error: "Failed to perform bulk image update" };
    }
  }

  // Search restaurants
  static async searchRestaurants(
    query: string,
  ): Promise<ServiceResult<Restaurant[]>> {
    try {
      const restaurants = await RestaurantRepository.search(query);
      return { success: true, data: restaurants };
    } catch (error) {
      console.error("RestaurantService.searchRestaurants error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to search restaurants",
      };
    }
  }

  // Delete image from library
  static async deleteLibraryImage(restaurantId: string, imageId: string): Promise<ServiceResult<void>> {
    try {
      await RestaurantMenuRepository.deleteLibraryImage(restaurantId, imageId);
      return { success: true };
    } catch (error: any) {
      // P2025 = record not found — image was already removed or never in the library
      // (e.g. it came from the logo/menu-image slot). Treat as success.
      if (error?.code === "P2025") {
        return { success: true };
      }
      console.error("RestaurantService.deleteLibraryImage error:", error);
      return { success: false, error: "Failed to delete image from library" };
    }
  }

  private static extractCoordinates(iframe: string | null | undefined): { lat: number, lng: number } | null {
    if (!iframe) return null;
    // Regex for Google Maps iframe src or raw pb string
    // Looks for !2d[LNG]!3d[LAT]
    const match = iframe.match(/!2d(-?\d+\.\d+)!3d(-?\d+\.\d+)/);
    if (match) {
      return {
        lng: parseFloat(match[1]),
        lat: parseFloat(match[2]),
      };
    }
    return null;
  }
}
