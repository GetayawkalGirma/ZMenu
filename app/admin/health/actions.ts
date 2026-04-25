"use server";

import prisma from "@/lib/prisma";
import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions";
import "dotenv/config";
import fs from "fs";

export async function testRawQuery() {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    return { success: true, message: `Raw query (SELECT 1) succeeded in ${Date.now() - start}ms` };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function testFetchRestaurants() {
  try {
    const start = Date.now();
    const count = await prisma.restaurant.count();
    return { success: true, message: `Successfully fetched count (${count}) from restaurant.Restaurant in ${Date.now() - start}ms` };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function testFetchMeals() {
  try {
    const start = Date.now();
    const count = await prisma.menuItem.count();
    return { success: true, message: `Successfully fetched count (${count}) from menu.MenuItem in ${Date.now() - start}ms` };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function testCloudStorage() {
  try {
    const start = Date.now();
    const { fileService } = await import("@/services/file/file.service");
    
    // Create a tiny dummy text file
    const dummyBuffer = Buffer.from("ZDish Storage Test " + new Date().toISOString());
    const result = await fileService.uploadFile(
      dummyBuffer,
      "health-check-test.txt",
      "text/plain"
    );

    return { 
      success: true, 
      message: `Storage test succeeded! File uploaded as ${result.path} in ${Date.now() - start}ms` 
    };
  } catch (err: any) {
    return { success: false, message: `Storage Error: ${err.message}` };
  }
}

export async function checkEnvVars() {
  const aiKeys = Object.keys(process.env).filter(key => key.startsWith("GOOGLE_API_KEY"));
  
  // Also handle the comma-separated list if present
  if (process.env.GOOGLE_API_KEYS) {
    process.env.GOOGLE_API_KEYS.split(",").forEach((_, i) => {
      aiKeys.push(`GOOGLE_API_KEYS[${i}]`);
    });
  }

  return {
    dbUrlSet: !!process.env.DATABASE_URL,
    directUrlSet: !!process.env.DIRECT_URL,
    storageUrlSet: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    storageKeySet: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    telegramIdSet: !!process.env.TELEGRAM_API_ID,
    telegramHashSet: !!process.env.TELEGRAM_API_HASH,
    aiKeys,
    nodeEnv: process.env.NODE_ENV,
  };
}

export async function testSpecificAIKey(keyName: string) {
  let keyValue = "";
  
  if (keyName.startsWith("GOOGLE_API_KEYS[")) {
    const idxMatch = keyName.match(/\[(\d+)\]/);
    if (idxMatch) {
      const idx = parseInt(idxMatch[1]);
      keyValue = (process.env.GOOGLE_API_KEYS || "").split(",")[idx]?.trim() || "";
    }
  } else {
    keyValue = process.env[keyName] || "";
  }

  if (!keyValue) return { success: false, message: `Key ${keyName} is empty or missing.` };

  try {
    const start = Date.now();
    const modelUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${keyValue}`;
    const modelResp = await fetch(modelUrl);
    const modelData = await modelResp.json();

    if (modelData.error) {
      return { success: false, message: `❌ Discovery Error: ${modelData.error.message}` };
    }

    const flashModel = (modelData.models || []).find((m: any) => m.name.includes("flash"));
    const modelName = flashModel ? flashModel.name.replace("models/", "") : "gemini-1.5-flash";

    const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${keyValue}`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Respond with 'OK'." }] }]
      })
    });

    const data = await resp.json();
    if (data.error) {
      return { success: false, message: `❌ AI Error: ${data.error.message}` };
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return { 
      success: true, 
      message: `✅ ${keyName} is WORKING. Responded "${text}" via ${modelName} in ${Date.now() - start}ms` 
    };
  } catch (err: any) {
    return { success: false, message: `❌ Critical Error: ${err.message}` };
  }
}

export async function testAIKeys() {
  const keys = [
    { name: "GOOGLE_API_KEY", value: process.env.GOOGLE_API_KEY },
    { name: "GOOGLE_API_KEY_2", value: process.env.GOOGLE_API_KEY_2 },
  ].filter(k => k.value);

  if (keys.length === 0) {
    return { success: false, message: "No Google API keys found in environment variables." };
  }

  const results: string[] = [];
  let allSuccess = true;

  for (const keyObj of keys) {
    try {
      const start = Date.now();
      // First, discover models
      const modelUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${keyObj.value}`;
      const modelResp = await fetch(modelUrl);
      const modelData = await modelResp.json();

      if (modelData.error) {
        results.push(`❌ ${keyObj.name}: Model discovery failed - ${modelData.error.message}`);
        allSuccess = false;
        continue;
      }

      const flashModel = (modelData.models || []).find((m: any) => m.name.includes("gemini-1.5-flash") || m.name.includes("gemini-2.0-flash"));
      const modelName = flashModel ? flashModel.name.replace("models/", "") : "gemini-1.5-flash";

      // Then, send a simple "Hi"
      const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${keyObj.value}`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Respond with exactly the word 'READY'." }] }]
        })
      });

      const data = await resp.json();
      if (data.error) {
        results.push(`❌ ${keyObj.name}: AI Error - ${data.error.message}`);
        allSuccess = false;
      } else {
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        results.push(`✅ ${keyObj.name}: Responded "${text}" via ${modelName} in ${Date.now() - start}ms`);
      }
    } catch (err: any) {
      results.push(`❌ ${keyObj.name}: Critical Error - ${err.message}`);
      allSuccess = false;
    }
  }

  return { success: allSuccess, message: results.join("\n") };
}

export async function testTelegram() {
  const apiId = parseInt(process.env.TELEGRAM_API_ID || "0");
  const apiHash = process.env.TELEGRAM_API_HASH;
  const sessionString = process.env.TELEGRAM_SESSION || "";

  if (!apiId || !apiHash) {
    return { success: false, message: "Telegram API ID or Hash is missing." };
  }

  try {
    const start = Date.now();
    const session = new StringSession(sessionString);
    const client = new TelegramClient(session, apiId, apiHash, { connectionRetries: 5 });
    
    // Attempt connection
    await client.connect();
    
    // Check if we are authorized
    const me = await client.getMe();
    await client.destroy();

    if (me && me instanceof Api.User) {
      return { 
        success: true, 
        message: `✅ Telegram Connection Success! Logged in as ${me.firstName} (@${me.username || "no_username"}) in ${Date.now() - start}ms` 
      };
    } else {
      return { success: false, message: "❌ Telegram Connected but failed to retrieve account info." };
    }
  } catch (err: any) {
    return { success: false, message: `❌ Telegram Error: ${err.message}` };
  }
}
