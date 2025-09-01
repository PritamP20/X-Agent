// server.js

import * as dotenv from "dotenv";
dotenv.config({ path: "./RAG/env" });
import express from "express";
import axios from "axios";
import { AiReply } from "./RAG/Query.ts"; 

const app = express();
const PORT = 3000;
const BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAJqo3wEAAAAA8vPfkP8eBO9boD9YZ6dLib13ccI%3DdSTBYIOr6wOI2uply4bguOsopFNmuyGdUl8N7Xpal6rQOIBfuO";
// Cache
let cachedUserId: string | null = null;

app.get("/user/:username", async (req, res) => {
  const { username } = req.params;
  try {
    let userId = cachedUserId;

    // if (!userId) {
    //   const response = await axios.get(
    //     `https://api.twitter.com/2/users/by/username/${username}`,
    //     { headers: { Authorization: `Bearer ${BEARER_TOKEN}` } }
    //   );
    //   userId = response.data.data.id;
    //   cachedUserId = userId; // cache it
    // }

    // const tweetResponse = await axios.get(
    //   `https://api.twitter.com/2/users/${userId}/tweets?max_results=5`,
    //   { headers: { Authorization: `Bearer ${BEARER_TOKEN}` } }
    // );

    // res.json(tweetResponse.data);
    const tweets = [
    "I love learning TypeScript, it makes coding so much fun! 🎉",
    "bro this framework is trash, who even uses it anymore lol 💀",
    "Having a coffee while debugging is the best combo ☕🐛",
  ];
    const tweet = tweets[1];
    let reply = "No reply generated.";
    if (tweet) {
      reply = await AiReply(tweet);
    }
    res.json({ reply });
  } catch (error: any) {
    if (error.response?.status === 429) {
      res.status(429).json({ error: "Rate limit exceeded. Try again later." });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
