const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const restaurants = await prisma.restaurant.findMany({
    select: {
      id: true,
      name: true,
      status: true
    }
  });
  console.log('--- RESTAURANTS ---');
  console.log(JSON.stringify(restaurants, null, 2));

  const menuItems = await prisma.menuItem.findMany({
    take: 5,
    select: {
      id: true,
      name: true
    }
  });
  console.log('--- MENU ITEMS ---');
  console.log(JSON.stringify(menuItems, null, 2));

  const restaurantMenu = await prisma.restaurantMenu.findMany({
    take: 5,
    select: {
      id: true,
      restaurantId: true,
      menuItemId: true
    }
  });
  console.log('--- RESTAURANT MENU ---');
  console.log(JSON.stringify(restaurantMenu, null, 2));

  await prisma.$disconnect();
}

check();
