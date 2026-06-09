const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config({ path: '.env.local' });
// using native fetch since Node >= 18

// Replace with your Bot Token from BotFather
const token = process.env.TELEGRAM_BOT_TOKEN;
// Replace with your deployed/local webhook URL
const WEBHOOK_URL = process.env.WEBHOOK_URL;

if (!token) {
    console.error('Error: TELEGRAM_BOT_TOKEN environment variable not set.');
    process.exit(1);
}

if (!WEBHOOK_URL) {
    console.error('Error: WEBHOOK_URL environment variable not set.');
    process.exit(1);
}

if (!process.env.GEMINI_API_KEY) {
    console.error('⚠️ Warning: GEMINI_API_KEY is not found in .env.local!');
} else {
    console.log('✅ Found GEMINI_API_KEY in .env.local');
}

const bot = new TelegramBot(token, { polling: true });

console.log('🤖 Telegram Bot is running... waiting for forward messages or channel posts.');

// Listen for messages forwarded to the bot, or messages in channels the bot is added to as an admin.
bot.on('message', async (msg) => {
    // We only care about text or caption messages
    const text = msg.text || msg.caption;

    // Ignore empty messages or commands
    if (!text || text.startsWith('/')) return;

    // Optional: Only process messages forwarded from specific channels or from you
    // You can filter by msg.chat.id or msg.forward_from_chat

    const sourceName = msg.forward_from_chat?.title || msg.chat?.title || msg.chat?.username || 'Direct Message';
    const messageId = msg.message_id.toString();

    console.log(`[RCV] Message from ${sourceName} (${text.substring(0, 30)}...)`);

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-gemini-key': process.env.GEMINI_API_KEY || ''
            },
            body: JSON.stringify({
                message_id: messageId,
                text: text,
                source_name: sourceName
            })
        });

        if (response.ok) {
            console.log(`[✔] Sent to webhook successfully.`);
        } else {
            const errorData = await response.text();
            console.error(`[✘] Failed to send to webhook: ${response.status} - ${errorData}`);
        }
    } catch (error) {
        console.error(`[!] Error sending to webhook: ${error.message}`);
    }
});
