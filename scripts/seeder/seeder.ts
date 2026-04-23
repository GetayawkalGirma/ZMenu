import prisma from "../../lib/prisma";
import "dotenv/config";
import fs from "fs";
import { FoodCategoryType, DietaryCategory, PortionSize } from "@prisma/client";
import { fileService } from "../../services/file/file.service";
import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions";
import input from "input";
import path from "path";

// Configuration
const TARGET_CHANNEL = process.argv[2] || process.env.TARGET_CHANNEL || "shegergebeta";
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

// Helper functions for Telegram media
function isVideoDocument(doc?: Api.TypeDocument | null): boolean {
  if (!doc || !(doc instanceof Api.Document)) return false;
  if (doc.mimeType?.startsWith("video/")) return true;
  return (doc.attributes || []).some(
    (attr) => attr instanceof Api.DocumentAttributeVideo
  );
}

function isImageDocument(doc?: Api.TypeDocument | null): boolean {
  if (!doc || !(doc instanceof Api.Document)) return false;
  if (isVideoDocument(doc)) return false;
  return !!doc.mimeType && doc.mimeType.startsWith("image/");
}

function isPhotoMessage(msg: Api.Message): boolean {
  if (!msg.media) return false;
  if (msg.media instanceof Api.MessageMediaPhoto) return !!msg.media.photo;
  if (msg.media instanceof Api.MessageMediaDocument) return isImageDocument(msg.media.document);
  return false;
}

function isVideoMessage(msg: Api.Message): boolean {
  if (!msg.media) return false;
  if (msg.media instanceof Api.MessageMediaDocument) return isVideoDocument(msg.media.document);
  return false;
}

/** Pick the best pre-generated thumbnail from a video document. */
function getBestVideoThumb(doc: Api.Document): Api.TypePhotoSize | null {
  const thumbs = doc.thumbs;
  if (!thumbs || thumbs.length === 0) return null;
  // Prefer a real PhotoSize (has dimensions) over stripped/cached variants
  return (
    (thumbs.find((t) => t instanceof Api.PhotoSize) as Api.PhotoSize | undefined) ??
    (thumbs.find((t) => t instanceof Api.PhotoCachedSize) as Api.PhotoCachedSize | undefined) ??
    thumbs[thumbs.length - 1]
  );
}

function detectUploadMeta(msg: Api.Message): { filename: string; mimeType: string } {
  if (msg.media instanceof Api.MessageMediaPhoto) {
    return { filename: `tg_${msg.id}.jpg`, mimeType: "image/jpeg" };
  }
  if (msg.media instanceof Api.MessageMediaDocument && msg.media.document instanceof Api.Document) {
    const mimeType = msg.media.document.mimeType || "application/octet-stream";
    let ext = ".bin";
    if (mimeType === "image/jpeg") ext = ".jpg";
    else if (mimeType === "image/png") ext = ".png";
    else if (mimeType === "image/webp") ext = ".webp";
    return { filename: `tg_${msg.id}${ext}`, mimeType };
  }
  return { filename: `tg_${msg.id}.bin`, mimeType: "application/octet-stream" };
}

class FoodismServiceSeeder {
  private prisma = prisma;
  private apiKeys: string[];
  private apiId: number;
  private apiHash: string;
  private sessionString: string;
  private client: TelegramClient | null = null;

  constructor() {
    const key1 = getEnvValue("GOOGLE_API_KEY");
    const key2 = getEnvValue("GOOGLE_API_KEY_2");
    this.apiKeys = [key1, key2].filter(Boolean);
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

  private async redownloadMessageMedia(
    client: TelegramClient,
    channel: string,
    msg: Api.Message
  ): Promise<Buffer | null> {
    try {
      const buf = await client.downloadMedia(msg.media!, {});
      return Buffer.isBuffer(buf) ? buf : null;
    } catch (e: any) {
      const message = String(e?.message || e);
      if (message.includes("FILE_REFERENCE_EXPIRED") || message.includes("FILE_REFERENCE_INVALID")) {
        const fresh = await client.getMessages(channel, { ids: [msg.id] });
        const freshMsg = Array.isArray(fresh) ? fresh[0] : fresh;
        if (freshMsg?.media) {
          const buf = await client.downloadMedia(freshMsg.media, {});
          return Buffer.isBuffer(buf) ? buf : null;
        }
      }
      throw e;
    }
  }

  /**
   * Downloads only the pre-generated thumbnail from a video message.
   * Never downloads the video itself — very fast, just a few KB.
   */
  private async downloadVideoThumbnail(
    client: TelegramClient,
    channel: string,
    msg: Api.Message
  ): Promise<Buffer | null> {
    if (
      !(msg.media instanceof Api.MessageMediaDocument) ||
      !(msg.media.document instanceof Api.Document)
    ) return null;

    const thumb = getBestVideoThumb(msg.media.document);
    if (!thumb) return null;

    try {
      const buf = await client.downloadMedia(msg.media, { thumb });
      return Buffer.isBuffer(buf) ? buf : null;
    } catch (e: any) {
      const message = String(e?.message || e);
      if (message.includes("FILE_REFERENCE_EXPIRED") || message.includes("FILE_REFERENCE_INVALID")) {
        const fresh = await client.getMessages(channel, { ids: [msg.id] });
        const freshMsg = Array.isArray(fresh) ? fresh[0] : fresh;
        if (
          freshMsg?.media instanceof Api.MessageMediaDocument &&
          freshMsg.media.document instanceof Api.Document
        ) {
          const freshThumb = getBestVideoThumb(freshMsg.media.document);
          if (freshThumb) {
            const buf = await client.downloadMedia(freshMsg.media, { thumb: freshThumb });
            return Buffer.isBuffer(buf) ? buf : null;
          }
        }
      }
      console.warn(`Video thumbnail download failed for msg ${msg.id}:`, e);
      return null;
    }
  }

  async run() {
    console.log(`🚀 Starting FORWARD-SYNC Seeder for: @${TARGET_CHANNEL}...`);
    try {
      const client = await this.ensureAuthenticated();
      
      console.log("🔍 Discovering available models...");
      const keyedModels = await this.discoverModelsForAllKeys();
      if (keyedModels.length === 0) throw new Error("No working models found.");

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
          ...standalone.map(m => ({
            id: m.id.toString(),
            trackId: m.id.toString(),
            msgs: [m],
            postedAt: new Date(m.date * 1000),
          })),
          ...Array.from(groups.entries()).map(([gid, msgs]) => ({
            id: gid,
            trackId: Math.max(...msgs.map(m => m.id)).toString(),
            msgs,
            // Use the earliest message in the album as the post timestamp
            postedAt: new Date(Math.min(...msgs.map(m => m.date)) * 1000),
          })),
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
      const aiResults = await this.askAIInBatch(postDataForAI, keyedModels);
      
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

          const allMediaMessages = originalPost.msgs
            .filter((m): m is Api.Message => m instanceof Api.Message)
            .filter((m) => isPhotoMessage(m) || isVideoMessage(m))
            .sort((a, b) => a.id - b.id);

          const downloaded: { id: string, url: string, mimeType: string, filename: string }[] = [];
          for (const mediaMsg of allMediaMessages) {
            try {
              let buffer: Buffer | null = null;
              let meta: { filename: string; mimeType: string };

              if (isVideoMessage(mediaMsg)) {
                // Only grab the pre-baked thumbnail — no video download
                buffer = await this.downloadVideoThumbnail(client, TARGET_CHANNEL, mediaMsg);
                meta = { filename: `tg_${mediaMsg.id}_thumb.jpg`, mimeType: "image/jpeg" };
              } else {
                buffer = await this.redownloadMessageMedia(client, TARGET_CHANNEL, mediaMsg);
                meta = detectUploadMeta(mediaMsg);
              }

              if (!buffer || !buffer.length) continue;

              const file = await fileService.uploadFile(buffer, meta.filename, meta.mimeType);
              downloaded.push({ ...file, mimeType: meta.mimeType, filename: meta.filename });
            } catch (e) { console.error(`Media download failed for msg ${mediaMsg.id}:`, e); }
          }

          const postedAt = originalPost.postedAt;

          let restaurant = await this.prisma.restaurant.findFirst({ 
            where: { name: { equals: result.restaurant.name, mode: "insensitive" } } 
          });
          
          const logo = downloaded[0];

          if (!restaurant) {
            restaurant = await this.prisma.restaurant.create({
              data: {
                name: result.restaurant.name,
                location: result.restaurant.location || "Addis Ababa",
                geoLocation: `<iframe src="https://www.google.com/maps?q=${encodeURIComponent(result.restaurant.name)}&output=embed" width="600" height="450" style="border:0;"></iframe>`,
                logoId: logo?.id, 
                logoUrl: logo?.url,
                status: "DRAFT",
                createdAt: postedAt,
              }
            });
            console.log(`🏠 Created Restaurant: ${restaurant.name}`);
          } else if (!restaurant.logoId && logo) {
            restaurant = await this.prisma.restaurant.update({
              where: { id: restaurant.id },
              data: { logoId: logo.id, logoUrl: logo.url }
            });
          }

          // Ingest into RestaurantImageLibrary
          for (const img of downloaded) {
            await this.prisma.restaurantImageLibrary.upsert({
              where: {
                restaurantId_imageId: {
                  restaurantId: restaurant.id,
                  imageId: img.id
                }
              },
              create: {
                restaurantId: restaurant.id,
                imageId: img.id,
              },
              update: {} // Already exists
            });
          }

          for (let i = 0; i < result.meals.length; i++) {
            const meal = result.meals[i];
            const existing = await this.prisma.restaurantMenu.findFirst({ 
              where: { 
                restaurantId: restaurant.id, 
                name: { equals: meal.name, mode: "insensitive" } 
              } 
            });
            if (existing) continue;

            const mealImg = downloaded[i + 1] || downloaded[0];
            const baseData = {
              restaurantId: restaurant.id,
              menuItemId: meal.type === "DRINK" ? OTHER_DRINK_ID : OTHER_FOOD_ID,
              name: meal.name,
              price: typeof meal.price === 'string' ? parseInt(meal.price) : (meal.price || 0),
              description: meal.description || "Scraped item.",
              calories: 400,
              imageId: mealImg?.id, 
              imageUrl: mealImg?.url,
              isAvailable: true,
              createdAt: postedAt,
            };

            try {
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
              try {
                await this.prisma.restaurantMenu.create({ data: baseData });
                console.log(`🍔 Added (fallback): ${meal.name}`);
              } catch (e2: any) { console.error(`❌ Failed ${meal.name}:`, e2.message); }
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

  private async discoverModelsForKey(apiKey: string): Promise<string[]> {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      const resp = await fetch(url);
      const data = await resp.json();
      if (!data.models) return [];
      return data.models
        .filter((m: any) => m.supportedGenerationMethods.includes("generateContent"))
        .map((m: any) => m.name.replace("models/", ""));
    } catch {
      return [];
    }
  }

  private async discoverModelsForAllKeys(): Promise<{ apiKey: string; model: string }[]> {
    const results: { apiKey: string; model: string }[] = [];
    for (let i = 0; i < this.apiKeys.length; i++) {
      const key = this.apiKeys[i];
      const models = await this.discoverModelsForKey(key);
      const candidates = models.filter(m => m.includes("flash") || m.includes("pro"));
      console.log(`   🔑 Key ${i + 1}: ${candidates.length} candidate model(s)`);
      for (const m of candidates) results.push({ apiKey: key, model: m });
    }
    return results;
  }

  private async askAIInBatch(
    posts: { postId: string; text: string }[],
    keyedModels: { apiKey: string; model: string }[]
  ): Promise<ExtractionResult[]> {
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

    // Group by key so we log which key we're switching to
    let currentKeyIndex = -1;

    for (const { apiKey, model } of keyedModels) {
      const keyIndex = this.apiKeys.indexOf(apiKey) + 1;
      if (keyIndex !== currentKeyIndex) {
        currentKeyIndex = keyIndex;
        console.log(`   🔑 Switching to API key ${keyIndex}...`);
      }

      const config = model.includes("2.0") || model.includes("2.5")
        ? { version: "v1beta", supportJsonMode: true }
        : { version: "v1", supportJsonMode: false };
      const url = `https://generativelanguage.googleapis.com/${config.version}/models/${model}:generateContent?key=${apiKey}`;
      console.log(`   🤖 Trying model: ${model}...`);

      try {
        const body: any = { contents: [{ parts: [{ text: prompt }] }] };
        if (config.supportJsonMode) body.generationConfig = { responseMimeType: "application/json" };
        const resp = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await resp.json();
        if (data.error) {
          const reason = data.error?.message?.split("\n")[0] || data.error?.status || "unknown error";
          console.warn(`   ⚠️  ${model} (key ${keyIndex}) failed: ${reason} → trying next...`);
          continue;
        }
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          console.warn(`   ⚠️  ${model} returned no text → trying next...`);
          continue;
        }
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        try {
          const result = JSON.parse(text);
          console.log(`   ✅ ${model} (key ${keyIndex}) succeeded.`);
          return result;
        } catch {
          console.warn(`   ⚠️  ${model} returned unparseable JSON → trying next...`);
          continue;
        }
      } catch (e: any) {
        console.warn(`   ⚠️  ${model} threw: ${e?.message || e} → trying next...`);
      }
    }
    throw new Error("All AI models and API keys exhausted.");
  }
}

new FoodismServiceSeeder().run();
