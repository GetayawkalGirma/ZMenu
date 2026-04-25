import prisma from "@/lib/prisma";

/** Supabase Free plan file storage is 1 GiB per project (set SUPABASE_STORAGE_QUOTA_BYTES to override). */
const DEFAULT_STORAGE_QUOTA_BYTES = 1024 * 1024 * 1024;

export function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0 B";
  if (n < 1024) return `${Math.round(n)} B`;
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(2)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

export type DashboardStats = {
  totalRestaurants: number;
  draftRestaurants: number;
  publishedRestaurants: number;
  totalRestaurantMeals: number;
  catalogMenuItems: number;
  foodListings: number;
  drinkListings: number;
  categories: number;
  /** Rows in `File` with an image/* mime type */
  storageImageCount: number;
  /** Sum of `File.size` for image/* rows */
  storageImageBytes: number;
  /** Sum of `File.size` for all rows (tracked in DB) */
  storageAllFilesBytes: number;
  /** Bytes used for quota bar (same as all files) */
  storageQuotaBytes: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const quotaBytes = Math.max(
    1,
    parseInt(process.env.SUPABASE_STORAGE_QUOTA_BYTES || String(DEFAULT_STORAGE_QUOTA_BYTES), 10)
  );

  const [
    totalRestaurants,
    draftRestaurants,
    publishedRestaurants,
    totalRestaurantMeals,
    catalogMenuItems,
    foodListings,
    drinkListings,
    categories,
    storageImageCount,
    imageSum,
    allSum,
  ] = await Promise.all([
    prisma.restaurant.count(),
    prisma.restaurant.count({ where: { status: "DRAFT" } }),
    prisma.restaurant.count({ where: { status: "PUBLISHED" } }),
    prisma.restaurantMenu.count(),
    prisma.menuItem.count(),
    prisma.restaurantMenu.count({ where: { foodCategoryType: "FOOD" } }),
    prisma.restaurantMenu.count({ where: { foodCategoryType: "DRINK" } }),
    prisma.category.count(),
    prisma.file.count({
      where: { mimeType: { startsWith: "image/" } },
    }),
    prisma.file.aggregate({
      where: { mimeType: { startsWith: "image/" } },
      _sum: { size: true },
    }),
    prisma.file.aggregate({ _sum: { size: true } }),
  ]);

  const storageImageBytes = imageSum._sum.size ?? 0;
  const storageAllFilesBytes = allSum._sum.size ?? 0;

  return {
    totalRestaurants,
    draftRestaurants,
    publishedRestaurants,
    totalRestaurantMeals,
    catalogMenuItems,
    foodListings,
    drinkListings,
    categories,
    storageImageCount,
    storageImageBytes,
    storageAllFilesBytes,
    storageQuotaBytes: quotaBytes,
  };
}

export type RecentRestaurantRow = {
  id: string;
  name: string;
  timeAgo: string;
  status: string;
};

function formatTimeAgo(d: Date): string {
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return "Just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return d.toLocaleDateString();
}

export async function getRecentRestaurants(limit = 6): Promise<RecentRestaurantRow[]> {
  const rows = await prisma.restaurant.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, status: true, createdAt: true },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name || "Unnamed",
    timeAgo: formatTimeAgo(r.createdAt),
    status: r.status === "PUBLISHED" ? "Published" : "Draft",
  }));
}

export type RecentMenuUpdateRow = {
  id: string;
  mealName: string;
  restaurantName: string;
  price: number;
  timeAgo: string;
};

export async function getRecentMenuUpdates(limit = 6): Promise<RecentMenuUpdateRow[]> {
  const rows = await prisma.restaurantMenu.findMany({
    take: limit,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      price: true,
      updatedAt: true,
      menuItem: { select: { name: true } },
      restaurant: { select: { name: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    mealName: (r.name || r.menuItem?.name || "Item").trim(),
    restaurantName: r.restaurant?.name || "Restaurant",
    price: r.price,
    timeAgo: formatTimeAgo(r.updatedAt),
  }));
}
export async function getPublicStats() {
  try {
    const [publishedRestaurants, foodListings, drinkListings, totalRestaurantMeals] = await Promise.all([
      prisma.restaurant.count({ where: { status: "PUBLISHED" } }),
      prisma.restaurantMenu.count({ where: { foodCategoryType: "FOOD" } }),
      prisma.restaurantMenu.count({ where: { foodCategoryType: "DRINK" } }),
      prisma.restaurantMenu.count(),
    ]);

    return {
      publishedRestaurants,
      foodListings,
      drinkListings,
      totalRestaurantMeals,
    };
  } catch (error) {
    console.error("Error getting public stats:", error);
    return {
      publishedRestaurants: 0,
      foodListings: 0,
      drinkListings: 0,
      totalRestaurantMeals: 0,
    };
  }
}
