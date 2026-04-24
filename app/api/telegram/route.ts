import { NextRequest, NextResponse } from "next/server";
import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions";
import bigInt from "big-integer";
import prisma from "@/lib/prisma";
import { fileService } from "@/services/file/file.service";

export const runtime = "nodejs";
// Vercel Pro allows 60s; free tier caps at 10s for the search (light).
// Download is batched per-post to stay within limits.
export const maxDuration = 60;

// ── Telegram helpers ──────────────────────────────────────────────────────────

function isVideoDocument(doc?: Api.TypeDocument | null): boolean {
  if (!doc || !(doc instanceof Api.Document)) return false;
  if (doc.mimeType?.startsWith("video/")) return true;
  return (doc.attributes || []).some((a) => a instanceof Api.DocumentAttributeVideo);
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

/** Pick the best pre-generated thumbnail from a video document (no video download). */
function getBestVideoThumb(doc: Api.Document): Api.TypePhotoSize | null {
  const thumbs = doc.thumbs;
  if (!thumbs || thumbs.length === 0) return null;
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

// ── Client factory ────────────────────────────────────────────────────────────

async function buildClient(): Promise<TelegramClient> {
  const apiId = parseInt(process.env.TELEGRAM_API_ID || "0");
  const apiHash = process.env.TELEGRAM_API_HASH || "";
  const sessionString = process.env.TELEGRAM_SESSION || "";

  if (!apiId || !apiHash || !sessionString) {
    throw new Error(
      "Telegram credentials not configured. " +
        "Set TELEGRAM_API_ID, TELEGRAM_API_HASH, and TELEGRAM_SESSION in your environment."
    );
  }

  const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
    connectionRetries: 3,
  });
  await client.connect();
  return client;
}

// ── POST /api/telegram ────────────────────────────────────────────────────────
//
// action "search"
//   body: { restaurantName, channel, mealNames? }
//   returns: { posts: TelegramPost[], totalScanned, channel }
//
// action "download"
//   body: { restaurantId, channel, selectedPosts: { trackId: string; messageIds: number[] }[] }
//   returns: { added, errors }

export async function POST(req: NextRequest) {
  let client: TelegramClient | null = null;
  try {
    const body = await req.json();
    const { action } = body;

    client = await buildClient();

    if (action === "search") {
      return await handleSearch(client, body);
    } else if (action === "download") {
      return await handleDownload(client, body);
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err: any) {
    const message = String(err?.message || err);
    if (
      message.includes("not configured") ||
      message.includes("TELEGRAM_")
    ) {
      return NextResponse.json({ error: message, missingCredentials: true }, { status: 503 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    if (client) {
      try {
        await client.destroy();
      } catch {}
    }
  }
}

// ── Search handler ────────────────────────────────────────────────────────────

export type TelegramPost = {
  id: string;
  trackId: string;
  messageIds: number[];
  text: string;
  imageCount: number;
  videoCount: number;
  matchedTerms: string[];
};

async function handleSearch(
  client: TelegramClient,
  {
    restaurantName,
    channel,
    mealNames = [],
  }: {
    restaurantName: string;
    channel: string;
    mealNames?: string[];
  }
): Promise<NextResponse> {
  // Try to resolve the channel — gives a clean error if it doesn't exist
  let peerEntity: Awaited<ReturnType<typeof client.getInputEntity>>;
  try {
    peerEntity = await client.getInputEntity(channel);
  } catch {
    return NextResponse.json(
      {
        error: `Channel @${channel} not found or not accessible. Check the username and try again.`,
        notFound: true,
      },
      { status: 404 }
    );
  }

  // Build search terms: restaurant name first, then meal names
  const searchTerms = [
    restaurantName.toLowerCase().trim(),
    ...mealNames.map((n) => n.toLowerCase().trim()).filter(Boolean),
  ];

  // Use Telegram's native search for each term to find matching messages.
  // We deduplicate by message ID across all searches.
  const messageMap = new Map<number, Api.Message>();

  for (const term of searchTerms.slice(0, 3)) {
    // cap to avoid rate limits
    try {
      const result = await client.invoke(
        new Api.messages.Search({
          peer: peerEntity,
          q: term,
          filter: new Api.InputMessagesFilterEmpty(),
          minDate: 0,
          maxDate: 0,
          offsetId: 0,
          addOffset: 0,
          limit: 40,
          maxId: 0,
          minId: 0,
          hash: bigInt(0),
        })
      );

      const msgs =
        "messages" in result
          ? (result.messages as Api.Message[]).filter((m) => m instanceof Api.Message)
          : [];

      for (const m of msgs) {
        messageMap.set(m.id, m);
      }
    } catch {
      // If search for a meal name fails, continue
    }
  }

  if (messageMap.size === 0) {
    return NextResponse.json({
      channel,
      restaurantName,
      posts: [] as TelegramPost[],
      totalScanned: 0,
    });
  }

  // For every found message that belongs to an album (groupedId),
  // fetch nearby messages to collect all album members.
  const allMessages = new Map<number, Api.Message>(messageMap);

  for (const msg of Array.from(messageMap.values())) {
    if (!(msg instanceof Api.Message)) continue;
    const gid = msg.groupedId;
    if (!gid) continue;

    try {
      // Album messages have consecutive IDs — grab a window around this message
      const nearby = await client.getMessages(channel, {
        limit: 20,
        minId: msg.id - 15,
        maxId: msg.id + 15,
      });

      const arr = Array.isArray(nearby) ? nearby : [nearby];
      for (const m of arr) {
        if (m instanceof Api.Message && m.groupedId?.toString() === gid.toString()) {
          allMessages.set(m.id, m);
        }
      }
    } catch {}
  }

  // Group messages by groupedId (album) or standalone
  const groups = new Map<string, Api.Message[]>();
  const standalone: Api.Message[] = [];

  for (const msg of Array.from(allMessages.values())) {
    if (!(msg instanceof Api.Message)) continue;
    const gid = msg.groupedId?.toString();
    if (gid) {
      const g = groups.get(gid) || [];
      g.push(msg);
      groups.set(gid, g);
    } else {
      standalone.push(msg);
    }
  }

  const posts: TelegramPost[] = [
    ...standalone.map((m) => ({
      key: m.id.toString(),
      trackId: m.id.toString(),
      msgs: [m],
    })),
    ...Array.from(groups.entries()).map(([gid, msgs]) => ({
      key: gid,
      trackId: Math.max(...msgs.map((m) => m.id)).toString(),
      msgs,
    })),
  ]
    .map(({ key, trackId, msgs }) => {
      const text = msgs
        .map((m) => (m as Api.Message).message || "")
        .filter((t) => t.length > 0)
        .join("\n")
        .trim();

      const lowerText = text.toLowerCase();
      const matchedTerms = searchTerms.filter((term) => lowerText.includes(term));
      const imageCount = msgs.filter((m) => m instanceof Api.Message && isPhotoMessage(m as Api.Message)).length;
      const videoCount = msgs.filter((m) => m instanceof Api.Message && isVideoMessage(m as Api.Message)).length;

      return {
        id: key,
        trackId,
        messageIds: msgs.map((m) => m.id),
        text: text.slice(0, 600),
        imageCount,
        videoCount,
        matchedTerms,
      } satisfies TelegramPost;
    })
    // Keep posts that have photos OR videos (with thumbnails) AND match at least one search term
    .filter((p) => (p.imageCount > 0 || p.videoCount > 0) && p.matchedTerms.length > 0);

  // Sort: most relevant (most matched terms) first, then by trackId (newest)
  posts.sort((a, b) => {
    if (b.matchedTerms.length !== a.matchedTerms.length) {
      return b.matchedTerms.length - a.matchedTerms.length;
    }
    return parseInt(b.trackId, 10) - parseInt(a.trackId, 10);
  });

  return NextResponse.json({
    channel,
    restaurantName,
    posts,
    totalScanned: messageMap.size,
  });
}

// ── Download handler ──────────────────────────────────────────────────────────

async function handleDownload(
  client: TelegramClient,
  {
    restaurantId,
    channel,
    selectedPosts,
  }: {
    restaurantId: string;
    channel: string;
    selectedPosts: { trackId: string; messageIds: number[] }[];
  }
): Promise<NextResponse> {
  let added = 0;
  let errors = 0;

  for (const post of selectedPosts) {
    // Re-fetch the messages fresh to avoid FILE_REFERENCE_EXPIRED errors
    let freshMessages: Api.Message[] = [];
    try {
      const fetched = await client.getMessages(channel, { ids: post.messageIds });
      freshMessages = (Array.isArray(fetched) ? fetched : [fetched]).filter(
        (m): m is Api.Message => m instanceof Api.Message
      );
    } catch (err) {
      console.error(`Failed to fetch messages for post ${post.trackId}:`, err);
      errors++;
      continue;
    }

    const mediaMessages = freshMessages.filter(
      (m) => isPhotoMessage(m) || isVideoMessage(m)
    );

    for (const msg of mediaMessages) {
      try {
        let buf: Buffer | null = null;
        let meta: { filename: string; mimeType: string };

        if (isVideoMessage(msg)) {
          // Download only the pre-baked thumbnail — no video bytes
          if (
            msg.media instanceof Api.MessageMediaDocument &&
            msg.media.document instanceof Api.Document
          ) {
            const thumb = getBestVideoThumb(msg.media.document);
            if (!thumb) continue;
            const raw = await client.downloadMedia(msg.media, { thumb });
            buf = Buffer.isBuffer(raw) ? raw : null;
          }
          meta = { filename: `tg_${msg.id}_thumb.jpg`, mimeType: "image/jpeg" };
        } else {
          const raw = await client.downloadMedia(msg.media!, {});
          buf = Buffer.isBuffer(raw) ? raw : null;
          meta = detectUploadMeta(msg);
        }

        if (!buf || !buf.length) continue;

        const file = await fileService.uploadFile(buf, meta.filename, meta.mimeType);

        await prisma.restaurantImageLibrary.upsert({
          where: {
            restaurantId_imageId: { restaurantId, imageId: file.id },
          },
          create: { restaurantId, imageId: file.id },
          update: {},
        });

        added++;
      } catch (err) {
        console.error(`Failed to download/save msg ${msg.id}:`, err);
        errors++;
      }
    }
  }

  return NextResponse.json({ added, errors });
}
