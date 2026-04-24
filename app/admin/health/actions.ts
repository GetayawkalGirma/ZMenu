"use server";

import prisma from "@/lib/prisma";

export async function testRawQuery() {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    return { success: true, message: `Raw query (SELECT 1) succeeded in ${Date.now() - start}ms` };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function testFetchRestaurants() {
  try {
    const start = Date.now();
    const count = await prisma.restaurant.count();
    return { success: true, message: `Successfully fetched count (${count}) from restaurant.Restaurant in ${Date.now() - start}ms` };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function testFetchMeals() {
  try {
    const start = Date.now();
    const count = await prisma.menuItem.count();
    return { success: true, message: `Successfully fetched count (${count}) from menu.MenuItem in ${Date.now() - start}ms` };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function testCloudStorage() {
  try {
    const start = Date.now();
    const { fileService } = await import("@/services/file/file.service");
    
    // Create a tiny dummy text file
    const dummyBuffer = Buffer.from("ZDish Storage Test " + new Date().toISOString());
    const result = await fileService.uploadFile(
      dummyBuffer,
      "health-check-test.txt",
      "text/plain"
    );

    return { 
      success: true, 
      message: `Storage test succeeded! File uploaded as ${result.path} in ${Date.now() - start}ms` 
    };
  } catch (err: any) {
    return { success: false, message: `Storage Error: ${err.message}` };
  }
}

export async function checkEnvVars() {
  return {
    dbUrlSet: !!process.env.DATABASE_URL,
    directUrlSet: !!process.env.DIRECT_URL,
    storageUrlSet: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    storageKeySet: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    nodeEnv: process.env.NODE_ENV,
  };
}
