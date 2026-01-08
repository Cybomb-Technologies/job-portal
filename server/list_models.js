const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // For listing models, we might need to rely on documentation or try-catch on standard ones
    // The SDK might not have a direct 'listModels' helper easily accessible on the instance 
    // without using the ModelManager or similar, but let's try a direct approach or just test specific ones.
    
    // Actually, checking the SDK docs, there isn't a simple "listModels" on the client object in early versions.
    // However, we can try to instantiate 'gemini-1.5-flash' and 'gemini-pro' and see if they throw 'not found' immediately?
    // No, they usually throw on generation.
    
    // Let's try to deduce from the error message we got earlier.
    // "models/gemini-1.5-flash is not found for API version v1beta"
    
    // Let's test a few known models by making a dummy generation call.
    const modelsToTest = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
    
    console.log("Testing available models...");
    
    for (const modelName of modelsToTest) {
        console.log(`\nTesting: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello?");
            console.log(`✅ ${modelName} is AVAILABLE. Response: ${result.response.text().slice(0, 20)}...`);
        } catch (error) {
            console.log(`❌ ${modelName} call failed.`);
            console.log(`   Error: ${error.message.split('\n')[0]}`); // Print first line of error
        }
    }
    
  } catch (error) {
    console.error("Fatal error:", error);
  }
}

listModels();
