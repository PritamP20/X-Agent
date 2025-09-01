import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import "dotenv/config";  
import * as dotenv from "dotenv";
dotenv.config({ path: "./" });

// LLM setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const ai = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// Analyse with RAG
async function analyseTweet(tweet: string) {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY!,
    model: "text-embedding-004",
  });

  // 1. Get Pinecone index
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

  // 2. Embed tweet
  const queryVector = await embeddings.embedQuery(tweet);

  // 3. Search in Pinecone
  const searchResults = await pineconeIndex.query({
    topK: 5,
    vector: queryVector,
    includeMetadata: true,
  });

  // 4. Build context from retrieved docs
  const context = searchResults.matches
    .map((m) => m.metadata?.text || "")
    .join("\n---\n");

  // 5. Ask Gemini to analyze using context
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

// Reply generator
export async function AiReply(tweet: string) {
  try {
    console.log("🟡 Analyzing tweet with RAG...");
    const isShitPost = await analyseTweet(tweet);
    console.log("✅ Analysis result:", isShitPost ? "Shitpost" : "Normal");

    if(!isShitPost) return "Ohh i see it is not a shit post!"

    const fullPrompt = `
            You are an AI assistant that replies to tweets in a professional, empathetic, and engaging way.

            Tweet:
            "${tweet}"

            Guidelines:
            - Keep the reply short and conversational.
            - Avoid sounding robotic.
            - If the tweet is rude or negative, reply politely without escalating.
            `;

    console.log("🟡 Generating AI reply...");
    const response = await ai.generateContent(fullPrompt);

    const replyText = response.response.text();  // <-- extract text
    console.log("✅ AI reply generated:", replyText);

return replyText; 
  } catch (error) {
    console.error("❌ Error in AiReply:", error);
    return "Sorry, I couldn’t generate a reply right now.";
  }
}


async function main() {

    console.log("Pinecone API Key:", process.env.PINECONE_API_KEY);
console.log("Pinecone Index Name:", process.env.PINECONE_INDEX_NAME);


  const tweets = [
    "I love learning TypeScript, it makes coding so much fun! 🎉",
    "bro this framework is trash, who even uses it anymore lol 💀",
    "Having a coffee while debugging is the best combo ☕🐛",
  ];

  for (const tweet of tweets) {
    console.log("\n===============================");
    console.log("📢 Tweet:", tweet);

    const reply = await AiReply(tweet);

    console.log("🤖 AI Reply:", reply);
  }
}

main().catch(console.error);