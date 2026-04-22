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

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantImageLibrary_restaurantId_imageId_key"
ON "restaurant"."RestaurantImageLibrary"("restaurantId", "imageId");

-- CreateIndex
CREATE INDEX "RestaurantImageLibrary_restaurantId_updatedAt_idx"
ON "restaurant"."RestaurantImageLibrary"("restaurantId", "updatedAt");

-- AddForeignKey
ALTER TABLE "restaurant"."RestaurantImageLibrary"
ADD CONSTRAINT "RestaurantImageLibrary_restaurantId_fkey"
FOREIGN KEY ("restaurantId") REFERENCES "restaurant"."Restaurant"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant"."RestaurantImageLibrary"
ADD CONSTRAINT "RestaurantImageLibrary_imageId_fkey"
FOREIGN KEY ("imageId") REFERENCES "app_storage"."File"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant"."RestaurantImageLibrary"
ADD CONSTRAINT "RestaurantImageLibrary_sourceRestaurantMenuId_fkey"
FOREIGN KEY ("sourceRestaurantMenuId") REFERENCES "menu"."RestaurantMenu"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
