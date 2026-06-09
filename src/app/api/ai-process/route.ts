import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { requireAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await requireAdminSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Missing Gemini API Key' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const body = await request.json();
        const { text, imageBase64, imageType } = body;

        if (!text && !imageBase64) {
            return NextResponse.json({ error: 'Tidak ada teks atau gambar yang dikirim untuk diproses.' }, { status: 400 });
        }

        let prompt = `
            Extract Islamic lecture (Kajian) schedules from the following content.
            Return ONLY a valid JSON array of objects with the following structure:
        {
            "masjid": "string (name of mosque or 'Live Streaming' / 'Zoom' / 'Google Meet' if online)",
                "city": "string (city name in Indonesia, OR 'Online' if it is a virtual event)",
                    "address": "string (full address if available)",
                        "pemateri": "string (name of the speaker/ustadz)",
                            "tema": "string (topic/theme of the lecture)",
                                "waktu": "string (time, like 'Ba'da Maghrib' or '09:00 - 11:00')",
                                    "date": "string (human readable date, like 'Ahad, 25 Okt 2025')",
                                        "cp": "string (main contact person phone number)",
                                        "cp2": "string (second contact person phone number, optional)",
                                        "cp3": "string (third contact person phone number, optional)",
                                            "region": "INDONESIA",
                                                "gmapsUrl": "",
                                                "catatan": "string (additional notes, preserve line breaks as \n)"
        }
            If any field is unknown, use an empty string.
            IMPORTANT: If the event is ONLINE(e.g., mentions 'Live Streaming', 'Zoom', 'Youtube', 'Google Meet', 'IG Live'), set "city" to "Online" and "masjid" to the platform name or "Live Streaming".
            Do NOT include markdown formatting or any text other than the JSON array.
            Make sure "catatan" captures any additional announcements, rules, or details NOT covered by other fields.
            Extract all contact numbers found into cp, cp2, and cp3 respectively.
            Preserve original newlines with \n for "tema" and "catatan".
        `;

        let result;
        if (imageBase64) {
            // Process Image + Optional Text
            const contentParts: any[] = [prompt];
            if (text) contentParts.push(text);
            contentParts.push({
                inlineData: {
                    data: imageBase64,
                    mimeType: imageType || 'image/jpeg'
                }
            });
            result = await model.generateContent(contentParts);
        } else {
            // Process Text only
            result = await model.generateContent([prompt, text]);
        }

        const responseText = result.response.text();
        // Extract JSON if AI includes markdown backticks
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        const jsonStr = jsonMatch ? jsonMatch[0] : responseText;

        try {
            const data = JSON.parse(jsonStr);
            return NextResponse.json(data);
        } catch (e) {
            console.error('AI Response Parsing Error:', responseText);
            return NextResponse.json({ error: 'AI returned invalid JSON format', raw: responseText }, { status: 500 });
        }

    } catch (error: any) {
        console.error('AI Processing Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to process with AI' }, { status: 500 });
    }
}
