/*
  Warnings:

  - You are about to drop the column `categoryType` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `dietaryCategory` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `foodType` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `allergens` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `calories` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `dietaryCategory` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `ingredients` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `isAvailable` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the `MenuItemModifier` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "storage";

-- DropForeignKey
ALTER TABLE "menu"."MenuItemModifier" DROP CONSTRAINT "MenuItemModifier_menuItemId_fkey";

-- DropForeignKey
ALTER TABLE "menu"."RestaurantMenu" DROP CONSTRAINT "RestaurantMenu_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "restaurant"."RestaurantFeatureAssignment" DROP CONSTRAINT "RestaurantFeatureAssignment_restaurantId_fkey";

-- AlterTable
ALTER TABLE "menu"."Category" DROP COLUMN "categoryType",
DROP COLUMN "dietaryCategory",
DROP COLUMN "foodType";

-- AlterTable
ALTER TABLE "menu"."MenuItem" DROP COLUMN "allergens",
DROP COLUMN "calories",
DROP COLUMN "dietaryCategory",
DROP COLUMN "imageUrl",
DROP COLUMN "ingredients",
DROP COLUMN "isAvailable",
DROP COLUMN "price",
ADD COLUMN     "avgPrice" DOUBLE PRECISION,
ADD COLUMN     "imageId" TEXT,
ADD COLUMN     "maxPrice" DOUBLE PRECISION,
ADD COLUMN     "minPrice" DOUBLE PRECISION,
ADD COLUMN     "priceCount" INTEGER,
ADD COLUMN     "tags" TEXT[];

-- AlterTable
ALTER TABLE "menu"."RestaurantMenu" ADD COLUMN     "calories" INTEGER,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "dietaryCategory" "menu"."DietaryCategory",
ADD COLUMN     "foodCategoryType" "menu"."FoodCategoryType",
ADD COLUMN     "imageId" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "ingredients" TEXT[],
ADD COLUMN     "isPopular" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isRecommended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" TEXT,
ALTER COLUMN "portionSize" DROP NOT NULL;

-- AlterTable
ALTER TABLE "restaurant"."Restaurant" ADD COLUMN     "geoLocation" TEXT,
ADD COLUMN     "logoId" TEXT,
ADD COLUMN     "menuImageId" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'DRAFT';

-- DropTable
DROP TABLE "menu"."MenuItemModifier";

-- DropEnum
DROP TYPE "menu"."FoodType";

-- CreateTable
CREATE TABLE "storage"."File" (
    "id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "File_hash_key" ON "storage"."File"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "menu"."Category"("name");

-- AddForeignKey
ALTER TABLE "menu"."MenuItem" ADD CONSTRAINT "MenuItem_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "storage"."File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu"."RestaurantMenu" ADD CONSTRAINT "RestaurantMenu_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "storage"."File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu"."RestaurantMenu" ADD CONSTRAINT "RestaurantMenu_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"."Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant"."Restaurant" ADD CONSTRAINT "Restaurant_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "storage"."File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant"."Restaurant" ADD CONSTRAINT "Restaurant_menuImageId_fkey" FOREIGN KEY ("menuImageId") REFERENCES "storage"."File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant"."RestaurantFeatureAssignment" ADD CONSTRAINT "RestaurantFeatureAssignment_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"."Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
