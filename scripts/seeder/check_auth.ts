import "dotenv/config";
import fs from "fs";
import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions";

function getEnvValue(key: string): string {
  if (process.env[key]) return process.env[key]!;
  const externalEnvPath = "/Users/yawkal/Documents/imposter folder/word seeder/.env";
  try {
    const content = fs.readFileSync(externalEnvPath, "utf-8");
    const match = content.match(new RegExp(`${key}=([^\\s]+)`));
    return match ? match[1] : "";
  } catch (e) { return ""; }
}

async function checkAuth() {
  const apiId = parseInt(getEnvValue("TELEGRAM_API_ID") || "0");
  const apiHash = getEnvValue("TELEGRAM_API_HASH");
  const sessionString = getEnvValue("TELEGRAM_SESSION") || "";

  if (!apiId || !apiHash || !sessionString) {
    console.error("❌ Missing Telegram credentials in .env");
    return;
  }

  const session = new StringSession(sessionString);
  const client = new TelegramClient(session, apiId, apiHash, { connectionRetries: 5 });

  console.log("🔄 Connecting to Telegram...");
  try {
    await client.connect();
    
    console.log("👤 Fetching account info...");
    const me = await client.getMe();
    
    if (me instanceof Api.User) {
      console.log("\n✅ SESSION IS ACTIVE");
      console.log(`ID: ${me.id}`);
      console.log(`First Name: ${me.firstName}`);
      console.log(`Username: ${me.username || "None"}`);
      console.log(`Phone: ${me.phone || "Hidden"}`);
      
      if (me.restricted) {
        console.log("⚠️ ACCOUNT IS RESTRICTED!");
        console.log("Reason:", me.restrictionReason);
      } else {
        console.log("🟢 No public restrictions found on this account.");
      }

      // Check for Spam Bot status
      console.log("\n🔍 Checking for Spam Bot status...");
      try {
        await client.sendMessage("spambot", { message: "/start" });
        console.log("⏳ Waiting for @SpamBot response...");
        
        // Wait a bit for the response
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const messages = await client.getMessages("spambot", { limit: 1 });
        if (messages.length > 0) {
          console.log("\n📩 Latest message from @SpamBot:");
          console.log("-----------------------------------------");
          console.log(messages[0].message);
          console.log("-----------------------------------------");
          
          if (messages[0].message.includes("no limits") || messages[0].message.includes("free of any limits")) {
            console.log("✅ CONFIRMED: Your account has NO spam restrictions.");
          } else {
            console.log("⚠️ Your account might have some restrictions. Read the message above.");
          }
        }
      } catch (e: any) {
        console.error("❌ Failed to message @SpamBot:", e.message);
      }

    } else {
      console.log("❓ Could not retrieve user info (Unexpected result type).");
    }

  } catch (error: any) {
    console.error("\n❌ AUTHENTICATION FAILED");
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    
    if (error.message.includes("USER_DEACTIVATED")) {
      console.error("🚨 CRITICAL: The account has been deleted/deactivated by Telegram.");
    } else if (error.message.includes("AUTH_KEY_INVALID")) {
      console.error("🔑 The session string is no longer valid.");
    }
  } finally {
    await client.destroy();
  }
}

checkAuth();
