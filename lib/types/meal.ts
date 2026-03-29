import { Restaurant } from "./restaurant";

export interface MenuItem {
  id: string;
  name: string;
  description?: string | null;
  categoryId: string;
  category?: Category;
  tags: string[];
  imageId?: string | null;

  // Aggregated analytics
  avgPrice?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  priceCount?: number | null;

  createdAt: Date;
  updatedAt: Date;
  restaurants?: RestaurantMenu[];
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  foodType: FoodType;
  categoryType: FoodCategoryType;
  dietaryCategory: DietaryCategory;
  isActive: boolean;
  sortOrder?: number | null;
  createdAt: Date;
  updatedAt: Date;
  menuItems?: MenuItem[];
}

export interface RestaurantMenu {
  id: string;
  restaurantId: string;
  menuItemId: string;
  price: number;
  portionSize?: PortionSize | null;
  spicyLevel?: number | null;
  preparationTime?: number | null;
  ingredients: string[];
  calories?: number | null;
  isAvailable: boolean;
  isPopular: boolean;
  isRecommended: boolean;
  imageUrl?: string | null;
  imageId?: string | null;
  sortOrder?: number | null;
  createdAt: Date;
  updatedAt: Date;
  restaurant?: any;
  menuItem?: MenuItem;
}

export enum PortionSize {
  ONE_PERSON = "ONE_PERSON",
  TWO_PEOPLE = "TWO_PEOPLE",
  THREE_PEOPLE = "THREE_PEOPLE",
  FAMILY = "FAMILY",
}

export enum DietaryCategory {
  YETSOM = "YETSOM",
  YEFITSIK = "YEFITSIK",
}

export enum FoodType {
  BREAKFAST = "BREAKFAST",
  LUNCH = "LUNCH",
  SNACK = "SNACK",
  DINNER = "DINNER",
  EXTRA = "EXTRA",
}

export enum FoodCategoryType {
  FOOD = "FOOD",
  DRINK = "DRINK",
  EXTRA = "EXTRA",
}

// Form data for creating/updating a global MenuItem
export interface MenuItemFormData {
  name: string;
  description: string;
  categoryId: string;
  tags: string[];
  image?: File;
  imageUrl?: string;
  removeImage?: boolean;
}

// Form data for creating/updating a RestaurantMenu link
export interface RestaurantMenuFormData {
  price: number;
  portionSize?: PortionSize;
  spicyLevel?: number;
  preparationTime?: number;
  ingredients: string[];
  calories?: number;
  isAvailable: boolean;
  isPopular: boolean;
  isRecommended: boolean;
  imageUrl?: string;
  sortOrder?: number;
  image?: File;
  restaurantId: string;
  menuItemId: string;
  removeImage?: boolean; // Removal flag
}

// Data format for the unified MealForm (Legacy/Reference)
export interface MealFormData extends MenuItemFormData {
  // Restaurant-specific fields
  price?: number;
  portionSize?: PortionSize;
  spicyLevel?: number;
  preparationTime?: number;
  ingredients?: string[];
  calories?: number;
  isAvailable?: boolean;
  isPopular?: boolean;
  isRecommended?: boolean;
  imageUrl?: string;
  sortOrder?: number;
  image?: File;
  restImage?: File; // New for specific restaurant image
  restaurantId?: string;
  menuItemId?: string;
  removeImage?: boolean;
  removeRestImage?: boolean;
}

// For backward compatibility during migration
export interface MealWithId extends MealFormData {
  id: string;
}
