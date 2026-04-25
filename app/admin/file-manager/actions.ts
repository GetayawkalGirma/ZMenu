"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { fileService } from "@/services/file/file.service";

export type FileUsage = {
  type: "LOGO" | "MENU_IMAGE" | "MEAL" | "GLOBAL_MEAL" | "LIBRARY" | "ABANDONED";
  entityName?: string;
  entityId?: string;
};

export type FileWithUsage = {
  id: string;
  filename: string;
  extension: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  createdAt: Date;
  usages: FileUsage[];
  isAbandoned: boolean;
};

export async function getFiles(params: {
  page?: number;
  pageSize?: number;
  filter?: "all" | "abandoned" | "linked";
  search?: string;
}) {
  const { page = 1, pageSize = 24, filter = "all", search = "" } = params;
  const skip = (page - 1) * pageSize;

  // Build where clause
  let where: any = {};
  
  if (search) {
    console.log("FileManager: Searching for:", search);
    where = {
      ...where,
      OR: [
        { id: { contains: search, mode: 'insensitive' } },
        { filename: { contains: search, mode: 'insensitive' } },
        { path: { contains: search, mode: 'insensitive' } },
        { restaurantLogos: { some: { name: { contains: search, mode: 'insensitive' } } } },
        { restaurantMenusImages: { some: { name: { contains: search, mode: 'insensitive' } } } },
        { restaurantMenus: { some: { name: { contains: search, mode: 'insensitive' } } } },
        { restaurantMenus: { some: { restaurant: { name: { contains: search, mode: 'insensitive' } } } } },
        { restaurantImageLibrary: { some: { restaurant: { name: { contains: search, mode: 'insensitive' } } } } },
        { menuItems: { some: { name: { contains: search, mode: 'insensitive' } } } },
      ]
    };
  }
  console.log("FileManager: Where clause:", JSON.stringify(where, null, 2));

  // If filtering for abandoned, we need to find files with NO relations
  // This is tricky with Prisma if we want it efficient, but for now we can do it in JS or with 'none'
  if (filter === "abandoned") {
    where = {
      ...where,
      restaurantLogos: { none: {} },
      restaurantMenusImages: { none: {} },
      restaurantMenus: { none: {} },
      restaurantImageLibrary: { none: {} },
      menuItems: { none: {} },
    };
  } else if (filter === "linked") {
    where = {
      ...where,
      OR: [
        { restaurantLogos: { some: {} } },
        { restaurantMenusImages: { some: {} } },
        { restaurantMenus: { some: {} } },
        { restaurantImageLibrary: { some: {} } },
        { menuItems: { some: {} } },
      ]
    };
  }

  const [files, totalCount] = await Promise.all([
    prisma.file.findMany({
      where,
      include: {
        restaurantLogos: { select: { id: true, name: true } },
        restaurantMenusImages: { select: { id: true, name: true } },
        restaurantMenus: { select: { id: true, name: true, restaurant: { select: { name: true } } } },
        restaurantImageLibrary: { select: { id: true, restaurant: { select: { name: true } } } },
        menuItems: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.file.count({ where }),
  ]);

  const filesWithUsage: FileWithUsage[] = files.map((file) => {
    const usages: FileUsage[] = [];

    // Log Usage
    file.restaurantLogos.forEach((r) => {
      usages.push({ type: "LOGO", entityName: r.name || "Unnamed Restaurant", entityId: r.id });
    });

    // Menu Image Usage
    file.restaurantMenusImages.forEach((r) => {
      usages.push({ type: "MENU_IMAGE", entityName: r.name || "Unnamed Restaurant", entityId: r.id });
    });

    // Restaurant Meal Usage
    file.restaurantMenus.forEach((m) => {
      usages.push({ 
        type: "MEAL", 
        entityName: `${m.name} (${m.restaurant.name})`, 
        entityId: m.id 
      });
    });

    // Global Meal Usage
    file.menuItems.forEach((m) => {
      usages.push({ type: "GLOBAL_MEAL", entityName: m.name, entityId: m.id });
    });

    // Library Usage
    file.restaurantImageLibrary.forEach((l) => {
      usages.push({ type: "LIBRARY", entityName: l.restaurant.name || "Unnamed Restaurant", entityId: l.id });
    });

    const isAbandoned = usages.length === 0;
    if (isAbandoned) {
      usages.push({ type: "ABANDONED" });
    }

    return {
      id: file.id,
      filename: file.filename,
      extension: file.extension,
      mimeType: file.mimeType,
      size: file.size,
      path: file.path,
      url: fileService.getPublicUrl(file.path),
      createdAt: file.createdAt,
      usages,
      isAbandoned,
    };
  });

  return {
    files: filesWithUsage,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage: page,
  };
}

export async function deleteFile(fileId: string) {
  try {
    // 1. Get file info first (to delete from storage later if needed)
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: {
        restaurantLogos: true,
        restaurantMenusImages: true,
        restaurantMenus: true,
        restaurantImageLibrary: true,
        menuItems: true,
      }
    });

    if (!file) throw new Error("File not found");

    // 2. Check if it's safe to delete (optional, maybe we allow forced delete)
    const totalUsages = 
      file.restaurantLogos.length + 
      file.restaurantMenusImages.length + 
      file.restaurantMenus.length + 
      file.restaurantImageLibrary.length + 
      file.menuItems.length;

    if (totalUsages > 0) {
      // For now, let's just warn or allow it?
      // User said "so I can delete them", implying they might delete linked ones too, 
      // but usually they want to delete abandoned ones.
    }

    // 3. Delete from DB
    await prisma.file.delete({
      where: { id: fileId }
    });

    // 4. (Note) Real storage deletion (Supabase) should happen here
    // For now we just clean the DB record.
    
    revalidatePath("/admin/file-manager");
    return { success: true };
  } catch (error: any) {
    console.error("Delete file error:", error);
    return { success: false, error: error.message };
  }
}

export async function bulkDeleteFiles(fileIds: string[]) {
  try {
    // Delete all records in one go
    await prisma.file.deleteMany({
      where: {
        id: { in: fileIds }
      }
    });

    revalidatePath("/admin/file-manager");
    return { success: true, deletedCount: fileIds.length };
  } catch (error: any) {
    console.error("Bulk delete error:", error);
    return { success: false, error: error.message };
  }
}
