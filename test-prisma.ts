import prisma from "./lib/prisma";

async function testSearch() {
  try {
    console.log("Testing MenuItemRepository.search equivalent...");
    const query = "test";
    const menuItems = await prisma.menuItem.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        category: true,
      },
    });
    console.log("Success! Found", menuItems.length, "items.");
  } catch (error: any) {
    console.error("Search failed!");
    console.error(error);
    if (error.code) console.error("Error Code:", error.code);
    if (error.meta) console.error("Error Meta:", JSON.stringify(error.meta, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

testSearch();
