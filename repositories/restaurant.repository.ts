import prisma from "@/lib/prisma";
import type {
  CreateRestaurantInput,
  UpdateRestaurantInput,
} from "@/lib/validations/restaurant.validation";

export interface Restaurant {
  id: string;
  name: string | null;
  location: string | null;
  geoLocation: string | null;
  logoUrl: string | null;
  logoId: string | null;
  menuImageUrl: string | null;
  menuImageId: string | null;
  rating: number | null;
  noiselevel: string | null;
  privacylevel: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class RestaurantRepository {
  // Create restaurant
  static async create(data: CreateRestaurantInput): Promise<Restaurant> {
    const restaurant = await prisma.restaurant.create({
      data: {
        name: data.name,
        location: data.location,
        geoLocation: data.geoLocation || null,
        logoUrl: data.logoUrl || null,
        logoId: (data as any).logoId || null,
        menuImageUrl: (data as any).menuImageUrl || null,
        menuImageId: (data as any).menuImageId || null,
        rating: data.rating || null,
        noiselevel: data.noiselevel || null,
        privacylevel: data.privacylevel || null,
        status: data.status || "DRAFT",
        features:
          data.featureIds && data.featureIds.length > 0
            ? {
                create: data.featureIds.map((featureId) => ({
                  feature: { connect: { id: featureId } },
                })),
              }
            : undefined,
      },
    });

    return restaurant as any as Restaurant;
  }

  // Update restaurant
  static async update(
    id: string,
    data: UpdateRestaurantInput,
  ): Promise<Restaurant> {
    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        name: data.name,
        location: data.location,
        geoLocation: data.geoLocation || null,
        logoUrl: data.logoUrl || null,
        logoId: (data as any).logoId || null,
        menuImageUrl: (data as any).menuImageUrl || null,
        menuImageId: (data as any).menuImageId || null,
        rating: data.rating || null,
        noiselevel: data.noiselevel || null,
        privacylevel: data.privacylevel || null,
        status: data.status,
        features: data.featureIds
          ? {
              deleteMany: {},
              create: data.featureIds.map((featureId) => ({
                feature: { connect: { id: featureId } },
              })),
            }
          : undefined,
      },
    });

    return restaurant as any as Restaurant;
  }

  // Delete restaurant
  static async delete(id: string): Promise<void> {
    await prisma.restaurant.delete({
      where: { id },
    });
  }

  // Get all restaurants
  static async getAll(): Promise<Restaurant[]> {
    const restaurants = await prisma.restaurant.findMany({
      include: {
        logo: true,
        menuImage: true,
        features: {
          include: {
            feature: true,
          },
        },
        menuItems: {
          include: {
            menuItem: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return restaurants as any as Restaurant[];
  }

  static async getById(id: string) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        logo: true,
        menuImage: true,
        menuItems: {
          include: {
            menuItem: {
              include: {
                image: true,
                category: true,
              },
            },
            image: true, // restaurant-specific image override
          },
        },
        features: {
          include: {
            feature: true,
          },
        },
      },
    });

    return restaurant;
  }

  // Paginated restaurants with search and status filter
  static async getPaginated(params: {
    page: number;
    pageSize: number;
    search?: string;
    status?: string;
  }): Promise<{ items: Restaurant[]; total: number }> {
    const { page, pageSize, search, status } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        include: {
          logo: true,
          menuImage: true,
          features: { include: { feature: true } },
          menuItems: {
            include: {
              menuItem: { include: { category: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.restaurant.count({ where }),
    ]);

    return { items: items as unknown as Restaurant[], total };
  }

  // Search restaurants
  static async search(query: string): Promise<Restaurant[]> {
    const restaurants = await prisma.restaurant.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { location: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        logo: true,
        menuImage: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return restaurants as any as Restaurant[];
  }
}
