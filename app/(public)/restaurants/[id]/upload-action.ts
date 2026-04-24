"use server";

import { fileService } from "@/services/file/file.service";
import sharp from "sharp";

export async function uploadMenuImagesAction(formData: FormData) {
  try {
    const files = formData.getAll("files") as File[];
    const restaurantId = formData.get("restaurantId") as string;

    if (!files || files.length === 0) {
      return { success: false, error: "No files provided" };
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      let buffer: any = Buffer.from(arrayBuffer);
      
      // Optimization: Compress image for web
      if (file.type.startsWith("image/")) {
        try {
          buffer = await sharp(buffer)
            .resize(1200, 1200, { // Limit max resolution
              fit: 'inside',
              withoutEnlargement: true 
            })
            .jpeg({ quality: 80, progressive: true }) // Balanced compression
            .toBuffer();
        } catch (sharpError) {
          console.error("Compression failed, uploading original:", sharpError);
        }
      }
      
      const uploadedFile = await fileService.uploadFile(
        buffer,
        file.name.replace(/\.[^/.]+$/, "") + ".jpg", // Force jpg extension after compression
        "image/jpeg"
      );
      
      uploadedUrls.push(uploadedFile.url);
    }

    return { 
      success: true, 
      urls: uploadedUrls 
    };
  } catch (error) {
    console.error("Error in uploadMenuImagesAction:", error);
    return { success: false, error: "Internal server error" };
  }
}
