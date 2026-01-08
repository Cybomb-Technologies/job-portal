require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello");
    console.log("gemini-1.5-flash works!");
    return;
  } catch (error) {
    console.log("gemini-1.5-flash failed.");
    console.error(JSON.stringify(error, null, 2));
    console.error(error.response ? JSON.stringify(error.response, null, 2) : "No response body");
    return;
  }

  try {
      // Fallback: List models if possible (requires specific permissions usually, trying direct generation often better test)
      // actually listModels is a method on the client usually? No, it's irrelevant, let's just test a few common ones.
      const models = ["gemini-pro", "gemini-1.5-pro", "gemini-1.0-pro"];
      for (const m of models) {
          try {
            const model = genAI.getGenerativeModel({ model: m });
            await model.generateContent("Hello");
            console.log(`${m} works!`);
          } catch(e) {
              console.log(`${m} failed.`);
          }
      }
  } catch (e) {
      console.log("Error listing: ", e);
  }
}

listModels();
