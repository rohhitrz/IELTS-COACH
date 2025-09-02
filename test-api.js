import dotenv from 'dotenv';
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not found in .env file");
    process.exit(1);
}

console.log("✅ API Key found, testing Gemini connection...");

const ai = new GoogleGenAI({ apiKey: apiKey });

async function testConnection() {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Say 'Hello, IELTS Coach!' to test the connection.",
        });
        
        console.log("✅ Gemini API connection successful!");
        console.log("📝 Response:", response.text);
        console.log("\n🎉 Your API key is working correctly!");
        console.log("\n📋 Next steps:");
        console.log("1. Run 'npm run dev' to start the frontend");
        console.log("2. Deploy to Vercel for full functionality");
        console.log("3. Set GEMINI_API_KEY in Vercel environment variables");
        
    } catch (error) {
        console.error("❌ API connection failed:", error.message);
        console.log("\n🔧 Troubleshooting:");
        console.log("1. Check your API key in .env file");
        console.log("2. Verify the key is valid at https://aistudio.google.com/app/apikey");
        console.log("3. Make sure you have API quota remaining");
    }
}

testConnection();