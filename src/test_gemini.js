
const { GoogleGenerativeAI } = require("@google/generative-ai");
// require('dotenv').config({ path: '.env.local' });

// Manually parse .env.local if dotenv fails (since it's .local)
const fs = require('fs');
const path = require('path');
try {
    const envPath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
    }
} catch (e) {
    console.log("Error reading .env.local", e);
}

async function listModels() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    console.log("Using API Key:", apiKey ? apiKey.substring(0, 10) + "..." : "UNDEFINED");

    if (!apiKey || apiKey.includes("PLACE_YOUR_API_KEY")) {
        console.error("ERROR: API Key is missing or default placeholder.");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // We can't list models directly via the SDK clean helper sometimes, 
        // so we try to just instantiate the model and run a dummy prompt.
        const modelName = "gemini-1.5-flash";
        console.log(`Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        console.log("Success! Response:", result.response.text());
    } catch (error) {
        console.error("Error with gemini-1.5-flash:", error.message);

        console.log("\nAttempting fallback to 'gemini-pro'...");
        try {
            const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result2 = await model2.generateContent("Hello");
            console.log("Success with gemini-pro! Response:", result2.response.text());
        } catch (error2) {
            console.error("Error with gemini-pro:", error2.message);
        }
    }
}

listModels();
