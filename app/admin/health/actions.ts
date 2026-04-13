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

export async function checkEnvVars() {
  return {
    dbUrlSet: !!process.env.DATABASE_URL,
    directUrlSet: !!process.env.DIRECT_URL,
    dbUrlMasked: process.env.DATABASE_URL?.replace(/:([^@]+)@/, ":****@"),
    nodeEnv: process.env.NODE_ENV,
  };
}
