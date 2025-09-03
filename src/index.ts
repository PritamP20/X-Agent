// server.ts
import * as dotenv from "dotenv";
dotenv.config({ path: "./RAG/env" });

import express from "express";
import axios from "axios";
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

const BEARER_TOKEN = process.env.BEARER_TOKEN!;
let cachedUserId: string | null = null;

// keep track of already replied tweet IDs
const repliedTweets = new Set<string>();

// app.get("/user/:username", async (req, res) => {
//   console.log("Bearer token:", BEARER_TOKEN); // Debugging line
//   const { username } = req.params;
//   try {
//     let userId = cachedUserId;

//     if (!userId) {
//       const response = await axios.get(
//         `https://api.twitter.com/2/users/by/username/${username}`,
//         { headers: { Authorization: `Bearer ${BEARER_TOKEN}` } }
//       );
//       userId = response.data.data.id;
//       cachedUserId = userId;
//     }

//     const tweetResponse = await axios.get(
//       `https://api.twitter.com/2/users/${userId}/tweets?max_results=5`,
//       { headers: { Authorization: `Bearer ${BEARER_TOKEN}` } }
//     );

//     const tweets = tweetResponse.data.data;
//     res.json({ tweets });
//   } catch (error: any) {
//     res.status(500).json({ error: error });
//   }
// });

app.get("/user/:username", async (req, res) => {
  try {
    const user = await twitterClient.v2.userByUsername(req.params.username);
    const tweets = await twitterClient.v2.userTimeline(user.data.id, { max_results: 5 });
    res.json({ tweets: tweets.data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/reply", async (req, res) => {
  try {
    const { tweetId, tweetText } = req.body;
    if (!tweetId || !tweetText) {
      return res.status(400).json({ error: "tweetId and tweetText required" });
    }

    // ✅ prevent duplicate replies
    if (repliedTweets.has(tweetId)) {
      return res.json({
        message: `Already replied to tweet ${tweetId}. Skipping.`,
      });
    }

    const replyText = await AiReply(tweetText);

    if (replyText.includes("not a shit post")) {
      return res.json({
        message: "Tweet is not a shitpost. No reply sent.",
        replyText,
      });
    }

    const { data } = await twitterClient.v2.reply(replyText, tweetId);

    // ✅ mark tweet as replied
    repliedTweets.add(tweetId);

    res.json({ message: "Reply posted!", data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 👇 Cron job runs every 2 minutes
const TARGET_USERS = ["CNodmand36816", "elonmusk", "jack"];

cron.schedule("*/2 * * * *", async () => {
  console.log("⏳ Running cron job: fetching recent tweets...");
  try {
    for (const username of TARGET_USERS) {
      console.log(`Fetching tweets for ${username}...`);
      const res = await axios.get(`http://localhost:${PORT}/user/${username}`);
      const tweets = res.data.tweets;

      if (tweets && tweets.length > 0) {
        const latestTweet = tweets[0]; // most recent tweet
        if (repliedTweets.has(latestTweet.id)) {
          console.log(`Already replied to tweet ${latestTweet.id}, skipping...`);
          continue;
        }

        console.log(`Replying to latest tweet from ${username}: ${latestTweet.text}`);
        await axios.post(`http://localhost:${PORT}/reply`, {
          tweetId: latestTweet.id,
          tweetText: latestTweet.text,
        });
      } else {
        console.log(`No tweets found for ${username}`);
      }
    }
  } catch (err) {
    console.error("Cron job error:", err);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
