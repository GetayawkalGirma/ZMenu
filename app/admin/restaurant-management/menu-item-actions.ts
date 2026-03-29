"use server";

import { MenuItemService, RestaurantMenuService } from '@/services/menu-item/menu-item.service';
import { revalidatePath } from 'next/cache';
import type { MealFormData } from '@/lib/types/meal';

// Get all menu items
export async function getMenuItems() {
  try {
    const menuItems = await MenuItemService.getAllMenuItems();
    return { success: true, data: menuItems };
  } catch (error) {
    console.error('Failed to get menu items:', error);
    return { success: false, error: 'Failed to fetch menu items' };
  }
}

// Get menu item by ID
export async function getMenuItemById(id: string) {
  try {
    const menuItem = await MenuItemService.getMenuItemById(id);
    return { success: true, data: menuItem };
  } catch (error) {
    console.error('Failed to get menu item:', error);
    return { success: false, error: 'Failed to fetch menu item' };
  }
}

// Search menu items
export async function searchMenuItems(query: string) {
  try {
    const menuItems = await MenuItemService.searchMenuItems(query);
    return { success: true, data: menuItems };
  } catch (error) {
    console.error('Failed to search menu items:', error);
    return { success: false, error: 'Failed to search menu items' };
  }
}

// Get menu items by category
export async function getMenuItemsByCategory(categoryId: string) {
  try {
    const menuItems = await MenuItemService.getMenuItemsByCategory(categoryId);
    return { success: true, data: menuItems };
  } catch (error) {
    console.error('Failed to get menu items by category:', error);
    return { success: false, error: 'Failed to fetch menu items by category' };
  }
}

// Create or update menu item (with deduplication)
export async function createOrUpdateMenuItem(data: MealFormData) {
  try {
    const result = await MenuItemService.createOrUpdateMenuItem(data);
    revalidatePath('/admin/restaurant-management');
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to create or update menu item:', error);
    return { success: false, error: 'Failed to save menu item' };
  }
}

// Update menu item
export async function updateMenuItem(id: string, data: Partial<MealFormData>) {
  try {
    const menuItem = await MenuItemService.updateMenuItem(id, data);
    revalidatePath('/admin/restaurant-management');
    return { success: true, data: menuItem };
  } catch (error) {
    console.error('Failed to update menu item:', error);
    return { success: false, error: 'Failed to update menu item' };
  }
}

// Delete menu item
export async function deleteMenuItem(id: string) {
  try {
    const menuItem = await MenuItemService.deleteMenuItem(id);
    revalidatePath('/admin/restaurant-management');
    return { success: true, data: menuItem };
  } catch (error) {
    console.error('Failed to delete menu item:', error);
    return { success: false, error: 'Failed to delete menu item' };
  }
}

// Add menu item to restaurant (creates menu item if needed)
export async function addMenuItemToRestaurant(
  restaurantId: string,
  menuItemData: MealFormData
) {
  try {
    const result = await RestaurantMenuService.addMenuItemToRestaurant(
      restaurantId,
      menuItemData
    );
    revalidatePath(`/admin/restaurant-management/${restaurantId}/edit`);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to add menu item to restaurant:', error);
    return { success: false, error: 'Failed to add menu item to restaurant' };
  }
}

// Get restaurant menu
export async function getRestaurantMenu(restaurantId: string) {
  try {
    const restaurantMenu = await RestaurantMenuService.getRestaurantMenu(restaurantId);
    return { success: true, data: restaurantMenu };
  } catch (error) {
    console.error('Failed to get restaurant menu:', error);
    return { success: false, error: 'Failed to fetch restaurant menu' };
  }
}

// Update restaurant menu item
export async function updateRestaurantMenuItem(id: string, data: any) {
  try {
    const result = await RestaurantMenuService.updateRestaurantMenuItem(id, data);
    if (data.restaurantId) {
      revalidatePath(`/admin/restaurant-management/${data.restaurantId}/edit`);
    }
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to update restaurant menu item:', error);
    return { success: false, error: 'Failed to update restaurant menu item' };
  }
}

// Remove menu item from restaurant
export async function removeMenuItemFromRestaurant(restaurantId: string, menuItemId: string) {
  try {
    const restaurantMenuItem = await RestaurantMenuService.removeMenuItemFromRestaurant(
      restaurantId,
      menuItemId
    );
    revalidatePath(`/admin/restaurant-management/${restaurantId}/edit`);
    return { success: true, data: restaurantMenuItem };
  } catch (error) {
    console.error('Failed to remove menu item from restaurant:', error);
    return { success: false, error: 'Failed to remove menu item from restaurant' };
  }
}

// Get all categories
export async function getCategories() {
  try {
    const categories = await MenuItemService.getAllCategories();
    return { success: true, data: categories };
  } catch (error) {
    console.error('Failed to get categories:', error);
    return { success: false, error: 'Failed to fetch categories' };
  }
}
