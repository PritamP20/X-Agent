// // server.ts
import * as dotenv from "dotenv";
dotenv.config({ path: "./RAG/env" });

import express from "express";
import { TwitterApi } from "twitter-api-v2";
import { AiReply } from "./ShitPostRAG/Query.ts";
import cron from "node-cron";

const app = express();
app.use(express.json());
const PORT = 3000;

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_KEY_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_SECRET!,
});

const TARGET_USERS = ["CNodmand36816"];
const lastSeen: Record<string, string | null> = {};

let lastRequestTime = 0;
const RATE_LIMIT_DELAY = 15 * 60 * 1000;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkTweetsAndReply() {
  try {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
      const waitTime = RATE_LIMIT_DELAY - timeSinceLastRequest;
      console.log(`⏳ Rate limit cooldown: waiting ${Math.round(waitTime / 1000)}s`);
      return; 
    }

    const query = TARGET_USERS.map(u => `from:${u}`).join(" OR ");

    console.log("Searching for tweets");
    lastRequestTime = Date.now();
    
    const searchResults = await twitterClient.v2.search(query, {
      max_results: 1,
      "tweet.fields": ["id", "text", "author_id", "created_at"],
    });

    if (!searchResults.tweets || searchResults.tweets.length === 0) {
      console.log("No tweets found");
      return;
    }

    console.log(` Found ${searchResults.tweets.length} tweets`);

    for (const tweet of searchResults.tweets) {
      if (!tweet.id || !tweet.text || !tweet.author_id) continue;

      if (lastSeen[tweet.author_id] === tweet.id) {
        console.log(`Already seen tweet ${tweet.id}`);
        continue;
      }

      lastSeen[tweet.author_id] = tweet.id;
      console.log(`New tweet from ${tweet.author_id}: ${tweet.text.substring(0, 100)}...`);

      const replyText = await AiReply(tweet.text);
      if (replyText.includes("not a shit post")) {
        console.log("🚫 Skipping - not a shit post");
        continue;
      }
      await sleep(2000); 
      
      try {
        await twitterClient.v2.reply(replyText, tweet.id);
        console.log(`Replied to tweet ${tweet.id}: ${replyText.substring(0, 50)}...`);
        
        lastRequestTime = Date.now();
        
        await sleep(5000); 
        
      } catch (replyError: any) {
        if (replyError.code === 429) {
          console.log(" Rate limited on reply, will try again later");
          lastSeen[tweet.author_id] = null;
          break; 
        } else {
          console.error(` Error replying to tweet ${tweet.id}:`, replyError.message);
        }
      }
    }

  } catch (err: any) {
    console.error("Error in cron job:", err.message || err);
    
    if (err.code === 429) {
      console.log("Search rate limited, will retry later");
      lastRequestTime = Date.now();
    }
  }
}

cron.schedule("*/15 * * * *", () => {
  console.log("Running cron job...");
  checkTweetsAndReply();
});

app.post("/check-tweets", async (req, res) => {
  try {
    await checkTweetsAndReply();
    res.json({ success: true, message: "Tweet check completed" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/status", (req, res) => {
  res.json({ 
    status: "running",
    lastSeen,
    lastRequestTime: new Date(lastRequestTime).toISOString(),
    nextAllowedRequest: new Date(lastRequestTime + RATE_LIMIT_DELAY).toISOString()
  });
});

app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` Status endpoint: http://localhost:${PORT}/status`);
  console.log(` Manual trigger: POST http://localhost:${PORT}/check-tweets`);
});