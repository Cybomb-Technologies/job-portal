const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
require('dotenv').config();

const modelsToTest = ["gemini-2.5-flash-lite", "gemini-2.5-pro", "gemini-flash-latest"];
const logFile = 'model_test_results.txt';

async function testModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  let logContent = "";

  for (const modelName of modelsToTest) {
    logContent += `Testing ${modelName}...\n`;
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello");
      logContent += `SUCCESS: ${modelName} is working.\n`;
    } catch (error) {
      logContent += `FAILED: ${modelName}. Error: ${error.message}\n`;
    }
    logContent += "--------------------------------------------------\n";
  }

  fs.writeFileSync(logFile, logContent);
  console.log("Done. Results written to " + logFile);
}

testModels();
