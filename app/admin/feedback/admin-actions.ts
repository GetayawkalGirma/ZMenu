"use server";

import prisma from "@/lib/prisma";
import { $Enums } from "@prisma/client";
import { revalidatePath } from "next/cache";

type FeedbackStatus = $Enums.FeedbackStatus;
const FeedbackStatus = $Enums.FeedbackStatus;

export async function approveMealFeedback(feedbackId: string) {
  try {
    const feedback = await prisma.userFeedback.findUnique({
      where: { id: feedbackId },
      include: { restaurantMenu: true }
    });

    if (!feedback || !feedback.restaurantMenuId) return { success: false };

    // Update the actual meal
    await prisma.restaurantMenu.update({
      where: { id: feedback.restaurantMenuId },
      data: {
        price: feedback.suggestedPrice ?? undefined,
        portionSize: feedback.suggestedPortionSize as any,
        preparationTime: feedback.suggestedPreparationTime ?? undefined,
      }
    });

    // Mark feedback as approved
    await prisma.userFeedback.update({
      where: { id: feedbackId },
      data: { status: FeedbackStatus.APPROVED }
    });

    revalidatePath("/admin/feedback");
    return { success: true };
  } catch (error) {
    console.error("Error approving meal feedback:", error);
    return { success: false };
  }
}

export async function rejectFeedback(feedbackId: string) {
  try {
    await prisma.userFeedback.update({
      where: { id: feedbackId },
      data: { status: FeedbackStatus.REJECTED }
    });
    revalidatePath("/admin/feedback");
    return { success: true };
  } catch (error) {
    console.error("Error rejecting feedback:", error);
    return { success: false };
  }
}

export async function approveImageFeedback(feedbackId: string, mealId: string, imageUrl: string) {
  try {
    await prisma.restaurantMenu.update({
      where: { id: mealId },
      data: {
        imageUrl: imageUrl
      }
    });

    await prisma.userFeedback.update({
      where: { id: feedbackId },
      data: { status: FeedbackStatus.APPROVED }
    });

    revalidatePath("/admin/feedback");
    return { success: true };
  } catch (error) {
    console.error("Error approving image feedback:", error);
    return { success: false };
  }
}
