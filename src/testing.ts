// replyTest.ts
import { TwitterApi } from "twitter-api-v2";
import "dotenv/config";

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_KEY_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_SECRET!,
});

async function replyTest() {
  try {
    const tweetId = "1962550443617497090"; // Tweet to reply to
    const replyText = "This is a working test reply 🚀";

    const { data } = await client.v2.reply(replyText, tweetId);
    console.log("✅ Reply sent:", data);
  } catch (error) {
    console.error("❌ Error sending reply:", error);
  }
}

replyTest();
