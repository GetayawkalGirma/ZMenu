import { RestaurantRepository } from "@/repositories/restaurant.repository";
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
      let logoId: string | undefined;
      let menuImageId: string | undefined;

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

      // Handle menu image upload
      if (data.menuImage && data.menuImage instanceof File) {
        const buffer = Buffer.from(await data.menuImage.arrayBuffer());
        const uploadedFile = await fileService.uploadFile(
          buffer,
          data.menuImage.name,
          data.menuImage.type
        );
        menuImageId = uploadedFile.id;
      }

      // No validation - just business logic
      const restaurant = await RestaurantRepository.create({
        ...data,
        logoId,
        menuImageId,
      } as any);
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
      let logoId: string | undefined | null;
      let menuImageId: string | undefined | null;

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

      // No validation - just business logic
      const restaurant = await RestaurantRepository.update(id, {
        ...data,
        logoId: logoId === null ? null : (logoId ?? existing?.logoId),
        menuImageId: menuImageId === null ? null : (menuImageId ?? existing?.menuImageId),
      } as any);
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

  // Get all restaurants
  static async getAllRestaurants(): Promise<ServiceResult<Restaurant[]>> {
    try {
      const restaurants = await RestaurantRepository.getAll();
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

      return { success: true, data: restaurant };
    } catch (error) {
      console.error("RestaurantService.getRestaurantById error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch restaurant",
      };
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
}
