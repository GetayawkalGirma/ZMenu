import prisma from "../../lib/prisma";
import "dotenv/config";
import fs from "fs";
import { fileService } from "../../services/file/file.service";
import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions";
import input from "input";

const TARGET_CHANNEL = "Foodism11";
const BATCH_SIZE = 50;

function getEnvValue(key: string): string {
  if (process.env[key]) return process.env[key]!;
  const externalEnvPath = "/Users/yawkal/Documents/imposter folder/word seeder/.env";
  try {
    const content = fs.readFileSync(externalEnvPath, "utf-8");
    const match = content.match(new RegExp(`${key}=([^\\s]+)`));
    return match ? match[1] : "";
  } catch (e) {
    return "";
  }
}

function isVideoDocument(doc?: Api.TypeDocument | null): boolean {
  if (!doc || !(doc instanceof Api.Document)) return false;
  if (doc.mimeType?.startsWith("video/")) return true;
  return (doc.attributes || []).some((attr) => attr instanceof Api.DocumentAttributeVideo);
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

function detectUploadMeta(msg: Api.Message): { filename: string; mimeType: string } {
  if (msg.media instanceof Api.MessageMediaPhoto) {
    return { filename: `tg_${msg.id}.jpg`, mimeType: "image/jpeg" };
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
    return { filename: `tg_${msg.id}${ext}`, mimeType };
  }
  return { filename: `tg_${msg.id}.bin`, mimeType: "application/octet-stream" };
}

class ImageEnricher {
  private prisma = prisma;
  private apiId: number;
  private apiHash: string;
  private sessionString: string;
  private client: TelegramClient | null = null;
  // lowercase name → { id, name }
  private restaurantMap: Map<string, { id: string; name: string }> = new Map();

  constructor() {
    this.apiId = parseInt(getEnvValue("TELEGRAM_API_ID") || "0");
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

  private async loadRestaurants() {
    const restaurants = await this.prisma.restaurant.findMany({
      select: { id: true, name: true },
      where: { name: { not: null } },
    });
    this.restaurantMap.clear();
    for (const r of restaurants) {
      if (r.name) {
        this.restaurantMap.set(r.name.toLowerCase().trim(), { id: r.id, name: r.name });
      }
    }
    console.log(`📋 Loaded ${this.restaurantMap.size} restaurants from DB.`);
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

  /**
   * Derive the resume point from the SeededPost table.
   * Every post (matched or not) is inserted there, so the max telegramId
   * for this channel equals the highest message ID we have already scanned.
   * This works identically on GitHub Actions and locally — no file needed.
   */
  private async loadLastId(): Promise<number> {
    const rows = await this.prisma.seededPost.findMany({
      where: { channel: TARGET_CHANNEL },
      select: { telegramId: true },
    });
    if (rows.length === 0) return 0;
    const ids = rows
      .map((r) => parseInt(r.telegramId, 10))
      .filter((n) => !isNaN(n) && n < 1_000_000_000); // exclude groupedIds (very large numbers)
    return ids.length > 0 ? Math.max(...ids) : 0;
  }

  /**
   * Match a post's text against known restaurant names using simple substring matching.
   * Returns the first restaurant whose name appears in the post text, or null.
   */
  private findRestaurantInText(text: string): { id: string; name: string } | null {
    const lower = text.toLowerCase();
    for (const [lowerName, restaurant] of this.restaurantMap) {
      if (lower.includes(lowerName)) {
        return restaurant;
      }
    }
    return null;
  }

  async run() {
    console.log(`🚀 Starting IMAGE ENRICHER for: @${TARGET_CHANNEL}`);
    console.log(`   This scans history and adds images to existing restaurants in your DB.`);
    try {
      const client = await this.ensureAuthenticated();
      await this.loadRestaurants();

      const lastId = await this.loadLastId();
      console.log(`📍 Resuming from Message ID: ${lastId || "beginning"}`);

      let currentMinId = lastId;
      let hasMore = true;
      let totalImagesAdded = 0;

      while (hasMore) {
        console.log(`\n📥 Fetching batch after ID ${currentMinId}...`);
        const messages: any[] = await client.getMessages(TARGET_CHANNEL, {
          limit: BATCH_SIZE,
          minId: currentMinId,
          reverse: true,
        });

        if (messages.length === 0) {
          console.log("✨ All messages processed!");
          hasMore = false;
          break;
        }

        // Group messages by groupedId (album/multi-photo posts)
        const groups = new Map<string, Api.Message[]>();
        const standalone: Api.Message[] = [];
        for (const msg of messages) {
          const gid = msg.groupedId ? msg.groupedId.toString() : null;
          if (gid) {
            const g = groups.get(gid) || [];
            g.push(msg);
            groups.set(gid, g);
          } else {
            standalone.push(msg);
          }
        }

        const postsToProcess = [
          ...standalone.map((m) => ({
            id: m.id.toString(),
            trackId: m.id.toString(),
            msgs: [m] as Api.Message[],
          })),
          ...Array.from(groups.entries()).map(([gid, msgs]) => ({
            id: gid,
            trackId: Math.max(...msgs.map((m) => m.id)).toString(),
            msgs,
          })),
        ];

        // Skip already-processed posts
        const trackIds = postsToProcess.map((p) => p.trackId);
        const alreadySeeded = await this.prisma.seededPost.findMany({
          where: { telegramId: { in: trackIds }, channel: TARGET_CHANNEL },
          select: { telegramId: true },
        });
        const seededSet = new Set(alreadySeeded.map((s) => s.telegramId));
        const unprocessed = postsToProcess.filter((p) => !seededSet.has(p.trackId));

        if (unprocessed.length === 0) {
          console.log(`⏭️ All ${postsToProcess.length} posts already processed, skipping batch.`);
          currentMinId = Math.max(...messages.map((m: any) => m.id));
          if (messages.length < BATCH_SIZE) hasMore = false;
          continue;
        }

        for (const post of unprocessed) {
          const text = post.msgs
            .map((m) => m.message || "")
            .filter((t) => t.length > 0)
            .join("\n")
            .trim();

          const restaurantEntry = text.length > 3 ? this.findRestaurantInText(text) : null;

          if (restaurantEntry) {
            const imageMessages = post.msgs
              .filter((m): m is Api.Message => m instanceof Api.Message)
              .filter(isPhotoMessage)
              .sort((a, b) => a.id - b.id);

            if (imageMessages.length > 0) {
              console.log(
                `🖼️  "${restaurantEntry.name}" — downloading ${imageMessages.length} image(s)...`
              );
            }

            let added = 0;
            for (const imgMsg of imageMessages) {
              try {
                const buffer = await this.redownloadMessageMedia(
                  client,
                  TARGET_CHANNEL,
                  imgMsg
                );
                if (!buffer || !buffer.length) continue;

                const meta = detectUploadMeta(imgMsg);
                const file = await fileService.uploadFile(
                  buffer,
                  meta.filename,
                  meta.mimeType
                );

                await this.prisma.restaurantImageLibrary.upsert({
                  where: {
                    restaurantId_imageId: {
                      restaurantId: restaurantEntry.id,
                      imageId: file.id,
                    },
                  },
                  create: { restaurantId: restaurantEntry.id, imageId: file.id },
                  update: {},
                });
                added++;
                totalImagesAdded++;
              } catch (e) {
                console.error(`   ❌ Media fail for msg ${imgMsg.id}:`, e);
              }
            }

            if (added > 0) {
              console.log(`   ✅ Added ${added} new image(s) to library.`);
            }
          }

          // Always mark as processed to avoid retrying forever
          await this.prisma.seededPost.upsert({
            where: { telegramId: post.trackId },
            create: { telegramId: post.trackId, channel: TARGET_CHANNEL },
            update: {},
          });
        }

        currentMinId = Math.max(...messages.map((m: any) => m.id));
        console.log(`✅ Batch done. Last ID: ${currentMinId} | Total images added: ${totalImagesAdded}`);

        if (messages.length < BATCH_SIZE) hasMore = false;
      }

      console.log(`\n🎉 Enrichment complete! Added ${totalImagesAdded} total images to library.`);
    } catch (error) {
      console.error("❌ Enricher failed:", error);
    } finally {
      if (this.client) try { await this.client.destroy(); } catch (e) {}
      await this.prisma.$disconnect();
    }
  }
}

new ImageEnricher().run();
