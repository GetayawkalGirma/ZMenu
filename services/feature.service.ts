import { FeatureRepository } from '@/repositories/feature.repository';
import type { Feature } from '@/repositories/feature.repository';

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateFeatureInput {
  name: string;
  description?: string;
}

export interface UpdateFeatureInput {
  name?: string;
  description?: string;
}

// Feature Service - Business Logic Layer
export class FeatureService {
  // Get all features
  static async getAllFeatures(): Promise<ServiceResult<Feature[]>> {
    try {
      const features = await FeatureRepository.getAll();
      return { success: true, data: features };
    } catch (error) {
      console.error("FeatureService.getAllFeatures error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch features",
      };
    }
  }

  // Get feature by ID
  static async getFeatureById(id: string): Promise<ServiceResult<Feature>> {
    try {
      const feature = await FeatureRepository.getById(id);
      
      if (!feature) {
        return { success: false, error: "Feature not found" };
      }
      
      return { success: true, data: feature };
    } catch (error) {
      console.error("FeatureService.getFeatureById error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch feature",
      };
    }
  }

  // Search features
  static async searchFeatures(query: string): Promise<ServiceResult<Feature[]>> {
    try {
      const features = await FeatureRepository.search(query);
      return { success: true, data: features };
    } catch (error) {
      console.error("FeatureService.searchFeatures error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to search features",
      };
    }
  }

  // Create feature
  static async createFeature(data: CreateFeatureInput): Promise<ServiceResult<Feature>> {
    try {
      // Validation
      if (!data.name?.trim()) {
        return { success: false, error: "Feature name is required" };
      }

      if (data.name.length > 100) {
        return { success: false, error: "Feature name must be less than 100 characters" };
      }

      const feature = await FeatureRepository.create(data);
      return { success: true, data: feature };
    } catch (error) {
      console.error("FeatureService.createFeature error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create feature",
      };
    }
  }

  // Update feature
  static async updateFeature(id: string, data: UpdateFeatureInput): Promise<ServiceResult<Feature>> {
    try {
      // Validation
      if (data.name !== undefined) {
        if (!data.name?.trim()) {
          return { success: false, error: "Feature name is required" };
        }

        if (data.name.length > 100) {
          return { success: false, error: "Feature name must be less than 100 characters" };
        }
      }

      const feature = await FeatureRepository.update(id, data);
      return { success: true, data: feature };
    } catch (error) {
      console.error("FeatureService.updateFeature error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update feature",
      };
    }
  }

  // Delete feature
  static async deleteFeature(id: string): Promise<ServiceResult<void>> {
    try {
      await FeatureRepository.delete(id);
      return { success: true };
    } catch (error) {
      console.error("FeatureService.deleteFeature error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete feature",
      };
    }
  }

  // Get restaurant features
  static async getRestaurantFeatures(restaurantId: string): Promise<ServiceResult<Feature[]>> {
    try {
      const features = await FeatureRepository.getRestaurantFeatures(restaurantId);
      return { success: true, data: features };
    } catch (error) {
      console.error("FeatureService.getRestaurantFeatures error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch restaurant features",
      };
    }
  }

  // Assign features to restaurant
  static async assignFeatures(restaurantId: string, featureIds: string[]): Promise<ServiceResult<void>> {
    try {
      await FeatureRepository.assignFeatures(restaurantId, featureIds);
      return { success: true };
    } catch (error) {
      console.error("FeatureService.assignFeatures error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to assign features",
      };
    }
  }
}
