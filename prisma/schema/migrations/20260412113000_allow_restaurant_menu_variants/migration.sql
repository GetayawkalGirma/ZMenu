-- Drop unique constraint so a restaurant can have multiple variants
-- for the same global menu item (e.g. Double Burger + Triple Burger).
DROP INDEX IF EXISTS "menu"."RestaurantMenu_restaurantId_menuItemId_key";

-- Keep pair lookups fast for list/search operations.
CREATE INDEX IF NOT EXISTS "RestaurantMenu_restaurantId_menuItemId_idx"
ON "menu"."RestaurantMenu"("restaurantId", "menuItemId");
