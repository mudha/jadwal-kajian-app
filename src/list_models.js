const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Parse .env.local manually
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
} catch (e) {
    console.error("Failed to read .env.local:", e);
}

async function listAvailableModels() {
    if (!apiKey) {
        console.error("❌ API Key tidak ditemukan di .env.local");
        return;
    }

    console.log("🔑 API Key:", apiKey.substring(0, 10) + "...");
    console.log("\n📡 Menghubungi Google untuk mendapatkan list model...\n");

    // Call the REST API directly to list models
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const https = require('https');
        const response = await new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve(JSON.parse(data));
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                    }
                });
            }).on('error', reject);
        });

        if (!response.models || response.models.length === 0) {
            console.log("❌ Tidak ada model yang tersedia untuk API Key ini.");
            console.log("   Kemungkinan: API Key belum punya akses ke Gemini API.");
            return;
        }

        console.log(`✅ Ditemukan ${response.models.length} model yang tersedia:\n`);

        response.models.forEach((model, i) => {
            console.log(`${i + 1}. ${model.name}`);
            if (model.displayName) console.log(`   Display: ${model.displayName}`);
            if (model.description) console.log(`   Desc: ${model.description.substring(0, 60)}...`);
            console.log("");
        });

        // Find a suitable model for content generation
        const genModels = response.models.filter(m =>
            m.supportedGenerationMethods &&
            m.supportedGenerationMethods.includes('generateContent')
        );

        console.log("\n🎯 Model yang support generateContent:");
        genModels.forEach(m => console.log(`   - ${m.name}`));

        if (genModels.length > 0) {
            console.log(`\n💡 REKOMENDASI: Gunakan model "${genModels[0].name}" di kode Anda.`);
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

listAvailableModels();
