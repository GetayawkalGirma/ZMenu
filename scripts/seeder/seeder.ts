import prisma from "../../lib/prisma";
import "dotenv/config";
import fs from "fs";
import { FoodCategoryType, DietaryCategory, PortionSize } from "@prisma/client";
import { fileService } from "../../services/file/file.service";
import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions";
import input from "input";

// Configuration
const TARGET_CHANNEL = "Foodism11"; 
const OTHER_FOOD_ID = "cmo5f21hk00046pr98jxr6qgc";
const OTHER_DRINK_ID = "cmo5ezp5z00026pr9cnxjxogp";

function getEnvValue(key: string): string {
  if (process.env[key]) return process.env[key]!;
  const externalEnvPath = "/Users/yawkal/Documents/imposter folder/word seeder/.env";
  try {
    const content = fs.readFileSync(externalEnvPath, "utf-8");
    const match = content.match(new RegExp(`${key}=([^\\s]+)`));
    return match ? match[1] : "";
  } catch (e) { return ""; }
}

interface ExtractionResult {
  postId: number;
  restaurant: { name: string; location: string } | null;
  meals: Array<{ name: string; price: number; description: string; type: FoodCategoryType; dietaryCategory: DietaryCategory }>;
}

class FoodismServiceSeeder {
  private prisma = prisma;
  private apiKey: string;
  private apiId: number;
  private apiHash: string;
  private sessionString: string;
  private client: TelegramClient | null = null;

  constructor() {
    this.apiKey = getEnvValue("GOOGLE_API_KEY");
    this.apiId = parseInt(getEnvValue("TELEGRAM_API_ID") || "0");
    this.apiHash = getEnvValue("TELEGRAM_API_HASH");
    this.sessionString = getEnvValue("TELEGRAM_SESSION") || "";
  }

  private async ensureAuthenticated() {
    if (this.client) return this.client;
    const session = new StringSession(this.sessionString);
    this.client = new TelegramClient(session, this.apiId, this.apiHash, { connectionRetries: 5 });
    await this.client.start({
      phoneNumber: async () => await input.text("Phone (+...): "),
      password: async () => await input.text("Password: "),
      phoneCode: async () => await input.text("Code: "),
      onError: (err) => console.log("Auth Error:", err),
    });
    return this.client;
  }

  async run() {
    console.log(`🚀 Starting FORWARD-SYNC Seeder for: @${TARGET_CHANNEL}...`);
    try {
      const client = await this.ensureAuthenticated();
      
      console.log("🔍 Discovering available models...");
      const workingModels = await this.discoverModels();
      if (workingModels.length === 0) throw new Error("No working models found.");

      // 1. Find the highest ID we've processed (our Bookmark)
      const allSeeded = await this.prisma.seededPost.findMany({
          where: { channel: TARGET_CHANNEL },
          select: { telegramId: true }
      });
      
      const minId = allSeeded.length > 0 
        ? Math.max(...allSeeded.map(s => parseInt(s.telegramId)).filter(id => id < 1000000000)) // Filter out old groupedIds
        : 0;
        
      console.log(`📍 Resuming from Message ID: ${minId || 'Beginning of Channel'}`);

      // 2. Fetch messages AFTER our bookmark (moving forward)
      const messages = await client.getMessages(TARGET_CHANNEL, { 
          limit: 100, 
          minId: minId,
          reverse: true // This is the key: fetch oldest to newest
      });

      if (messages.length === 0) {
          console.log("✨ Channel is fully synced! No new posts.");
          return;
      }

      // Grouping
      const groups = new Map<string, Api.Message[]>();
      const standalone: Api.Message[] = [];
      for (const msg of messages) {
          const gid = msg.groupedId ? msg.groupedId.toString() : null;
          if (gid) {
              const g = groups.get(gid) || []; g.push(msg); groups.set(gid, g);
          } else { standalone.push(msg); }
      }
      
      const postsToProcess = [
          ...standalone.map(m => ({ id: m.id.toString(), trackId: m.id.toString(), msgs: [m] })), 
          ...Array.from(groups.entries()).map(([gid, msgs]) => ({ 
              id: gid, 
              trackId: Math.max(...msgs.map(m => m.id)).toString(), 
              msgs 
          }))
      ];

      console.log(`📊 Found ${postsToProcess.length} new post groups to analyze.`);

      // Prepare data
      // Prepare data using real IDs for robustness
      const postDataForAI = postsToProcess.map((p) => ({
          postId: p.id,
          text: p.msgs.map(m => m.message || "").filter(t => t.length > 0).join("\n").trim()
      })).filter(p => p.text.length > 5);

      if (postDataForAI.length === 0) {
          console.log("⏭️ No valid text content in these messages. Marking them as seen.");
          for (const post of postsToProcess) {
              await this.prisma.seededPost.upsert({
                  where: { telegramId: post.trackId },
                  create: { telegramId: post.trackId, channel: TARGET_CHANNEL },
                  update: {}
              });
          }
          return;
      }

      console.log(`🤖 Analyzing ${postDataForAI.length} post groups...`);
      const aiResults = await this.askAIInBatch(postDataForAI, workingModels);
      
      const postsMap = new Map(postsToProcess.map(p => [p.id, p]));

      for (const result of aiResults) {
          const originalPost = postsMap.get(result.postId?.toString());
          if (!originalPost) {
              console.warn(`⚠️ AI returned an unknown postId: ${result.postId}`);
              continue;
          }

          if (!result.restaurant?.name || result.meals.length === 0) {
              await this.prisma.seededPost.upsert({
                  where: { telegramId: originalPost.trackId },
                  create: { telegramId: originalPost.trackId, channel: TARGET_CHANNEL },
                  update: {}
              });
              continue;
          }

          console.log(`✅ SUCCESS: Processing "${result.restaurant.name}"...`);

          const mediaMessages = originalPost.msgs.filter(m => m.media);
          const downloaded: { id: string, url: string }[] = [];
          for (let i = 0; i < Math.min(mediaMessages.length, 3); i++) {
              try {
                  const buffer = await client.downloadMedia(mediaMessages[i].media!, {}) as Buffer;
                  if (buffer) {
                      const file = await fileService.uploadFile(buffer, `tg_${Date.now()}_${i}.jpg`, "image/jpeg");
                      downloaded.push(file);
                  }
              } catch (e) { console.error("Media fail:", e); }
          }

          let restaurant = await this.prisma.restaurant.findFirst({ where: { name: { equals: result.restaurant.name } } });
          const logo = downloaded[0];

          if (!restaurant) {
              restaurant = await this.prisma.restaurant.create({
                  data: {
                      name: result.restaurant.name,
                      location: result.restaurant.location || "Addis Ababa",
                      geoLocation: `<iframe src="https://www.google.com/maps?q=${encodeURIComponent(result.restaurant.name)}&output=embed" width="600" height="450" style="border:0;"></iframe>`,
                      logoId: logo?.id, logoUrl: logo?.url,
                      status: "DRAFT"
                  }
              });
              console.log(`🏠 Created Restaurant: ${restaurant.name}`);
          }

          for (let i = 0; i < result.meals.length; i++) {
              const meal = result.meals[i];
              const existing = await this.prisma.restaurantMenu.findFirst({ where: { restaurantId: restaurant.id, name: { equals: meal.name } } });
              if (existing) continue;

              const mealImg = downloaded[i + 1] || downloaded[0];
              const baseData = {
                  restaurantId: restaurant.id,
                  menuItemId: meal.type === "DRINK" ? OTHER_DRINK_ID : OTHER_FOOD_ID,
                  name: meal.name,
                  price: typeof meal.price === 'string' ? parseInt(meal.price) : (meal.price || 0),
                  description: meal.description || "Scraped item.",
                  calories: 400,
                  imageId: mealImg?.id, imageUrl: mealImg?.url,
                  isAvailable: true
              };

              try {
                  // Try with ALL enums first
                  await this.prisma.restaurantMenu.create({
                      data: { 
                          ...baseData, 
                          foodCategoryType: meal.type, 
                          dietaryCategory: meal.dietaryCategory,
                          portionSize: "ONE_PERSON" as PortionSize 
                      }
                  });
                  console.log(`🍔 Added: ${meal.name}`);
              } catch (e: any) {
                  if (e.message.includes("type") || e.message.includes("does not exist")) {
                      // Fallback: Try without ANY enums
                      try {
                          await this.prisma.restaurantMenu.create({ data: baseData });
                          console.log(`🍔 Added (no category/portion): ${meal.name}`);
                      } catch (e2: any) { console.error(`❌ Failed ${meal.name}:`, e2.message); }
                  } else {
                      console.error(`❌ Failed ${meal.name}:`, e.message);
                  }
              }
          }

          // Mark as seeded
          await this.prisma.seededPost.upsert({
              where: { telegramId: originalPost.trackId },
              create: { telegramId: originalPost.trackId, channel: TARGET_CHANNEL },
              update: {}
          });
      }
      
      console.log("\n✅ Sync complete!");
    } catch (error) {
      console.error("❌ Seeder failed:", error);
    } finally {
      if (this.client) try { await this.client.destroy(); } catch(e) {}
      await this.prisma.$disconnect();
    }
  }

  private async discoverModels(): Promise<string[]> {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`;
      const resp = await fetch(url);
      const data = await resp.json();
      if (!data.models) return [];
      return data.models
          .filter((m: any) => m.supportedGenerationMethods.includes("generateContent"))
          .map((m: any) => m.name.replace("models/", ""));
  }

  private async askAIInBatch(posts: { postId: string, text: string }[], workingModels: string[]): Promise<ExtractionResult[]> {
    const prompt = `
      Extract restaurant and menu data from these ${posts.length} Telegram posts.
      
      CRITICAL: You MUST return the "postId" exactly as provided in the input for each restaurant.
      
      Return ONLY a JSON array of objects.
      OUTPUT FORMAT:
      [{ 
        "postId": "string", 
        "restaurant": { "name": "string", "location": "string" }, 
        "meals": [{ "name": "string", "price": number, "type": "FOOD" | "DRINK", "dietaryCategory": "YETSOM" | "YEFITSIK" }] 
      }]

      POSTS:
      ${JSON.stringify(posts, null, 2)}
    `;
    for (const model of workingModels) {
        if (!model.includes("flash") && !model.includes("pro")) continue;
        const config = model.includes("2.0") || model.includes("2.5") ? { version: "v1beta", supportJsonMode: true } : { version: "v1", supportJsonMode: false };
        const url = `https://generativelanguage.googleapis.com/${config.version}/models/${model}:generateContent?key=${this.apiKey}`;
        try {
            const body: any = { contents: [{ parts: [{ text: prompt }] }] };
            if (config.supportJsonMode) body.generationConfig = { responseMimeType: "application/json" };
            const resp = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            const data = await resp.json();
            if (data.error) continue;
            let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) continue;
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(text);
        } catch (e) {}
    }
    throw new Error("AI extraction failed.");
  }
}

new FoodismServiceSeeder().run();
