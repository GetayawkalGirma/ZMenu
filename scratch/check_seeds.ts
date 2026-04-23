import prisma from "../lib/prisma";

async function check() {
  try {
    const posts = await prisma.seededPost.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    console.log("Last 10 seeded posts (by createdAt):");
    console.table(posts.map(p => ({ telegramId: p.telegramId, createdAt: p.createdAt })));

    const postsSortedByString = await prisma.seededPost.findFirst({
      orderBy: { telegramId: 'desc' }
    });
    console.log("Highest telegramId by string sort:", postsSortedByString?.telegramId);

    // Find the actual numeric max
    const allSeeds = await prisma.seededPost.findMany({
        select: { telegramId: true }
    });
    const maxId = Math.max(...allSeeds.map(s => parseInt(s.telegramId)).filter(id => !isNaN(id)));
    console.log("Actual numeric max telegramId:", maxId);
  } catch (e) {
    console.error("Error:", e);
  }
}

check().finally(() => prisma.$disconnect());
