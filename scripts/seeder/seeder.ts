import prisma from "../../lib/prisma";
import "dotenv/config";
import fs from "fs";
import {
  FoodCategoryType,
  DietaryCategory,
  PortionSize,
} from "@prisma/client";
import { fileService } from "../../services/file/file.service";
import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions";
import input from "input";

// =========================
// Configuration
// =========================

const TARGET_CHANNEL =
  process.argv[2] || process.env.TARGET_CHANNEL || "shegergebeta";

const OTHER_FOOD_ID = "cmo5f21hk00046pr98jxr6qgc";
const OTHER_DRINK_ID = "cmo5ezp5z00026pr9cnxjxogp";

/**
 * Number of logical posts to collect per run.
 * One logical post = one standalone Telegram message OR one grouped album.
 */
const TARGET_POST_COUNT = Math.max(
  1,
  parseInt(process.env.SEEDER_TARGET_POSTS || "6", 10)
);

/**
 * Raw Telegram rows per fetch request.
 * This is NOT post count.
 */
const TELEGRAM_FETCH_CHUNK = Math.min(
  100,
  Math.max(5, parseInt(process.env.SEEDER_TELEGRAM_FETCH_CHUNK || "20", 10))
);

/**
 * Max number of logical posts sent to Gemini in one batch request.
 */
const AI_POST_BATCH_SIZE = Math.min(
  20,
  Math.max(1, parseInt(process.env.SEEDER_AI_POST_BATCH || "6", 10))
);

// =========================
// Types
// =========================

interface ExtractionResult {
  postId: string;
  restaurant: { name: string; location: string } | null;
  meals: Array<{
    name: string;
    price: number;
    description?: string;
    type: FoodCategoryType;
    dietaryCategory: DietaryCategory;
  }>;
}

interface LogicalPost {
  id: string; // group:<groupedId> OR msg:<messageId>
  sourceType: "group" | "standalone";
  groupedId: string | null;
  trackId: string; // highest raw message id inside this logical post
  msgs: Api.Message[];
  postedAt: Date;
}

// =========================
// Env helper
// =========================

function getEnvValue(key: string): string {
  if (process.env[key]) return process.env[key]!;

  const externalEnvPath =
    "/Users/yawkal/Documents/imposter folder/word seeder/.env";

  try {
    const content = fs.readFileSync(externalEnvPath, "utf-8");
    const match = content.match(new RegExp(`${key}=([^\\s]+)`));
    return match ? match[1] : "";
  } catch {
    return "";
  }
}

// =========================
// Logging helpers
// =========================

function shortText(text: string, max = 80): string {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max) + "...";
}

function logDivider(title?: string) {
  const line = "=".repeat(78);
  console.log(`\n${line}`);
  if (title) {
    console.log(`📍 ${title}`);
    console.log(line);
  }
}

function countMediaKinds(msgs: Api.Message[]) {
  let photos = 0;
  let videos = 0;
  let other = 0;

  for (const msg of msgs) {
    if (isPhotoMessage(msg)) photos++;
    else if (isVideoMessage(msg)) videos++;
    else other++;
  }

  return { photos, videos, other };
}

// =========================
// Telegram media helpers
// =========================

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
  if (msg.media instanceof Api.MessageMediaDocument) {
    return isImageDocument(msg.media.document);
  }
  return false;
}

function isVideoMessage(msg: Api.Message): boolean {
  if (!msg.media) return false;
  if (msg.media instanceof Api.MessageMediaDocument) {
    return isVideoDocument(msg.media.document);
  }
  return false;
}

function getBestVideoThumb(doc: Api.Document): Api.TypePhotoSize | null {
  const thumbs = doc.thumbs;
  if (!thumbs || thumbs.length === 0) return null;

  return (
    (thumbs.find((t) => t instanceof Api.PhotoSize) as
      | Api.PhotoSize
      | undefined) ??
    (thumbs.find((t) => t instanceof Api.PhotoCachedSize) as
      | Api.PhotoCachedSize
      | undefined) ??
    thumbs[thumbs.length - 1]
  );
}

function detectUploadMeta(msg: Api.Message): {
  filename: string;
  mimeType: string;
} {
  if (msg.media instanceof Api.MessageMediaPhoto) {
    return {
      filename: `tg_${msg.id}.jpg`,
      mimeType: "image/jpeg",
    };
  }

  if (
    msg.media instanceof Api.MessageMediaDocument &&
    msg.media.document instanceof Api.Document
  ) {
    const mimeType = msg.media.document.mimeType || "application/octet-stream";
    let ext = ".bin";

    if (mimeType === "image/jpeg") ext = ".jpg";
    else if (mimeType === "image/png") ext = ".png";
    else if (mimeType === "image/webp") ext = ".webp";

    return {
      filename: `tg_${msg.id}${ext}`,
      mimeType,
    };
  }

  return {
    filename: `tg_${msg.id}.bin`,
    mimeType: "application/octet-stream",
  };
}

// =========================
// Logical post helpers
// =========================

function getLogicalPostKey(msg: Api.Message): string {
  return msg.groupedId
    ? `group:${msg.groupedId.toString()}`
    : `msg:${msg.id.toString()}`;
}

function getLogicalPostSourceType(msg: Api.Message): "group" | "standalone" {
  return msg.groupedId ? "group" : "standalone";
}

function normalizeLogicalPost(msgs: Api.Message[]): LogicalPost {
  const sorted = [...msgs].sort((a, b) => a.id - b.id);
  const first = sorted[0];
  const groupedId = first.groupedId ? first.groupedId.toString() : null;

  return {
    id: getLogicalPostKey(first),
    sourceType: getLogicalPostSourceType(first),
    groupedId,
    trackId: String(Math.max(...sorted.map((m) => m.id))),
    msgs: sorted,
    postedAt: new Date(Math.min(...sorted.map((m) => m.date)) * 1000),
  };
}

function getBestPostText(post: LogicalPost): string {
  return (
    post.msgs
      .map((m) => (m.message || "").trim())
      .find((t) => t.length > 0) || ""
  );
}

// =========================
// Seeder class
// =========================

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

    this.apiId = parseInt(getEnvValue("TELEGRAM_API_ID") || "0", 10);
    this.apiHash = getEnvValue("TELEGRAM_API_HASH");
    this.sessionString = getEnvValue("TELEGRAM_SESSION") || "";
  }

  private async ensureAuthenticated() {
    if (this.client) return this.client;

    const session = new StringSession(this.sessionString);
    this.client = new TelegramClient(session, this.apiId, this.apiHash, {
      connectionRetries: 5,
    });

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

      if (
        message.includes("FILE_REFERENCE_EXPIRED") ||
        message.includes("FILE_REFERENCE_INVALID")
      ) {
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

  private async downloadVideoThumbnail(
    client: TelegramClient,
    channel: string,
    msg: Api.Message
  ): Promise<Buffer | null> {
    if (
      !(msg.media instanceof Api.MessageMediaDocument) ||
      !(msg.media.document instanceof Api.Document)
    ) {
      return null;
    }

    const thumb = getBestVideoThumb(msg.media.document);
    if (!thumb) return null;

    try {
      const buf = await client.downloadMedia(msg.media, { thumb });
      return Buffer.isBuffer(buf) ? buf : null;
    } catch (e: any) {
      const message = String(e?.message || e);

      if (
        message.includes("FILE_REFERENCE_EXPIRED") ||
        message.includes("FILE_REFERENCE_INVALID")
      ) {
        const fresh = await client.getMessages(channel, { ids: [msg.id] });
        const freshMsg = Array.isArray(fresh) ? fresh[0] : fresh;

        if (
          freshMsg?.media instanceof Api.MessageMediaDocument &&
          freshMsg.media.document instanceof Api.Document
        ) {
          const freshThumb = getBestVideoThumb(freshMsg.media.document);
          if (freshThumb) {
            const buf = await client.downloadMedia(freshMsg.media, {
              thumb: freshThumb,
            });
            return Buffer.isBuffer(buf) ? buf : null;
          }
        }
      }

      console.warn(`Video thumbnail download failed for msg ${msg.id}:`, e);
      return null;
    }
  }

  /**
   * Collect exactly N logical posts after a given raw message id.
   * One logical post = one standalone message OR one grouped album.
   *
   * This prevents:
   * - fetching only raw rows instead of real posts
   * - cutting the last album at the boundary
   */
  private async collectNextLogicalPosts(
    client: TelegramClient,
    channel: string,
    afterMessageId: number,
    targetPostCount: number,
    chunkSize: number
  ): Promise<LogicalPost[]> {
    const postsMap = new Map<string, Api.Message[]>();
    const postOrder: string[] = [];

    let currentMinId = afterMessageId;
    let reachedTarget = false;
    let boundaryKey: string | null = null;
    let boundaryStablePasses = 0;
    let safetyLoops = 0;
    let totalRawMessagesFetched = 0;

    logDivider(`COLLECTING ${targetPostCount} LOGICAL POSTS`);
    console.log(`📡 Channel: @${channel}`);
    console.log(`🧭 Starting after raw message ID: ${afterMessageId || 0}`);
    console.log(`📦 Raw fetch chunk size: ${chunkSize}`);

    while (safetyLoops < 100) {
      safetyLoops++;

      console.log(`\n🔄 Fetch pass ${safetyLoops}`);
      console.log(`   Asking Telegram for raw messages after ID ${currentMinId}...`);

      const batch = await client.getMessages(channel, {
        limit: chunkSize,
        minId: currentMinId,
        reverse: true,
      });

      const typedBatch = batch.filter(
        (m): m is Api.Message => m instanceof Api.Message
      );

      if (typedBatch.length === 0) {
        console.log(`   📭 Telegram returned no more messages.`);
        break;
      }

      totalRawMessagesFetched += typedBatch.length;
      console.log(`   📨 Fetched ${typedBatch.length} raw message row(s).`);
      console.log(`   📊 Total raw rows fetched so far: ${totalRawMessagesFetched}`);

      let maxSeenId = currentMinId;
      let newPostsThisPass = 0;

      for (const msg of typedBatch) {
        const key = getLogicalPostKey(msg);

        if (!postsMap.has(key)) {
          postsMap.set(key, []);
          postOrder.push(key);
          newPostsThisPass++;

          const label = msg.groupedId
            ? `album ${msg.groupedId.toString()}`
            : `standalone msg ${msg.id}`;

          console.log(
            `   🆕 New logical post found: ${key} (${label}) | total=${postOrder.length}/${targetPostCount}`
          );
        }

        postsMap.get(key)!.push(msg);

        if (msg.id > maxSeenId) {
          maxSeenId = msg.id;
        }
      }

      console.log(`   ➕ New logical posts this pass: ${newPostsThisPass}`);
      currentMinId = maxSeenId;

      if (!reachedTarget && postOrder.length >= targetPostCount) {
        reachedTarget = true;
        boundaryKey = postOrder[targetPostCount - 1];
        boundaryStablePasses = 0;

        console.log(`\n🎯 Target reached: ${targetPostCount} logical posts found.`);
        console.log(`   🔍 Boundary post to verify completeness: ${boundaryKey}`);
        console.log(`   👀 Doing look-ahead so the last post is not cut.`);
      }

      if (reachedTarget && boundaryKey) {
        const beforeSize = postsMap.get(boundaryKey)?.length || 0;

        const lookAhead = await client.getMessages(channel, {
          limit: chunkSize,
          minId: currentMinId,
          reverse: true,
        });

        const typedLookAhead = lookAhead.filter(
          (m): m is Api.Message => m instanceof Api.Message
        );

        if (typedLookAhead.length === 0) {
          console.log(`   ✅ Look-ahead returned nothing. Boundary post is complete.`);
          break;
        }

        console.log(`   🔭 Look-ahead fetched ${typedLookAhead.length} more raw row(s).`);

        let lookAheadMaxSeenId = currentMinId;
        let boundaryGrew = false;

        for (const msg of typedLookAhead) {
          const key = getLogicalPostKey(msg);

          if (!postsMap.has(key)) {
            postsMap.set(key, []);
            postOrder.push(key);
          }

          const existing = postsMap.get(key)!;
          const alreadyHasMsg = existing.some((m) => m.id === msg.id);

          if (!alreadyHasMsg) {
            existing.push(msg);

            if (key === boundaryKey) {
              boundaryGrew = true;
              console.log(
                `   ➕ Boundary post ${boundaryKey} got another message: msg ${msg.id}`
              );
            }
          }

          if (msg.id > lookAheadMaxSeenId) {
            lookAheadMaxSeenId = msg.id;
          }
        }

        currentMinId = lookAheadMaxSeenId;

        const afterSize = postsMap.get(boundaryKey)?.length || 0;

        if (!boundaryGrew && afterSize === beforeSize) {
          boundaryStablePasses++;
          console.log(
            `   ✅ Boundary post stayed stable (${afterSize} raw rows). Safe to stop.`
          );
        } else {
          boundaryStablePasses = 0;
          console.log(
            `   🔁 Boundary post grew from ${beforeSize} to ${afterSize} raw rows. Continuing...`
          );
        }

        if (boundaryStablePasses >= 1) {
          break;
        }
      }
    }

    const normalized = postOrder
      .map((key) => postsMap.get(key)!)
      .filter((msgs) => msgs && msgs.length > 0)
      .map((msgs) => normalizeLogicalPost(msgs))
      .sort((a, b) => a.postedAt.getTime() - b.postedAt.getTime());

    const finalPosts = normalized.slice(0, targetPostCount);

    logDivider("COLLECTION SUMMARY");
    console.log(`✅ Final logical posts collected: ${finalPosts.length}/${targetPostCount}`);
    console.log(`📨 Total raw Telegram rows consumed: ${totalRawMessagesFetched}`);

    finalPosts.forEach((post, index) => {
      const media = countMediaKinds(post.msgs);
      const text = getBestPostText(post);

      console.log(
        `   ${index + 1}. ${post.id} | type=${post.sourceType} | msgRows=${post.msgs.length} | photos=${media.photos} | videos=${media.videos} | text="${shortText(
          text,
          90
        )}"`
      );
    });

    return finalPosts;
  }

  private async discoverModelsForKey(apiKey: string): Promise<string[]> {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      const resp = await fetch(url);
      const data = await resp.json();

      if (!data.models) return [];

      return data.models
        .filter((m: any) =>
          m.supportedGenerationMethods.includes("generateContent")
        )
        .map((m: any) => m.name.replace("models/", ""));
    } catch {
      return [];
    }
  }

  private async discoverModelsForAllKeys(): Promise<
    { apiKey: string; model: string }[]
  > {
    const results: { apiKey: string; model: string }[] = [];

    for (let i = 0; i < this.apiKeys.length; i++) {
      const key = this.apiKeys[i];
      const models = await this.discoverModelsForKey(key);
      const candidates = models.filter(
        (m) => m.includes("flash") || m.includes("pro")
      );

      console.log(`   🔑 Key ${i + 1}: ${candidates.length} candidate model(s)`);

      for (const m of candidates) {
        results.push({ apiKey: key, model: m });
      }
    }

    return results;
  }

  private async askAIInBatch(
    posts: { postId: string; text: string }[],
    keyedModels: { apiKey: string; model: string }[]
  ): Promise<ExtractionResult[]> {
    const prompt = `
Extract restaurant and menu data from these ${posts.length} Telegram posts.

CRITICAL:
- You MUST return the "postId" exactly as provided in the input for each restaurant.
- Ignore posts that do not clearly describe one restaurant with menu items.
- Return ONLY a JSON array.

OUTPUT FORMAT:
[
  {
    "postId": "string",
    "restaurant": { "name": "string", "location": "string" },
    "meals": [
      {
        "name": "string",
        "price": number,
        "description": "string",
        "type": "FOOD" | "DRINK",
        "dietaryCategory": "YETSOM" | "YEFITSIK"
      }
    ]
  }
]

POSTS:
${JSON.stringify(posts, null, 2)}
`.trim();

    let currentKeyIndex = -1;

    for (const { apiKey, model } of keyedModels) {
      const keyIndex = this.apiKeys.indexOf(apiKey) + 1;

      if (keyIndex !== currentKeyIndex) {
        currentKeyIndex = keyIndex;
        console.log(`   🔑 Switching to API key ${keyIndex}...`);
      }

      const config =
        model.includes("2.0") || model.includes("2.5")
          ? { version: "v1beta", supportJsonMode: true }
          : { version: "v1", supportJsonMode: false };

      const url = `https://generativelanguage.googleapis.com/${config.version}/models/${model}:generateContent?key=${apiKey}`;

      console.log(`   🤖 Trying model: ${model}...`);

      try {
        const body: any = {
          contents: [{ parts: [{ text: prompt }] }],
        };

        if (config.supportJsonMode) {
          body.generationConfig = {
            responseMimeType: "application/json",
          };
        }

        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await resp.json();

        if (data.error) {
          const reason =
            data.error?.message?.split("\n")[0] ||
            data.error?.status ||
            "unknown error";

          console.warn(
            `   ⚠️ ${model} (key ${keyIndex}) failed: ${reason} -> trying next...`
          );
          continue;
        }

        let text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
          console.warn(`   ⚠️ ${model} returned no text -> trying next...`);
          continue;
        }

        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
          const result = JSON.parse(text);
          console.log(`   ✅ ${model} (key ${keyIndex}) succeeded.`);
          return result;
        } catch {
          console.warn(`   ⚠️ ${model} returned unparseable JSON -> trying next...`);
          continue;
        }
      } catch (e: any) {
        console.warn(`   ⚠️ ${model} threw: ${e?.message || e} -> trying next...`);
      }
    }

    throw new Error("All AI models and API keys exhausted.");
  }

  async run() {
    logDivider(`STARTING FORWARD-SYNC SEEDER: @${TARGET_CHANNEL}`);

    try {
      const client = await this.ensureAuthenticated();
      console.log("✅ Telegram authentication ready.");

      console.log("\n🔍 Discovering available Gemini models...");
      const keyedModels = await this.discoverModelsForAllKeys();

      if (keyedModels.length === 0) {
        throw new Error("No working models found.");
      }

      console.log(`✅ Found ${keyedModels.length} usable model/key combination(s).`);

      const allSeeded = await this.prisma.seededPost.findMany({
        where: { channel: TARGET_CHANNEL },
        select: { telegramId: true },
      });

const validTelegramMessageIds = allSeeded
  .map((s) => parseInt(s.telegramId, 10))
  .filter((n) => Number.isFinite(n))
  .filter((n) => n > 0 && n <= 2147483647);

const invalidTelegramIds = allSeeded
  .map((s) => s.telegramId)
  .filter((id) => {
    const n = parseInt(id, 10);
    return !Number.isFinite(n) || n <= 0 || n > 2147483647;
  });

if (invalidTelegramIds.length > 0) {
  console.log(
    `⚠️ Ignoring ${invalidTelegramIds.length} invalid stored telegramId value(s) that are not real raw message IDs.`
  );
  console.log(`   Example invalid value: ${invalidTelegramIds[0]}`);
}

const lastProcessedMessageId =
  validTelegramMessageIds.length > 0
    ? Math.max(...validTelegramMessageIds)
    : 0;

      console.log(`📍 Last processed raw Telegram message ID: ${lastProcessedMessageId || 0}`);
      console.log(`🎯 Target logical posts this run: ${TARGET_POST_COUNT}`);
      console.log(`📦 Raw fetch chunk size: ${TELEGRAM_FETCH_CHUNK}`);

      const postsToProcess = await this.collectNextLogicalPosts(
        client,
        TARGET_CHANNEL,
        lastProcessedMessageId,
        TARGET_POST_COUNT,
        TELEGRAM_FETCH_CHUNK
      );

      if (postsToProcess.length === 0) {
        console.log("\n✨ Channel is fully synced! No new logical posts found.");
        return;
      }

      logDivider("PREPARING POSTS FOR AI");

      const postDataForAI = postsToProcess
        .map((p, index) => {
          const text = getBestPostText(p);
          const media = countMediaKinds(p.msgs);

          console.log(`🧠 Post ${index + 1}/${postsToProcess.length}: ${p.id}`);
          console.log(`   • type: ${p.sourceType}`);
          console.log(`   • raw message rows: ${p.msgs.length}`);
          console.log(`   • photos found: ${media.photos}`);
          console.log(`   • videos found: ${media.videos}`);
          console.log(`   • thumbnails expected from videos: ${media.videos}`);
          console.log(`   • text preview: "${shortText(text, 140)}"`);

          return {
            postId: p.id,
            text,
          };
        })
        .filter((p) => p.text.length > 5);

      if (postDataForAI.length === 0) {
        console.log("\n⏭️ None of the collected posts had enough text. Marking them as seen.");

        for (const post of postsToProcess) {
          await this.prisma.seededPost.upsert({
            where: { telegramId: post.trackId },
            create: { telegramId: post.trackId, channel: TARGET_CHANNEL },
            update: {},
          });

          console.log(`   ✅ Marked seen: ${post.id} (trackId=${post.trackId})`);
        }

        return;
      }

      const aiResults: ExtractionResult[] = [];

      for (let i = 0; i < postDataForAI.length; i += AI_POST_BATCH_SIZE) {
        const chunk = postDataForAI.slice(i, i + AI_POST_BATCH_SIZE);

        console.log(
          `\n🤖 Sending AI batch ${Math.floor(i / AI_POST_BATCH_SIZE) + 1}: posts ${i + 1}-${i + chunk.length} of ${postDataForAI.length}`
        );

        for (const post of chunk) {
          console.log(
            `   📤 Sending post ${post.postId} to AI | text="${shortText(
              post.text,
              100
            )}"`
          );
        }

        const part = await this.askAIInBatch(chunk, keyedModels);

        console.log(`   📥 AI returned ${part.length} structured result(s).`);
        aiResults.push(...part);
      }

      const postsMap = new Map(postsToProcess.map((p) => [p.id, p]));

      for (const result of aiResults) {
        logDivider(`PROCESSING AI RESULT: ${result.postId}`);

        const originalPost = postsMap.get(String(result.postId));

        if (!originalPost) {
          console.warn(`⚠️ AI returned unknown postId: ${result.postId}`);
          continue;
        }

        const originalMedia = countMediaKinds(originalPost.msgs);
        console.log(`📌 Matched logical post: ${originalPost.id}`);
        console.log(`🧾 Raw message rows in post: ${originalPost.msgs.length}`);
        console.log(`🖼️ Photos in post: ${originalMedia.photos}`);
        console.log(`🎥 Videos in post: ${originalMedia.videos}`);
        console.log(`🪟 Expected thumbnails from videos: ${originalMedia.videos}`);

        if (!result.restaurant?.name || result.meals.length === 0) {
          console.log(`⏭️ AI result rejected for seeding`);
          console.log(`   • restaurant name present: ${!!result.restaurant?.name}`);
          console.log(`   • meals found: ${result.meals.length}`);
          console.log(`   • marking post as seen and skipping`);

          await this.prisma.seededPost.upsert({
            where: { telegramId: originalPost.trackId },
            create: {
              telegramId: originalPost.trackId,
              channel: TARGET_CHANNEL,
            },
            update: {},
          });

          continue;
        }

        console.log(`🏪 Restaurant found: ${result.restaurant.name}`);
        console.log(`📍 Location found: ${result.restaurant.location || "(empty)"}`);
        console.log(`🍽️ Meals found by AI: ${result.meals.length}`);

        result.meals.forEach((meal, idx) => {
          console.log(
            `   ${idx + 1}. ${meal.name} | price=${meal.price ?? 0} | type=${meal.type} | dietary=${meal.dietaryCategory}`
          );
        });

        const allMediaMessages = originalPost.msgs
          .filter((m): m is Api.Message => m instanceof Api.Message)
          .filter((m) => isPhotoMessage(m) || isVideoMessage(m))
          .sort((a, b) => a.id - b.id);

        console.log(`\n📥 Download phase starting...`);
        console.log(`   • media messages to inspect: ${allMediaMessages.length}`);

        const downloaded: {
          id: string;
          url: string;
          mimeType: string;
          filename: string;
        }[] = [];

        let downloadedPhotos = 0;
        let downloadedThumbs = 0;
        let failedMedia = 0;

        for (const mediaMsg of allMediaMessages) {
          try {
            let buffer: Buffer | null = null;
            let meta: { filename: string; mimeType: string };

            if (isVideoMessage(mediaMsg)) {
              console.log(
                `   🎥 msg ${mediaMsg.id}: video detected -> downloading thumbnail only`
              );
              buffer = await this.downloadVideoThumbnail(
                client,
                TARGET_CHANNEL,
                mediaMsg
              );
              meta = {
                filename: `tg_${mediaMsg.id}_thumb.jpg`,
                mimeType: "image/jpeg",
              };
            } else {
              console.log(
                `   🖼️ msg ${mediaMsg.id}: photo detected -> downloading image`
              );
              buffer = await this.redownloadMessageMedia(
                client,
                TARGET_CHANNEL,
                mediaMsg
              );
              meta = detectUploadMeta(mediaMsg);
            }

            if (!buffer || !buffer.length) {
              console.warn(`   ⚠️ msg ${mediaMsg.id}: empty buffer, skipping`);
              failedMedia++;
              continue;
            }

            const file = await fileService.uploadFile(
              buffer,
              meta.filename,
              meta.mimeType
            );

            downloaded.push({
              ...file,
              mimeType: meta.mimeType,
              filename: meta.filename,
            });

            if (meta.filename.includes("_thumb")) downloadedThumbs++;
            else downloadedPhotos++;

            console.log(`   ✅ Uploaded ${meta.filename} -> fileId=${file.id}`);
          } catch (e) {
            failedMedia++;
            console.error(`   ❌ Media download/upload failed for msg ${mediaMsg.id}:`, e);
          }
        }

        console.log(`\n📦 Media phase summary`);
        console.log(`   • uploaded photos: ${downloadedPhotos}`);
        console.log(`   • uploaded thumbnails: ${downloadedThumbs}`);
        console.log(`   • total uploaded media: ${downloaded.length}`);
        console.log(`   • failed media items: ${failedMedia}`);

        const postedAt = originalPost.postedAt;

        let restaurant = await this.prisma.restaurant.findFirst({
          where: {
            name: {
              equals: result.restaurant.name,
              mode: "insensitive",
            },
          },
        });

        const logo = downloaded[0];

        if (!restaurant) {
          console.log(`\n🏗️ Restaurant does not exist yet. Creating...`);

          restaurant = await this.prisma.restaurant.create({
            data: {
              name: result.restaurant.name,
              location: result.restaurant.location || "Addis Ababa",
              geoLocation: `<iframe src="https://www.google.com/maps?q=${encodeURIComponent(
                result.restaurant.name
              )}&output=embed" width="600" height="450" style="border:0;"></iframe>`,
              logoId: logo?.id,
              logoUrl: logo?.url,
              status: "DRAFT",
              sourceInfo: {
                source: "TELEGRAM",
                specificSource: TARGET_CHANNEL,
                metadata: {
                  messageId: originalPost.trackId,
                  logicalPostId: originalPost.id,
                  groupedId: originalPost.groupedId,
                  postedAt: postedAt.toISOString(),
                  isScraped: true,
                },
              },
              createdAt: postedAt,
            },
          });

          console.log(`   ✅ Created restaurant: ${restaurant.name} | id=${restaurant.id}`);
        } else {
          console.log(`\n🏪 Restaurant already exists: ${restaurant.name} | id=${restaurant.id}`);

          if (!restaurant.logoId && logo) {
            restaurant = await this.prisma.restaurant.update({
              where: { id: restaurant.id },
              data: { logoId: logo.id, logoUrl: logo.url },
            });
            console.log(`   ✅ Added missing logo to existing restaurant`);
          }
        }

        let linkedLibraryImages = 0;

        for (const img of downloaded) {
          await this.prisma.restaurantImageLibrary.upsert({
            where: {
              restaurantId_imageId: {
                restaurantId: restaurant.id,
                imageId: img.id,
              },
            },
            create: {
              restaurantId: restaurant.id,
              imageId: img.id,
            },
            update: {},
          });

          linkedLibraryImages++;
        }

        console.log(`🖼️ Linked ${linkedLibraryImages} image(s) into restaurant image library.`);

        let createdMeals = 0;
        let skippedExistingMeals = 0;
        let failedMeals = 0;

        for (let i = 0; i < result.meals.length; i++) {
          const meal = result.meals[i];

          console.log(`\n🍽️ Processing meal ${i + 1}/${result.meals.length}: ${meal.name}`);

          const existing = await this.prisma.restaurantMenu.findFirst({
            where: {
              restaurantId: restaurant.id,
              name: { equals: meal.name, mode: "insensitive" },
            },
          });

          if (existing) {
            skippedExistingMeals++;
            console.log(`   ⏭️ Meal already exists. Skipping.`);
            continue;
          }

          const mealImg = downloaded[i + 1] || downloaded[0];

          const baseData = {
            restaurantId: restaurant.id,
            menuItemId:
              meal.type === "DRINK" ? OTHER_DRINK_ID : OTHER_FOOD_ID,
            name: meal.name,
            price:
              typeof meal.price === "string"
                ? parseInt(meal.price as any, 10)
                : meal.price || 0,
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
                portionSize: "ONE_PERSON" as PortionSize,
              },
            });

            createdMeals++;
            console.log(`   ✅ Added meal: ${meal.name}`);
          } catch (e: any) {
            try {
              await this.prisma.restaurantMenu.create({ data: baseData });
              createdMeals++;
              console.log(`   ✅ Added meal with fallback schema: ${meal.name}`);
            } catch (e2: any) {
              failedMeals++;
              console.error(`   ❌ Failed meal ${meal.name}:`, e2.message);
            }
          }
        }

        await this.prisma.seededPost.upsert({
          where: { telegramId: originalPost.trackId },
          create: {
            telegramId: originalPost.trackId,
            channel: TARGET_CHANNEL,
          },
          update: {},
        });

        logDivider(`DONE: ${result.restaurant.name}`);
        console.log(`✅ Restaurant processed successfully`);
        console.log(`🏪 Name: ${result.restaurant.name}`);
        console.log(`📍 Location: ${result.restaurant.location || "(empty)"}`);
        console.log(`🍽️ Total meals from AI: ${result.meals.length}`);
        console.log(`✅ Meals created: ${createdMeals}`);
        console.log(`⏭️ Meals skipped (already existed): ${skippedExistingMeals}`);
        console.log(`❌ Meals failed: ${failedMeals}`);
        console.log(`🖼️ Photos uploaded: ${downloadedPhotos}`);
        console.log(`🎥 Video thumbnails uploaded: ${downloadedThumbs}`);
        console.log(`📦 Total uploaded media: ${downloaded.length}`);
        console.log(`📚 Library images linked: ${linkedLibraryImages}`);
        console.log(`🧷 Seed bookmark saved with trackId: ${originalPost.trackId}`);
      }

      const aiSeenIds = new Set(aiResults.map((r) => String(r.postId)));

      for (const post of postsToProcess) {
        if (!aiSeenIds.has(post.id)) {
          await this.prisma.seededPost.upsert({
            where: { telegramId: post.trackId },
            create: { telegramId: post.trackId, channel: TARGET_CHANNEL },
            update: {},
          });

          console.log(
            `📝 Post had no explicit AI output; marked as seen: ${post.id} (trackId=${post.trackId})`
          );
        }
      }

      logDivider("RUN COMPLETE");
      console.log(`✅ Finished processing ${postsToProcess.length} logical post(s).`);
    } catch (error) {
      console.error("❌ Seeder failed:", error);
    } finally {
      if (this.client) {
        try {
          await this.client.destroy();
        } catch {}
      }

      await this.prisma.$disconnect();
    }
  }
}

new FoodismServiceSeeder().run();