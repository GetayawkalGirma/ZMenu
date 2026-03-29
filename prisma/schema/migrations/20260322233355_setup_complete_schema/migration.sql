-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "menu";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "restaurant";

-- CreateEnum
CREATE TYPE "menu"."FoodType" AS ENUM ('BREAKFAST', 'LUNCH', 'SNACK', 'DINNER', 'EXTRA');

-- CreateEnum
CREATE TYPE "menu"."FoodCategoryType" AS ENUM ('FOOD', 'DRINK', 'EXTRA');

-- CreateEnum
CREATE TYPE "menu"."DietaryCategory" AS ENUM ('YETSOM', 'YEFITSIK');

-- CreateEnum
CREATE TYPE "menu"."PortionSize" AS ENUM ('ONE_PERSON', 'TWO_PEOPLE', 'THREE_PEOPLE', 'FAMILY');

-- CreateTable
CREATE TABLE "menu"."Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "foodType" "menu"."FoodType" NOT NULL,
    "categoryType" "menu"."FoodCategoryType" NOT NULL,
    "dietaryCategory" "menu"."DietaryCategory" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu"."MenuItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT NOT NULL,
    "dietaryCategory" "menu"."DietaryCategory" NOT NULL,
    "allergens" TEXT[],
    "ingredients" TEXT[],
    "calories" INTEGER,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu"."RestaurantMenu" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "portionSize" "menu"."PortionSize" NOT NULL,
    "spicyLevel" INTEGER,
    "preparationTime" INTEGER,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu"."MenuItemModifier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "menuItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItemModifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant"."Restaurant" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "location" TEXT,
    "logoUrl" TEXT,
    "menuImageUrl" TEXT,
    "rating" DOUBLE PRECISION,
    "noiselevel" TEXT,
    "privacylevel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant"."Feature" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant"."RestaurantFeatureAssignment" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,

    CONSTRAINT "RestaurantFeatureAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantMenu_restaurantId_menuItemId_key" ON "menu"."RestaurantMenu"("restaurantId", "menuItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_name_key" ON "restaurant"."Feature"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantFeatureAssignment_restaurantId_featureId_key" ON "restaurant"."RestaurantFeatureAssignment"("restaurantId", "featureId");

-- AddForeignKey
ALTER TABLE "menu"."MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "menu"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu"."RestaurantMenu" ADD CONSTRAINT "RestaurantMenu_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"."Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu"."RestaurantMenu" ADD CONSTRAINT "RestaurantMenu_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "menu"."MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu"."MenuItemModifier" ADD CONSTRAINT "MenuItemModifier_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "menu"."MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant"."RestaurantFeatureAssignment" ADD CONSTRAINT "RestaurantFeatureAssignment_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"."Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant"."RestaurantFeatureAssignment" ADD CONSTRAINT "RestaurantFeatureAssignment_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "restaurant"."Feature"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
