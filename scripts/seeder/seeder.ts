import prisma from "../../lib/prisma";
import "dotenv/config";
import fs from "fs";

function getGoogleApiKey() {
  const externalEnvPath = "/Users/yawkal/Documents/imposter folder/word seeder/.env";
  try {
    const content = fs.readFileSync(externalEnvPath, "utf-8");
    const match = content.match(/GOOGLE_API_KEY=([^\s]+)/);
    return match ? match[1] : null;
  } catch (e) {
    return process.env.GOOGLE_API_KEY;
  }
}

interface AIServiceResponse {
  hasValidData: boolean;
  restaurant: {
    name: string | null;
    location: string | null;
    neighborhood: string | null;
    mapLink: string | null;
  } | null;
  meals: Array<{
    name: string;
    price: number | string;
    description: string | null;
    spicyLevel: number | null;
    imageUrl: string | null;
    menuItemId: string;
  }>;
}

class FoodismServiceSeeder {
  private prisma = prisma;
  private apiKey: string;

  constructor() {
    this.apiKey = getGoogleApiKey() || "";
  }

  async run() {
    console.log("🚀 Starting AI-Powered Foodism Seeder (Enhanced Emojis Analysis)...");
    try {
      const resp = await fetch("https://t.me/s/Foodism11");
      const html = await resp.text();
      
      const messageBlocks = this.extractMessageBlocks(html);
      console.log(`🔍 Found ${messageBlocks.length} messages in HTML. Analysing...`);

      const availableMenuItems = await this.prisma.menuItem.findMany({
        select: { id: true, name: true }
      });

      if (availableMenuItems.length === 0) {
        console.error("❌ No global menu items found in the DB. Please create some MenuItems first so the AI can map to them.");
        return;
      }

      for (const block of messageBlocks) {
        console.log("\n--- Analysing Message Block ---");
        
        const aiData = await this.askAI(block.text, block.images, availableMenuItems);
        
        console.log("🤖 AI Found:", JSON.stringify(aiData, null, 2));

        if (!aiData.hasValidData || !aiData.restaurant?.name || !aiData.meals || aiData.meals.length === 0) {
          console.log("⏭️ Skipping: Post doesn't have required Restaurant + Menu pattern.");
          continue;
        }

        // 1. Restaurant Logic
        let restaurant = await this.prisma.restaurant.findFirst({
          where: { 
            name: { equals: aiData.restaurant.name! }
          }
        });

        if (!restaurant) {
          restaurant = await this.prisma.restaurant.create({
            data: {
              name: aiData.restaurant.name,
              location: aiData.restaurant.neighborhood || aiData.restaurant.location || "Addis Ababa",
              geoLocation: aiData.restaurant.mapLink,
              status: "PUBLISHED"
            }
          });
          console.log(`🏠 SUCCESS: New Restaurant Created: ${restaurant.name}`);
        } else {
          console.log(`🏠 INFO: Restaurant found in DB: ${restaurant.name}`);
        }

        // 2. Meal Logic
        for (const meal of aiData.meals) {
          const cleanPrice = typeof meal.price === 'string' ? parseInt(meal.price.replace(/[^\d]/g, "")) : meal.price;
          
          if (!meal.name || !cleanPrice) continue;

          // Deduplicate
          const existingMeal = await this.prisma.restaurantMenu.findFirst({
            where: {
              restaurantId: restaurant.id,
              name: { equals: meal.name }
            }
          });

          if (existingMeal) {
            console.log(`⏩ Skip: Already seeded ${meal.name}`);
            continue;
          }

          try {
            await this.prisma.restaurantMenu.create({
              data: {
                restaurantId: restaurant.id,
                menuItemId: meal.menuItemId,
                name: meal.name,
                price: cleanPrice,
                description: meal.description || `Sourced from Foodism.`,
                spicyLevel: meal.spicyLevel || 0,
                isAvailable: true,
                imageUrl: meal.imageUrl,
                preparationTime: 25
              }
            });
            console.log(`🍔 SUCCESS: Added -> ${meal.name} @ ${cleanPrice} ETB`);
          } catch (err: any) {
             console.error(`❌ DB Error for ${meal.name}:`, err.message);
          }
        }
      }
      
      console.log("\n✅ Seeding operations complete!");
    } catch (error) {
      console.error("❌ Seeder failed:", error);
    } finally {
      await this.prisma.$disconnect();
    }
  }

  private extractMessageBlocks(html: string): { text: string; images: string[] }[] {
    const blocks: { text: string; images: string[] }[] = [];
    const messageSegments = html.split(/tgme_widget_message_wrap/); 
    
    for (const segment of messageSegments) {
      // Find all text elements in the block and join them
      const textSegments = [...segment.matchAll(/<div class="[^"]*text[^"]*"[^>]*>([\s\S]*?)<\/div>/gi)];
      if (textSegments.length === 0) continue;

      const rawText = textSegments.map(match => match[1])
        .join("\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .trim();

      if (rawText.length < 20) continue;

      const imageMatches = [...segment.matchAll(/background-image:url\('([^']+)'\)/g)];
      const images = imageMatches.map(m => m[1]);
      
      blocks.push({ 
        text: rawText, 
        images
      });
    }
    return blocks.slice(-6); 
  }

  private async askAI(text: string, images: string[], availableMenuItems: {id: string, name: string}[]): Promise<AIServiceResponse> {
    const prompt = `
      Extract structured food data from this Telegram post. 
      Use these hints for Ethiopian restaurant posts:
      - Restaurant name is usually after 📍 (Example: 📍 Queen Burger)
      - Neighborhood or location is after 📌 (Example: 📌 Bole)
      - Map link is after 🧭 or it's a maps.app.goo.gl link.
      - Meals are listed with prices ending in 'ETB' (Example: 🍔 Classic Burger - 500 ETB)

      Rules:
      1. hasValidData is true only if you find a restaurant name and at least one meal WITH a price.
      2. neighborhood: Extract just the area name (e.g., "Mekanisa", "Bole").
      3. description: Brief description or features.
      
      AVAILABLE IMAGES:
      ${images.length > 0 ? images.map((img, i) => `[Image ${i}]: ${img}`).join('\n') : "No images available"}
      * For each meal, try to guess which image matches it (if multiple exist). Put the EXACT URL string in \`imageUrl\`. If there is only one image, use it for all meals. If unsure, return null.

      AVAILABLE GLOBAL MENU ITEMS (FOREIGN KEYS):
      ${JSON.stringify(availableMenuItems)}
      * You MUST select the most appropriate ID from the list above for each meal's "menuItemId".
      * DO NOT invent IDs. You must pick the closest conceptual match from the list.
      
      POST TEXT:
      ${text}
      
      Return JSON only strictly matching this schema:
      { "hasValidData": boolean, "restaurant": { "name": string, "location": string, "neighborhood": string, "mapLink": string }, "meals": [{ "name": string, "price": number, "description": string, "spicyLevel": number, "imageUrl": string | null, "menuItemId": string }] }
    `;

    const models = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-flash-latest", "gemini-pro-latest"];
    let lastError: any = null;

    for (const modelName of models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.apiKey}`;
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        const result = await response.json();
        
        if (result.error) {
           const errorMsg = (result.error.message || "").toLowerCase();
           const errorCode = result.error.code || 0;
           lastError = result.error;
           
           if (errorCode === 429 || errorMsg.includes("quota")) {
               console.warn(`⚠️ Quota hit for ${modelName}. Switching to next model...`);
               continue;
           } else if (errorCode === 404 || errorMsg.includes("not found")) {
               console.warn(`⚠️ Model ${modelName} not found or unsupported. Skipping...`);
               continue;
           }
           
           console.error("API returned unexpected error:", JSON.stringify(result, null, 2));
           return { hasValidData: false, restaurant: null, meals: [] };
        }

        if (!result.candidates || result.candidates.length === 0) {
          console.error("API returned strange empty result:", JSON.stringify(result, null, 2));
          return { hasValidData: false, restaurant: null, meals: [] };
        }

        let textRes = result.candidates[0].content.parts[0].text;
        
        // Safety: Strip markdown JSON blocks if AI included them
        textRes = textRes.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(textRes);
      } catch (e) {
        lastError = e;
        console.warn(`⚠️ Fetch Error with ${modelName}:`, e);
      }
    }

    console.error("❌ All AI models failed! Last error:", lastError);
    return { hasValidData: false, restaurant: null, meals: [] };
  }
}

new FoodismServiceSeeder().run();
