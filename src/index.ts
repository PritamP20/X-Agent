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

    const replyText = await AiReply(tweetText);

    if (replyText.includes("not a shit post")) {
      return res.json({
        message: "Tweet is not a shitpost. No reply sent.",
        replyText,
      });
    }

    const { data } = await twitterClient.v2.reply(replyText, tweetId);

    res.json({ message: "Reply posted!", data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const TARGET_USERS = ["CNodmand36816", "elonmusk", "jack"]; 

async function setupStream() {
  console.log("🎧 Setting up filtered stream...");

  console.log(BEARER_TOKEN)
  const appOnlyClient = new TwitterApi(BEARER_TOKEN);

  const rules = await appOnlyClient.v2.streamRules();
  if (rules.data?.length) {
    await appOnlyClient.v2.updateStreamRules({
      delete: { ids: rules.data.map(r => r.id) }
    });
  }

  await appOnlyClient.v2.updateStreamRules({
    add: TARGET_USERS.map(username => ({ value: `from:${username}` }))
  });

  const stream = await appOnlyClient.v2.searchStream({ "tweet.fields": ["author_id"] });

  for await (const { data } of stream) {
    console.log(`Tweet from user ${data.author_id}:`, data.text);

    try {
      await axios.post(`http://localhost:${PORT}/reply`, {
        tweetId: data.id,
        tweetText: data.text
      });
      console.log(`📡 Forwarded tweet ${data.id} to /reply endpoint`);
    } catch (err) {
      console.error("Failed to call /reply:", err);
    }
  }
}


app.get("/stream", async (req, res)=>{
  try {
    setupStream()
    res.json({message: "streamline started"})
  } catch (error) {
    res.json({error: error})
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
