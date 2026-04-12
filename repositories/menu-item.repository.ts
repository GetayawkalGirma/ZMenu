import prisma from "@/lib/prisma";
import type {
  MenuItem,
  RestaurantMenu,
  Category,
  PortionSize,
} from "@/lib/types/meal";

export class MenuItemRepository {
  // Get all menu items
  static async getAll(): Promise<MenuItem[]> {
    const menuItems = await prisma.menuItem.findMany({
      include: {
        category: true,
        image: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return menuItems as unknown as MenuItem[];
  }

  // Get menu item by ID
  static async getById(id: string): Promise<MenuItem | null> {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: true,
        image: true,
        restaurants: {
          include: {
            restaurant: true,
            image: true,
          },
        },
      },
    });

    return menuItem as unknown as MenuItem;
  }

  // Create menu item (Global Abstract Food)
  static async create(data: {
    name: string;
    description?: string;
    categoryId: string;
    tags?: string[];
    imageId?: string | null;
  }): Promise<MenuItem> {
    const menuItem = await prisma.menuItem.create({
      data: {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        tags: data.tags || [],
        imageId: data.imageId,
      },
      include: {
        category: true,
        image: true,
      },
    });

    return menuItem as unknown as MenuItem;
  }

  // Update menu item (Global Abstract Food)
  static async update(
    id: string,
    data: Partial<{
      name: string;
      description?: string;
      categoryId: string;
      tags?: string[];
      imageId?: string | null;
    }>,
  ): Promise<MenuItem> {
    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        tags: data.tags,
        imageId: data.imageId,
      },
      include: {
        category: true,
        image: true,
      },
    });

    return menuItem as unknown as MenuItem;
  }

  // Delete menu item
  static async delete(id: string): Promise<MenuItem> {
    const menuItem = await prisma.menuItem.delete({
      where: { id },
      include: {
        category: true,
      },
    });

    return menuItem as unknown as MenuItem;
  }

  // Search menu items by name
  static async search(query: string): Promise<MenuItem[]> {
    const menuItems = await prisma.menuItem.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        category: true,
        image: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return menuItems as unknown as MenuItem[];
  }

  // Get menu items by category
  static async getByCategory(categoryId: string): Promise<MenuItem[]> {
    const menuItems = await prisma.menuItem.findMany({
      where: { categoryId },
      include: {
        category: true,
        image: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return menuItems as unknown as MenuItem[];
  }

  static async getPaginated(params: {
    page: number;
    pageSize: number;
    search?: string;
    categoryId?: string;
  }): Promise<{ items: MenuItem[]; total: number }> {
    const { page, pageSize, search, categoryId } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { hasSome: [search.toLowerCase()] } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [items, total] = await Promise.all([
      prisma.menuItem.findMany({
        where,
        include: {
          category: true,
          image: true,
        },
        orderBy: { name: "asc" },
        skip,
        take: pageSize,
      }),
      prisma.menuItem.count({ where }),
    ]);

    return { items: items as unknown as MenuItem[], total };
  }

  // Update aggregated analytics (avgPrice, etc.)
  static async updateAnalytics(id: string) {
    const restaurantMenus = await prisma.restaurantMenu.findMany({
      where: { menuItemId: id },
      select: { price: true },
    });

    if (restaurantMenus.length === 0) {
      await prisma.menuItem.update({
        where: { id },
        data: {
          avgPrice: null,
          minPrice: null,
          maxPrice: null,
          priceCount: 0,
        },
      });
      return;
    }

    const prices = restaurantMenus.map((rm: { price: number }) => rm.price);
    const avgPrice =
      prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceCount = prices.length;

    await prisma.menuItem.update({
      where: { id },
      data: {
        avgPrice,
        minPrice,
        maxPrice,
        priceCount,
      },
    });
  }
}

export class RestaurantMenuRepository {
  static async findRestaurantVariantByName(params: {
    restaurantId: string;
    menuItemId: string;
    variantName: string;
    excludeRestaurantMenuId?: string;
  }): Promise<RestaurantMenu | null> {
    const normalizedName = params.variantName.trim();
    if (!normalizedName) {
      return null;
    }

    const restaurantMenu = await prisma.restaurantMenu.findFirst({
      where: {
        restaurantId: params.restaurantId,
        menuItemId: params.menuItemId,
        name: {
          equals: normalizedName,
          mode: "insensitive",
        },
        ...(params.excludeRestaurantMenuId
          ? { NOT: { id: params.excludeRestaurantMenuId } }
          : {}),
      },
      include: {
        menuItem: {
          include: {
            image: true,
          },
        },
        image: true,
        restaurant: true,
      },
    });

    return restaurantMenu as unknown as RestaurantMenu | null;
  }

  // Get all menu items for a restaurant
  static async getRestaurantMenuItems(
    restaurantId: string,
  ): Promise<RestaurantMenu[]> {
    const restaurantMenu = await prisma.restaurantMenu.findMany({
      where: { restaurantId },
      include: {
        menuItem: {
          include: {
            category: true,
            image: true,
          },
        },
        image: true,
        restaurant: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    return restaurantMenu as unknown as RestaurantMenu[];
  }

  // Add menu item to restaurant
  static async addMenuItemToRestaurant(data: {
    restaurantId: string;
    menuItemId: string;
    price: number;
    portionSize?: PortionSize;
    spicyLevel?: number;
    preparationTime?: number;
    ingredients?: string[];
    calories?: number;
    isAvailable?: boolean;
    isPopular?: boolean;
    isRecommended?: boolean;
    imageUrl?: string;
    imageId?: string | null;
    sortOrder?: number;
    name?: string | null;
    description?: string | null;
    foodCategoryType?: string | null;
    dietaryCategory?: string | null;
  }): Promise<RestaurantMenu> {
    const restaurantMenu = await prisma.restaurantMenu.create({
      data: {
        restaurantId: data.restaurantId,
        menuItemId: data.menuItemId,
        price: data.price,
        portionSize: data.portionSize,
        spicyLevel: data.spicyLevel,
        preparationTime: data.preparationTime,
        ingredients: data.ingredients || [],
        calories: data.calories,
        isAvailable: data.isAvailable ?? true,
        isPopular: data.isPopular ?? false,
        isRecommended: data.isRecommended ?? false,
        imageUrl: data.imageUrl,
        imageId: data.imageId,
        sortOrder: data.sortOrder,
        name: data.name,
        description: data.description,
        foodCategoryType: data.foodCategoryType as any,
        dietaryCategory: data.dietaryCategory as any,
      },
      include: {
        menuItem: {
          include: {
            image: true,
          },
        },
        image: true,
        restaurant: true,
      },
    });

    // Update global analytics after change
    await MenuItemRepository.updateAnalytics(data.menuItemId);

    return restaurantMenu as unknown as RestaurantMenu;
  }

  // Update restaurant menu item
  static async updateRestaurantMenuItem(
    id: string,
    data: Partial<{
      price: number;
      portionSize: PortionSize;
      spicyLevel: number;
      preparationTime: number;
      ingredients: string[];
      calories: number;
      isAvailable: boolean;
      isPopular: boolean;
      isRecommended: boolean;
      imageUrl: string;
      imageId: string | null;
      sortOrder: number;
      name?: string | null;
      description?: string | null;
      foodCategoryType?: string | null;
      dietaryCategory?: string | null;
    }>,
  ): Promise<RestaurantMenu> {
    const restaurantMenu = await prisma.restaurantMenu.update({
      where: { id },
      data: {
        price: data.price,
        portionSize: data.portionSize,
        spicyLevel: data.spicyLevel,
        preparationTime: data.preparationTime,
        ingredients: data.ingredients,
        calories: data.calories,
        isAvailable: data.isAvailable,
        isPopular: data.isPopular,
        isRecommended: data.isRecommended,
        imageUrl: data.imageUrl,
        imageId: data.imageId,
        sortOrder: data.sortOrder,
        name: data.name,
        description: data.description,
        foodCategoryType: data.foodCategoryType as any,
        dietaryCategory: data.dietaryCategory as any,
      },
      include: {
        menuItem: {
          include: {
            image: true,
          },
        },
        image: true,
        restaurant: true,
      },
    });

    // Update global analytics after change
    await MenuItemRepository.updateAnalytics(restaurantMenu.menuItemId);

    return restaurantMenu as unknown as RestaurantMenu;
  }

  // Remove menu item from restaurant
  static async removeMenuItemFromRestaurant(
    restaurantMenuId: string,
  ): Promise<RestaurantMenu> {
    const existingRestaurantMenu = await prisma.restaurantMenu.findUnique({
      where: { id: restaurantMenuId },
      select: { menuItemId: true },
    });
    if (!existingRestaurantMenu) {
      throw new Error("Restaurant menu item not found");
    }

    const restaurantMenu = await prisma.restaurantMenu.delete({
      where: { id: restaurantMenuId },
    });

    // Update global analytics after change
    await MenuItemRepository.updateAnalytics(existingRestaurantMenu.menuItemId);

    return restaurantMenu as unknown as RestaurantMenu;
  }

  // Get all restaurants that offer a specific menu item
  static async getRestaurantsByMenuItem(
    menuItemId: string,
  ): Promise<RestaurantMenu[]> {
    const restaurantMenu = await prisma.restaurantMenu.findMany({
      where: { menuItemId },
      include: {
        menuItem: {
          include: {
            image: true,
          },
        },
        restaurant: true,
        image: true,
      },
      orderBy: {
        restaurant: {
          name: "asc",
        },
      },
    });

    return restaurantMenu as unknown as RestaurantMenu[];
  }

  // Get all restaurant menu items globally
  static async getAll(): Promise<RestaurantMenu[]> {
    const items = await prisma.restaurantMenu.findMany({
      include: {
        menuItem: {
          include: {
            category: true,
            image: true,
          },
        },
        image: true,
        restaurant: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return items as unknown as RestaurantMenu[];
  }
}

export class CategoryRepository {
  static async getAll(): Promise<Category[]> {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return categories as unknown as Category[];
  }

  static async getById(id: string): Promise<Category | null> {
    const category = await prisma.category.findUnique({
      where: { id },
    });
    return category as unknown as Category;
  }

  static async create(data: {
    name: string;
    description?: string | null;
    isActive?: boolean;
    sortOrder?: number;
  }): Promise<Category> {
    const category = await prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });
    return category as unknown as Category;
  }

  static async update(
    id: string,
    data: Partial<{
      name: string;
      description?: string | null;
      isActive?: boolean;
      sortOrder?: number;
    }>,
  ): Promise<Category> {
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });
    return category as unknown as Category;
  }

  static async delete(id: string): Promise<Category> {
    const category = await prisma.category.delete({
      where: { id },
    });
    return category as unknown as Category;
  }
}
