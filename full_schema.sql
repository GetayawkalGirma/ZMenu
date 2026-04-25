-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "app_storage";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "menu";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "restaurant";

-- CreateEnum
CREATE TYPE "menu"."DietaryCategory" AS ENUM ('YETSOM', 'YEFITSIK');

-- CreateEnum
CREATE TYPE "menu"."FoodCategoryType" AS ENUM ('FOOD', 'DRINK', 'EXTRA');

-- CreateEnum
CREATE TYPE "menu"."MenuCategory" AS ENUM ('MEAL', 'DRINK', 'SIDES');

-- CreateEnum
CREATE TYPE "menu"."PortionSize" AS ENUM ('ONE_PERSON', 'TWO_PEOPLE', 'THREE_PEOPLE', 'FAMILY');

-- CreateEnum
CREATE TYPE "restaurant"."FeedbackType" AS ENUM ('MEAL_INFO', 'MENU_IMAGES');

-- CreateEnum
CREATE TYPE "restaurant"."FeedbackStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "menu"."Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu"."MenuItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "type" "menu"."MenuCategory",
    "tags" TEXT[],
    "avgPrice" DOUBLE PRECISION,
    "minPrice" DOUBLE PRECISION,
    "maxPrice" DOUBLE PRECISION,
    "priceCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imageId" TEXT,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu"."RestaurantMenu" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "foodCategoryType" "menu"."FoodCategoryType",
    "dietaryCategory" "menu"."DietaryCategory",
    "price" DOUBLE PRECISION NOT NULL,
    "portionSize" "menu"."PortionSize",
    "spicyLevel" INTEGER,
    "preparationTime" INTEGER,
    "ingredients" TEXT[],
    "calories" INTEGER,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "imageId" TEXT,
    "imageUrl" TEXT,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant"."Restaurant" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "location" TEXT,
    "geoLocation" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "logoUrl" TEXT,
    "logoId" TEXT,
    "menuImageUrl" TEXT,
    "menuImageId" TEXT,
    "rating" DOUBLE PRECISION,
    "noiselevel" TEXT,
    "privacylevel" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
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

-- CreateTable
CREATE TABLE "restaurant"."RestaurantImageLibrary" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "sourceRestaurantMenuId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantImageLibrary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant"."UserFeedback" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "restaurantMenuId" TEXT,
    "type" "restaurant"."FeedbackType" NOT NULL,
    "status" "restaurant"."FeedbackStatus" NOT NULL DEFAULT 'PENDING',
    "suggestedPrice" DOUBLE PRECISION,
    "suggestedPortionSize" TEXT,
    "suggestedPreparationTime" INTEGER,
    "uploadedImageUrls" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeededPost" (
    "id" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeededPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_storage"."File" (
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
CREATE UNIQUE INDEX "Category_name_key" ON "menu"."Category"("name");

-- CreateIndex
CREATE INDEX "RestaurantMenu_restaurantId_menuItemId_idx" ON "menu"."RestaurantMenu"("restaurantId", "menuItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_name_key" ON "restaurant"."Feature"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantFeatureAssignment_restaurantId_featureId_key" ON "restaurant"."RestaurantFeatureAssignment"("restaurantId", "featureId");

-- CreateIndex
CREATE INDEX "RestaurantImageLibrary_restaurantId_updatedAt_idx" ON "restaurant"."RestaurantImageLibrary"("restaurantId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantImageLibrary_restaurantId_imageId_key" ON "restaurant"."RestaurantImageLibrary"("restaurantId", "imageId");

-- CreateIndex
CREATE UNIQUE INDEX "SeededPost_telegramId_key" ON "SeededPost"("telegramId");

-- CreateIndex
CREATE INDEX "SeededPost_telegramId_idx" ON "SeededPost"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "File_hash_key" ON "app_storage"."File"("hash");

-- AddForeignKey
ALTER TABLE "menu"."MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "menu"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu"."MenuItem" ADD CONSTRAINT "MenuItem_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "app_storage"."File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu"."RestaurantMenu" ADD CONSTRAINT "RestaurantMenu_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "app_storage"."File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu"."RestaurantMenu" ADD CONSTRAINT "RestaurantMenu_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"."Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu"."RestaurantMenu" ADD CONSTRAINT "RestaurantMenu_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "menu"."MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant"."Restaurant" ADD CONSTRAINT "Restaurant_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "app_storage"."File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant"."Restaurant" ADD CONSTRAINT "Restaurant_menuImageId_fkey" FOREIGN KEY ("menuImageId") REFERENCES "app_storage"."File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant"."RestaurantFeatureAssignment" ADD CONSTRAINT "RestaurantFeatureAssignment_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"."Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant"."RestaurantFeatureAssignment" ADD CONSTRAINT "RestaurantFeatureAssignment_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "restaurant"."Feature"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant"."RestaurantImageLibrary" ADD CONSTRAINT "RestaurantImageLibrary_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"."Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant"."RestaurantImageLibrary" ADD CONSTRAINT "RestaurantImageLibrary_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "app_storage"."File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant"."RestaurantImageLibrary" ADD CONSTRAINT "RestaurantImageLibrary_sourceRestaurantMenuId_fkey" FOREIGN KEY ("sourceRestaurantMenuId") REFERENCES "menu"."RestaurantMenu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant"."UserFeedback" ADD CONSTRAINT "UserFeedback_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"."Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant"."UserFeedback" ADD CONSTRAINT "UserFeedback_restaurantMenuId_fkey" FOREIGN KEY ("restaurantMenuId") REFERENCES "menu"."RestaurantMenu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

