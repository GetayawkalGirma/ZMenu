import "dotenv/config";
import { supabase } from "../lib/supabase";
import prisma from "../lib/prisma";

async function initProject() {
  console.log("🛠️  Initializing Supabase Project Storage...");
  
  const { data, error } = await supabase.storage.createBucket('zmenu-storage', {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    fileSizeLimit: 5242880 // 5MB
  });

  if (error) {
    if (error.message.includes('already exists')) {
      console.log("✅ Bucket 'zmenu-storage' already exists.");
    } else {
      console.error("❌ Error creating bucket:", error.message);
    }
  } else {
    console.log("✅ Bucket 'zmenu-storage' created successfully.");
  }

  console.log("🌱 Seeding Base Menu Items...");
  
  try {
    // 1. Create a "General" category
    await prisma.category.upsert({
      where: { id: 'category_general' },
      create: { 
        id: 'category_general', 
        name: 'General', 
        description: 'General category for uncategorized items' 
      },
      update: {}
    });

    // 2. Create the "Other Food" MenuItem
    await prisma.menuItem.upsert({
      where: { id: 'cmo5f21hk00046pr98jxr6qgc' },
      create: { 
        id: 'cmo5f21hk00046pr98jxr6qgc', 
        name: 'Other Food', 
        description: 'Fallback category for food items',
        categoryId: 'category_general',
        type: 'MEAL'
      },
      update: {}
    });

    // 3. Create the "Other Drink" MenuItem
    await prisma.menuItem.upsert({
      where: { id: 'cmo5ezp5z00026pr9cnxjxogp' },
      create: { 
        id: 'cmo5ezp5z00026pr9cnxjxogp', 
        name: 'Other Drink', 
        description: 'Fallback category for drink items',
        categoryId: 'category_general',
        type: 'DRINK'
      },
      update: {}
    });

    console.log("✅ Base items seeded successfully.");
  } catch (dbError: any) {
    console.error("❌ Error seeding database:", dbError.message);
  }
}

initProject();
