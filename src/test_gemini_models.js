
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
let apiKey = "";
try {
    const envPath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && key.trim() === 'NEXT_PUBLIC_GEMINI_API_KEY') {
                apiKey = value.trim();
            }
        });
    }
} catch (e) { }

async function testModels() {
    console.log("Using API Key:", apiKey ? apiKey.substring(0, 5) + "..." : "UNDEFINED");
    const genAI = new GoogleGenerativeAI(apiKey);

    const candidates = [
        "models/gemini-1.5-flash",
        "gemini-1.5-flash",
        "models/gemini-1.5-flash-latest",
        "gemini-1.5-flash-latest",
        "models/gemini-pro",
        "gemini-pro"
    ];

    for (const modelName of candidates) {
        console.log(`\nTesting: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            const response = await result.response;
            console.log(`✅ SUCCESS with ${modelName}:`, response.text().substring(0, 20));
            return; // Exit
        } catch (error) {
            console.log(`❌ FAILED ${modelName}:`, error.message.split(']')[1] || error.message);
        }
    }
}

testModels();
