"use server";

import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

function getEnvValue(key: string): string {
  if (process.env[key]) return process.env[key]!;
  const externalEnvPath = "/Users/yawkal/Documents/imposter folder/word seeder/.env";
  try {
    const content = fs.readFileSync(externalEnvPath, "utf-8");
    const match = content.match(new RegExp(`${key}=([^\\s]+)`));
    return match ? match[1] : "";
  } catch (e) { return ""; }
}

function getAllApiKeys(): string[] {
  const keys = new Set<string>();
  if (process.env.GOOGLE_API_KEY) keys.add(process.env.GOOGLE_API_KEY);
  if (process.env.GOOGLE_API_KEYS) process.env.GOOGLE_API_KEYS.split(",").forEach(k => keys.add(k.trim()));
  if (process.env.GOOGLE_API_KEY_2) keys.add(process.env.GOOGLE_API_KEY_2);
  const extKey = getEnvValue("GOOGLE_API_KEY");
  if (extKey) keys.add(extKey);
  return Array.from(keys).filter(Boolean);
}

async function discoverModelsForKey(apiKey: string): Promise<string[]> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (!data.models) return [];
    return data.models
      .filter((m: any) => 
        m.supportedGenerationMethods.includes("generateContent") && 
        (m.name.includes("flash") || m.name.includes("pro"))
      )
      .map((m: any) => m.name.replace("models/", ""));
  } catch {
    return [];
  }
}

export async function extractMealsFromImage(formData: FormData): Promise<{
  success: boolean;
  data?: Array<{
    name: string;
    price: number;
    type: "FOOD" | "DRINK";
    dietaryCategory?: string;
  }>;
  error?: string;
}> {
  console.log("🚀 extractMealsFromImage called");
  
  const imageFile = formData.get("menuImage") as File | null;
  if (!imageFile || imageFile.size === 0) return { success: false, error: "No image provided" };

  const apiKeys = getAllApiKeys();
  if (apiKeys.length === 0) return { success: false, error: "AI service not configured" };

  const buffer = Buffer.from(await imageFile.arrayBuffer());
  const base64 = buffer.toString("base64");
  const mimeType = imageFile.type || "image/jpeg";
  
  const prompt = `Analyze this restaurant menu image. Extract every dish and drink you can see. Return ONLY a JSON array. 
  FORMAT: [{ "name": "string", "price": number, "type": "FOOD" | "DRINK", "dietaryCategory": "YETSOM" | "YEFITSIK" }]`;

  for (const apiKey of apiKeys) {
    console.log(`🔑 Key: ${apiKey.substring(0, 8)}...`);
    const availableModels = await discoverModelsForKey(apiKey);
    
    // Sort to try Flash models first
    const sortedModels = availableModels.sort((a, b) => {
      if (a.includes("flash") && !b.includes("flash")) return -1;
      if (!a.includes("flash") && b.includes("flash")) return 1;
      return 0;
    });

    for (const modelName of sortedModels) {
      const isSmartModel = modelName.includes("2.0") || modelName.includes("2.5");
      const version = isSmartModel ? "v1beta" : "v1";
      const url = `https://generativelanguage.googleapis.com/${version}/models/${modelName}:generateContent?key=${apiKey}`;
      
      console.log(`  📡 Trying ${modelName} (${version})...`);

      try {
        const body: any = {
          contents: [{
            parts: [
              { inlineData: { mimeType, data: base64 } },
              { text: prompt }
            ],
          }],
        };

        if (isSmartModel) {
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
          const isQuota = data.error.message.includes("quota") || data.error.message.includes("rate limit");
          console.warn(`    ⚠️ ${modelName} failed:`, isQuota ? "QUOTA EXCEEDED" : data.error?.message);
          if (isQuota) break; // Try next key
          continue;
        }

        let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) continue;

        console.log(`    ✅ Success with ${modelName}!`);
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const meals = JSON.parse(text);

        if (Array.isArray(meals)) {
          return {
            success: true,
            data: meals.map((m: any) => ({
              name: String(m.name).trim(),
              price: typeof m.price === "number" ? m.price : 0,
              type: m.type === "DRINK" ? "DRINK" : "FOOD",
              dietaryCategory: m.dietaryCategory,
            }))
          };
        }
      } catch (err) {
        console.warn(`    ❌ Error with ${modelName}:`, err);
      }
    }
  }

  return { success: false, error: "All AI models and keys exhausted." };
}
