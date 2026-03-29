import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
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
    { name: "Ethiopian", sortOrder: 1 },
    { name: "Fast Food", sortOrder: 2 },
    { name: "Seafood", sortOrder: 3 },
    { name: "Italian", sortOrder: 4 },
    { name: "Drinks", sortOrder: 5 },
    { name: "Desserts", sortOrder: 6 },
    { name: "Snacks", sortOrder: 7 },
    { name: "Breakfast", sortOrder: 8 },
  ];

  console.log("Cleaning up existing categories...");
  await prisma.category.deleteMany();

  console.log("Seeding categories...");
  for (const cat of categories) {
    try {
      await prisma.category.create({
        data: {
          name: cat.name,
          sortOrder: cat.sortOrder,
          isActive: true,
        },
      });
      console.log(`Created category: ${cat.name}`);
    } catch (error) {
      console.error(`Failed to create category ${cat.name}:`, error);
    }
  }

  console.log("Seeding completed successfully!");
  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
