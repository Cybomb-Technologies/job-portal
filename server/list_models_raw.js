const https = require('https');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.models) {
        console.log("Available Models:");
        json.models.forEach(model => {
             // Only show generateContent supported models
             if(model.supportedGenerationMethods && model.supportedGenerationMethods.includes("generateContent")) {
                 console.log(`- ${model.name}`); 
             }
        });
      } else {
        console.log("No models found or error:", json);
      }
    } catch (e) {
      console.error("Error parsing response:", e);
    }
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});
