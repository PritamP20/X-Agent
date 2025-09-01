import * as dotenv from "dotenv";
dotenv.config({ path: "./RAG/env" });

import express from "express";
import axios from "axios";
import { AiReply } from "./RAG/Query.ts"; 

const app = express();
const PORT = 3000;
const BEARER_TOKEN = process.env.BEARER_TOKEN!;

let cachedUserId: string | null = null;

app.get("/user/:username", async (req, res) => {
  const { username } = req.params;
  try {
    let userId = cachedUserId;

    if (!userId) {
      const response = await axios.get(
        `https://api.twitter.com/2/users/by/username/${username}`,
        { headers: { Authorization: `Bearer ${BEARER_TOKEN}` } }
      );
      userId = response.data.data.id;
      cachedUserId = userId;
    }

    const tweetResponse = await axios.get(
      `https://api.twitter.com/2/users/${userId}/tweets?max_results=5`,
      { headers: { Authorization: `Bearer ${BEARER_TOKEN}` } }
    );

    const tweets = tweetResponse.data.data; 
    res.json({ tweets });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/reply", async (req, res) => {
  try {
    const { tweetId, tweetText } = req.body;
    if (!tweetId || !tweetText) return res.status(400).json({ error: "tweetId and tweetText required" });

    const replyText = await AiReply(tweetText);

    if (replyText.includes("not a shit post")) {
      return res.json({ message: "Tweet is not a shitpost. No reply sent.", replyText });
    }
    const response = await axios.post(
      "https://api.twitter.com/2/tweets",
      {
        text: replyText,
        reply: { in_reply_to_tweet_id: tweetId },
      },
      { headers: { Authorization: `Bearer ${BEARER_TOKEN}`, "Content-Type": "application/json" } }
    );

    res.json({ message: "Reply posted!", data: response.data });
  } catch (error: any) {
    res.status(500).json({ error: error });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
