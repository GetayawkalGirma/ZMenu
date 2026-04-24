"use server";

import prisma from "@/lib/prisma";
import { $Enums } from "@prisma/client";

type FeedbackType = $Enums.FeedbackType;
const FeedbackType = $Enums.FeedbackType;

export async function submitMealInfoFeedback(data: {
  restaurantId: string;
  restaurantMenuId: string;
  suggestedPrice?: number;
  suggestedPortionSize?: string;
  suggestedPreparationTime?: number;
}) {
  try {
    await prisma.userFeedback.create({
      data: {
        restaurantId: data.restaurantId,
        restaurantMenuId: data.restaurantMenuId,
        type: FeedbackType.MEAL_INFO,
        suggestedPrice: data.suggestedPrice,
        suggestedPortionSize: data.suggestedPortionSize,
        suggestedPreparationTime: data.suggestedPreparationTime,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return { success: false, error: "Failed to submit feedback" };
  }
}

export async function submitRestaurantImageFeedback(data: {
  restaurantId: string;
  uploadedImageUrls: string[];
}) {
  try {
    await prisma.userFeedback.create({
      data: {
        restaurantId: data.restaurantId,
        type: FeedbackType.MENU_IMAGES,
        uploadedImageUrls: data.uploadedImageUrls,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error submitting image feedback:", error);
    return { success: false, error: "Failed to submit images" };
  }
}
