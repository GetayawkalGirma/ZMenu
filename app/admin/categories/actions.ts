"use server";

import { CategoryRepository } from '@/repositories/menu-item.repository';
import { revalidatePath } from 'next/cache';
import type { Category } from '@/lib/types/meal';

// Get all categories
export async function getCategories() {
  try {
    const categories = await CategoryRepository.getAll();
    return { success: true, data: categories };
  } catch (error) {
    console.error('Failed to get categories:', error);
    return { success: false, error: 'Failed to fetch categories' };
  }
}

// Create category
export async function createCategory(data: { name: string; description?: string }) {
  try {
    const category = await CategoryRepository.create({
      name: data.name,
      description: data.description,
      isActive: true,
      sortOrder: 0,
    });
    revalidatePath('/admin/categories');
    return { success: true, data: category };
  } catch (error) {
    console.error('Failed to create category:', error);
    return { success: false, error: 'Failed to create category' };
  }
}

// Update category
export async function updateCategory(id: string, data: { name: string; description?: string }) {
  try {
    const category = await CategoryRepository.update(id, {
      name: data.name,
      description: data.description,
    });
    revalidatePath('/admin/categories');
    return { success: true, data: category };
  } catch (error) {
    console.error('Failed to update category:', error);
    return { success: false, error: 'Failed to update category' };
  }
}

// Delete category
export async function deleteCategory(id: string) {
  try {
    const category = await CategoryRepository.delete(id);
    revalidatePath('/admin/categories');
    return { success: true, data: category };
  } catch (error) {
    console.error('Failed to delete category:', error);
    return { success: false, error: 'Failed to delete category' };
  }
}
