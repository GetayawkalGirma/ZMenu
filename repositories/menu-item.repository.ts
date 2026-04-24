import prisma from "@/lib/prisma";
import { Prisma, MenuCategory as PrismaMenuCategory } from "@prisma/client";
import type {
  MenuItem,
  RestaurantMenu,
  Category,
  PortionSize,
  MenuCategory,
  RestaurantImageOption,
} from "@/lib/types/meal";

export class MenuItemRepository {
  private static readonly menuItemInclude = {
    category: true,
    image: true,
  } as const;

  private static async getMenuCategoryEnumSchema(
    db: Prisma.TransactionClient | typeof prisma = prisma,
  ): Promise<"menu" | "public"> {
    const result = await db.$queryRaw<Array<{ schema_name: string }>>(Prisma.sql`
      SELECT enum_ns.nspname AS schema_name
      FROM pg_attribute attr
      JOIN pg_class cls ON cls.oid = attr.attrelid
      JOIN pg_namespace table_ns ON table_ns.oid = cls.relnamespace
      JOIN pg_type typ ON typ.oid = attr.atttypid
      JOIN pg_namespace enum_ns ON enum_ns.oid = typ.typnamespace
      WHERE table_ns.nspname = 'menu'
        AND cls.relname = 'MenuItem'
        AND attr.attname = 'type'
        AND attr.attnum > 0
        AND NOT attr.attisdropped
      LIMIT 1
    `);

    const schemaName = result[0]?.schema_name;
    if (schemaName === "menu" || schemaName === "public") {
      return schemaName;
    }

    throw new Error(
      `Unsupported schema for menu type enum: ${schemaName ?? "unknown"}`,
    );
  }

  private static async updateMenuItemType(
    db: Prisma.TransactionClient | typeof prisma,
    id: string,
    type: MenuCategory,
  ): Promise<void> {
    const enumSchema = await this.getMenuCategoryEnumSchema(db);
    const enumType = Prisma.raw(`"${enumSchema}"."MenuCategory"`);

    await db.$executeRaw(Prisma.sql`
      UPDATE "menu"."MenuItem"
      SET "type" = CAST(${type} AS ${enumType}),
          "updatedAt" = NOW()
      WHERE "id" = ${id}
    `);
  }

  // Get all menu items
  static async getAll(): Promise<MenuItem[]> {
    const menuItems = await prisma.menuItem.findMany({
      include: this.menuItemInclude,
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
    type?: MenuCategory;
    tags?: string[];
    imageId?: string | null;
  }): Promise<MenuItem> {
    if (data.type === undefined) {
      const menuItem = await prisma.menuItem.create({
        data: {
          name: data.name,
          description: data.description,
          categoryId: data.categoryId,
          tags: data.tags || [],
          imageId: data.imageId,
        },
        include: this.menuItemInclude,
      });

      return menuItem as unknown as MenuItem;
    }

    const menuType = data.type;

    return prisma.$transaction(async (tx) => {
      const created = await tx.menuItem.create({
        data: {
          name: data.name,
          description: data.description,
          categoryId: data.categoryId,
          tags: data.tags || [],
          imageId: data.imageId,
        },
        select: { id: true },
      });

      await this.updateMenuItemType(tx, created.id, menuType);

      const menuItem = await tx.menuItem.findUniqueOrThrow({
        where: { id: created.id },
        include: this.menuItemInclude,
      });

      return menuItem as unknown as MenuItem;
    });
  }

  // Update menu item (Global Abstract Food)
  static async update(
    id: string,
    data: Partial<{
      name: string;
      description?: string;
      categoryId: string;
      type?: MenuCategory;
      tags?: string[];
      imageId?: string | null;
    }>,
  ): Promise<MenuItem> {
    if (data.type === undefined) {
      const menuItem = await prisma.menuItem.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          categoryId: data.categoryId,
          tags: data.tags,
          imageId: data.imageId,
        },
        include: this.menuItemInclude,
      });

      return menuItem as unknown as MenuItem;
    }

    const menuType = data.type;

    return prisma.$transaction(async (tx) => {
      await tx.menuItem.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          categoryId: data.categoryId,
          tags: data.tags,
          imageId: data.imageId,
        },
        select: { id: true },
      });

      await this.updateMenuItemType(tx, id, menuType);

      const menuItem = await tx.menuItem.findUniqueOrThrow({
        where: { id },
        include: this.menuItemInclude,
      });

      return menuItem as unknown as MenuItem;
    });
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
    categoryNames?: string[];
    foodCategoryTypes?: string[];
    sortBy?: string;
    nearMe?: boolean;
    userLat?: number;
    userLng?: number;
  }): Promise<{ items: MenuItem[]; total: number }> {
    const {
      page,
      pageSize,
      search,
      categoryId,
      categoryNames,
      foodCategoryTypes,
      sortBy,
      nearMe,
      userLat,
      userLng,
    } = params;
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

    if (categoryNames && categoryNames.length > 0) {
      where.category = {
        name: { in: categoryNames },
      };
    }

    if (foodCategoryTypes && foodCategoryTypes.length > 0) {
      // Workaround: Prisma driver adapter doesn't properly qualify multi-schema enum types.
      // Cast the enum column to text so we compare text=text, bypassing the enum type system.
      const placeholders = foodCategoryTypes.map((_, i) => `$${i + 1}`).join(', ');
      const matchingIds = await prisma.$queryRawUnsafe<{ id: string }[]>(
        `SELECT "id" FROM menu."MenuItem" WHERE "type"::text IN (${placeholders})`,
        ...foodCategoryTypes
      );
      where.id = { in: matchingIds.map(r => r.id) };
    }

    const restaurantFilters: any = {};
    if (nearMe && userLat !== undefined && userLng !== undefined) {
      restaurantFilters.restaurant = {
        status: "PUBLISHED",
        latitude: {
          gte: userLat - 0.045,
          lte: userLat + 0.045,
        },
        longitude: {
          gte: userLng - 0.045,
          lte: userLng + 0.045,
        },
      };
    }

    if (Object.keys(restaurantFilters).length > 0) {
      where.restaurants = {
        some: restaurantFilters,
      };
    }

    let orderBy: any = { name: "asc" };
    if (sortBy === "popular") orderBy = { avgPrice: "asc" };

    const [items, total] = await Promise.all([
      prisma.menuItem.findMany({
        where,
        include: {
          category: true,
          image: true,
        },
        orderBy,
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
  static async rememberRestaurantImage(params: {
    restaurantId: string;
    imageId: string;
    sourceRestaurantMenuId?: string;
  }): Promise<void> {
    await prisma.restaurantImageLibrary.upsert({
      where: {
        restaurantId_imageId: {
          restaurantId: params.restaurantId,
          imageId: params.imageId,
        },
      },
      create: {
        restaurantId: params.restaurantId,
        imageId: params.imageId,
        sourceRestaurantMenuId: params.sourceRestaurantMenuId,
      },
      update: {
        sourceRestaurantMenuId:
          params.sourceRestaurantMenuId ?? undefined,
      },
    });
  }

  static async deleteLibraryImage(restaurantId: string, imageId: string): Promise<void> {
    // 1. Remove from library table
    await prisma.restaurantImageLibrary.deleteMany({ where: { restaurantId, imageId } });

    // 2. Clear this image from any meal assignments for this restaurant
    await prisma.restaurantMenu.updateMany({
      where: { restaurantId, imageId },
      data: { imageId: null },
    });

    // 3. Clear from restaurant logo / menu-image if they reference this file
    const r = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { logoId: true, menuImageId: true },
    });
    const patch: { logoId?: null; menuImageId?: null } = {};
    if (r?.logoId === imageId) patch.logoId = null;
    if (r?.menuImageId === imageId) patch.menuImageId = null;
    if (Object.keys(patch).length > 0) {
      await prisma.restaurant.update({ where: { id: restaurantId }, data: patch });
    }
  }

  static async getRestaurantImagePool(
    restaurantId: string,
    excludeRestaurantMenuId?: string,
  ): Promise<RestaurantImageOption[]> {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        logoId: true,
        logo: { select: { path: true } },
        menuImageId: true,
        menuImage: { select: { path: true } },
      },
    });

    const libraryItems = await prisma.restaurantImageLibrary.findMany({
      where: { restaurantId },
      include: {
        image: { select: { path: true } },
        sourceRestaurantMenu: {
          select: {
            name: true,
            menuItem: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 500,
    });

    const restaurantMenuItems = await prisma.restaurantMenu.findMany({
      where: {
        restaurantId,
        ...(excludeRestaurantMenuId
          ? { NOT: { id: excludeRestaurantMenuId } }
          : {}),
        OR: [{ imageId: { not: null } }, { menuItem: { imageId: { not: null } } }],
      },
      select: {
        id: true,
        name: true,
        imageId: true,
        image: { select: { path: true } },
        menuItem: {
          select: {
            name: true,
            imageId: true,
            image: { select: { path: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 250,
    });

    const imagePool = new Map<string, RestaurantImageOption>();

    // 1. Add current logo and menu image first
    if (restaurant?.logoId && restaurant.logo?.path) {
      imagePool.set(restaurant.logoId, {
        imageId: restaurant.logoId,
        imageUrl: restaurant.logo.path,
        sourceMealName: "Restaurant Logo",
        sourceType: "logo",
      });
    }

    if (restaurant?.menuImageId && restaurant.menuImage?.path) {
      imagePool.set(restaurant.menuImageId, {
        imageId: restaurant.menuImageId,
        imageUrl: restaurant.menuImage.path,
        sourceMealName: "Restaurant Menu Image",
        sourceType: "menu_image",
      });
    }

    // 2. Add items from library
    for (const item of libraryItems) {
      if (!item.image?.path) continue;
      if (imagePool.has(item.imageId)) continue;

      imagePool.set(item.imageId, {
        imageId: item.imageId,
        imageUrl: item.image.path,
        sourceMealName:
          item.sourceRestaurantMenu?.name?.trim() ||
          item.sourceRestaurantMenu?.menuItem?.name ||
          "Saved Library Image",
        sourceType: "library",
      });
    }

    // 3. Add items currently active on meals
    for (const item of restaurantMenuItems) {
      const sourceMealName = item.name?.trim() || item.menuItem.name || "Menu item";

      if (item.imageId && item.image?.path && !imagePool.has(item.imageId)) {
        imagePool.set(item.imageId, {
          imageId: item.imageId,
          imageUrl: item.image.path,
          sourceMealName,
          sourceType: "restaurant_menu",
        });
      }

      if (
        item.menuItem.imageId &&
        item.menuItem.image?.path &&
        !imagePool.has(item.menuItem.imageId)
      ) {
        imagePool.set(item.menuItem.imageId, {
          imageId: item.menuItem.imageId,
          imageUrl: item.menuItem.image.path,
          sourceMealName: item.menuItem.name || sourceMealName,
          sourceType: "global_menu_item",
        });
      }
    }

    return Array.from(imagePool.values());
  }

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

  // Get restaurant menu item by ID
  static async getById(id: string): Promise<RestaurantMenu | null> {
    const restaurantMenu = await prisma.restaurantMenu.findUnique({
      where: { id },
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

  // Paginated and filtered menu items for a specific restaurant
  static async getPaginated(params: {
    restaurantId?: string;
    page: number;
    pageSize: number;
    search?: string;
    foodCategoryType?: string;
    dietaryCategory?: string;
    minPrice?: number;
    maxPrice?: number;
    spicyLevel?: number;
    portionSize?: string;
    categoryNames?: string[];
    sortBy?: string;
    userLat?: number;
    userLng?: number;
    nearMe?: boolean;
  }): Promise<{ items: RestaurantMenu[]; total: number }> {
    const {
      restaurantId,
      page,
      pageSize,
      search,
      foodCategoryType,
      dietaryCategory,
      minPrice,
      maxPrice,
      spicyLevel,
      portionSize,
      categoryNames,
      sortBy,
      userLat,
      userLng,
      nearMe,
    } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (restaurantId) {
      where.restaurantId = restaurantId;
    } else {
      // Global feed: only show items from published restaurants
      where.restaurant = {
        status: "PUBLISHED",
        ...(nearMe && userLat && userLng
          ? {
              latitude: {
                gte: userLat - 0.045,
                lte: userLat + 0.045,
              },
              longitude: {
                gte: userLng - 0.045,
                lte: userLng + 0.045,
              },
            }
          : {}),
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { menuItem: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (foodCategoryType && foodCategoryType !== "all") {
      where.foodCategoryType = foodCategoryType;
    }

    if (dietaryCategory && dietaryCategory !== "all") {
      where.dietaryCategory =
        dietaryCategory === "fasting" ? "YETSOM" : "YEFITSIK";
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (spicyLevel !== undefined && spicyLevel !== null) {
      where.spicyLevel = spicyLevel;
    }

    if (portionSize) {
      where.portionSize = portionSize;
    }

    if (categoryNames && categoryNames.length > 0) {
      where.menuItem = {
        category: {
          name: { in: categoryNames },
        },
      };
    }

    let orderBy: any = { sortOrder: "asc" };
    if (sortBy === "popular") orderBy = { isPopular: "desc" };
    if (sortBy === "recommended") orderBy = { isRecommended: "desc" };
    if (sortBy === "price_asc") orderBy = { price: "asc" };

    const [items, total] = await Promise.all([
      prisma.restaurantMenu.findMany({
        where,
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
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.restaurantMenu.count({ where }),
    ]);

    return { items: items as unknown as RestaurantMenu[], total };
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

    if (restaurantMenu.imageId) {
      await this.rememberRestaurantImage({
        restaurantId: restaurantMenu.restaurantId,
        imageId: restaurantMenu.imageId,
        sourceRestaurantMenuId: restaurantMenu.id,
      });
    }

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
      menuItemId?: string;
    }>,
  ): Promise<RestaurantMenu> {
    const existingRestaurantMenu = await prisma.restaurantMenu.findUnique({
      where: { id },
      select: {
        restaurantId: true,
        imageId: true,
      },
    });

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
        menuItemId: data.menuItemId,
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

    if (existingRestaurantMenu?.imageId) {
      await this.rememberRestaurantImage({
        restaurantId: existingRestaurantMenu.restaurantId,
        imageId: existingRestaurantMenu.imageId,
        sourceRestaurantMenuId: id,
      });
    }

    if (restaurantMenu.imageId) {
      await this.rememberRestaurantImage({
        restaurantId: restaurantMenu.restaurantId,
        imageId: restaurantMenu.imageId,
        sourceRestaurantMenuId: restaurantMenu.id,
      });
    }

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
