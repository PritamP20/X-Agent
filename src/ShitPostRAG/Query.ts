import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import "dotenv/config";  
import * as dotenv from "dotenv";
dotenv.config({ path: "./" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const ai = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
async function analyseTweet(tweet: string) {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY!,
    model: "text-embedding-004",
  });

  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

  const queryVector = await embeddings.embedQuery(tweet);

  const searchResults = await pineconeIndex.query({
    topK: 5,
    vector: queryVector,
    includeMetadata: true,
  });

  const context = searchResults.matches
    .map((m) => m.metadata?.text || "")
    .join("\n---\n");

  const prompt = `
You are a moderation AI. 
Given the tweet and related context, decide if it's a low-quality or disruptive post.

Tweet:
"${tweet}"

Relevant context:
${context}

Answer with only one label: "normal" or "shitpost".
`;

  const response = await ai.generateContent(prompt);
  return response.response.text().toLowerCase().includes("shitpost");
}

export async function AiReply(tweet: string) {
  try {
    console.log("Analyzing tweet with RAG...");
    const isShitPost = await analyseTweet(tweet);
    console.log("Analysis result:", isShitPost ? "Shitpost" : "Normal");

    if(!isShitPost) return "Ohh i see it is not a shit post!"

    const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
    });

    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY!,
        model: "text-embedding-004",
    });
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

    const queryVector = await embeddings.embedQuery(tweet);

    const replyResult = await pineconeIndex.query({
        topK: 5,
        vector: queryVector,
        includeMetadata: true,
    });

    const context = replyResult.matches
    .map((m) => m.metadata?.text || "")
    .join("\n---\n");

    const fullPrompt = `
            You are an AI assistant designed to craft replies to Twitter (X) posts, including humorous and absurd shitposts. Your responses must be professional, empathetic, engaging, and conversational, avoiding robotic or overly formal language. Follow these guidelines:

Keep replies short (1-2 sentences) and conversational, matching the tone of the tweet when appropriate (e.g., humorous for shitposts, empathetic for serious posts).
For rude or negative tweets, respond politely and de-escalate without engaging in conflict.
For shitposts, draw inspiration from the provided dataset (Shitpost Reply Guide for Twitter) to craft absurd, ironic, or humorous replies that align with the tweet's energy, using strategies like derailing, self-deprecation, or pop culture twists.
Incorporate emojis sparingly for emphasis or humor, especially for shitposts (e.g., 😂, 💀).
Avoid harmful stereotypes or offensive content, keeping replies light and inclusive.
If the tweet's context is unclear, make a reasonable assumption based on common Twitter themes (e.g., humor, rants, observations).
Use the provided tweet context: "${context}" to tailor the response.
            `;

    console.log("Generating AI reply...");
    const response = await ai.generateContent(fullPrompt);

    const replyText = response.response.text();  // <-- extract text
    console.log("AI reply generated:", replyText);

return replyText; 
  } catch (error) {
    console.error("Error in AiReply:", error);
    return "Sorry, I couldn’t generate a reply right now.";
  }
}
async function main() {
  const sampleTweet = "Just saw a pigeon steal a sandwich, society is collapsing 😂";

  console.log("🚀 Testing AiReply with sample tweet:");
  console.log("Tweet:", sampleTweet);

  const reply = await AiReply(sampleTweet);

  console.log("🤖 AI Reply:", reply);
}

// main().catch((err) => {
//   console.error("❌ Fatal error in main:", err);
// });
