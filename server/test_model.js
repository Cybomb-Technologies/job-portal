const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log("Testing gemini-pro...");
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Hi");
    console.log("SUCCESS: gemini-pro is working.");
  } catch (error) {
    console.log("FAILED: gemini-pro error:", error.message);
  }
}

testModel();
