"use server";

import { revalidatePath } from "next/cache";
import { FeatureService } from "@/services/feature.service";
import { createFeatureSchema, updateFeatureSchema } from "@/lib/validations/feature.validation";
import type { CreateFeatureInput, UpdateFeatureInput } from "@/lib/validations/feature.validation";

// Server Actions - Validation layer + Service calls
export async function createFeature(data: CreateFeatureInput) {
  try {
    // Validate input with Zod
    const validatedData = createFeatureSchema.parse(data);
    
    // Call service (no validation there)
    const result = await FeatureService.createFeature(validatedData);
    
    if (result.success) {
      revalidatePath("/admin/restaurant-management");
    }
    
    return result;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Zod")) {
      return { success: false, error: "Validation failed: " + error.message };
    }
    return { success: false, error: "Failed to create feature" };
  }
}

export async function updateFeature(id: string, data: UpdateFeatureInput) {
  try {
    // Validate input with Zod
    const validatedData = updateFeatureSchema.parse(data);
    
    // Call service (no validation there)
    const result = await FeatureService.updateFeature(id, validatedData);
    
    if (result.success) {
      revalidatePath("/admin/restaurant-management");
    }
    
    return result;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Zod")) {
      return { success: false, error: "Validation failed: " + error.message };
    }
    return { success: false, error: "Failed to update feature" };
  }
}

export async function deleteFeature(id: string) {
  const result = await FeatureService.deleteFeature(id);
  
  if (result.success) {
    revalidatePath("/admin/restaurant-management");
  }
  
  return result;
}

export async function getFeatures() {
  return await FeatureService.getAllFeatures();
}

export async function getFeature(id: string) {
  return await FeatureService.getFeatureById(id);
}

export async function searchFeatures(query: string) {
  return await FeatureService.searchFeatures(query);
}

export async function getRestaurantFeatures(restaurantId: string) {
  return await FeatureService.getRestaurantFeatures(restaurantId);
}

export async function assignFeatures(restaurantId: string, featureIds: string[]) {
  const result = await FeatureService.assignFeatures(restaurantId, featureIds);
  
  if (result.success) {
    revalidatePath("/admin/restaurant-management");
  }
  
  return result;
}
