import { PrismaClient } from "@prisma/client";
import pkg from "pg";
const { Pool } = pkg;
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const categories = [
    { name: "Breakfast", foodType: "BREAKFAST", categoryType: "FOOD", dietaryCategory: "YEFITSIK", sortOrder: 1 },
    { name: "Lunch", foodType: "LUNCH", categoryType: "FOOD", dietaryCategory: "YEFITSIK", sortOrder: 2 },
    { name: "Dinner", foodType: "DINNER", categoryType: "FOOD", dietaryCategory: "YEFITSIK", sortOrder: 3 },
    { name: "Snacks", foodType: "SNACK", categoryType: "FOOD", dietaryCategory: "YEFITSIK", sortOrder: 4 },
    { name: "Drinks", foodType: "EXTRA", categoryType: "DRINK", dietaryCategory: "YEFITSIK", sortOrder: 5 },
    { name: "Fast Food", foodType: "LUNCH", categoryType: "FOOD", dietaryCategory: "YEFITSIK", sortOrder: 6 },
    { name: "Ethiopian", foodType: "LUNCH", categoryType: "FOOD", dietaryCategory: "YETSOM", sortOrder: 7 },
    { name: "Desserts", foodType: "SNACK", categoryType: "FOOD", dietaryCategory: "YEFITSIK", sortOrder: 8 },
  ];

  console.log("Cleaning up existing categories...");
  try {
    await prisma.category.deleteMany();
    console.log("Cleanup successful.");
  } catch (e) {
    console.log("Cleanup skipped or failed (might be empty):", e.message);
  }

  console.log("Seeding categories...");
  for (const cat of categories) {
    try {
      await prisma.category.create({
        data: {
          name: cat.name,
          foodType: cat.foodType,
          categoryType: cat.categoryType,
          dietaryCategory: cat.dietaryCategory,
          sortOrder: cat.sortOrder,
          isActive: true
        }
      });
      console.log(`Created category: ${cat.name}`);
    } catch (error) {
       console.error(`Failed to create category ${cat.name}:`, error.message);
    }
  }

  console.log("Seeding completed!");
  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => {
  console.error("Fatal error:", e);
  process.exit(1);
});
