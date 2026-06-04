// Vercel Serverless Function for Gemini AI
// Drop this file in an 'api' folder at the root of your project: api/chat.js

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { query } = req.body;

    if (!query) {
        return res.status(400).json({ error: 'Search query is required.' });
    }

    // Your Gemini API Key should be stored in Vercel's Environment Variables as GEMINI_API_KEY
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    // The System Prompt: This feeds Gemini all the context about you.
    // Feel free to add as much detail as you want here!
    const systemPrompt = `
        You are an AI assistant built into the portfolio of Khin Andrei Gamboa. 
        Keep your answers concise, friendly, and professional (max 2-3 sentences).
        Always speak in the third person about Khin.
        
        Information about Khin:
        - Role: Computer Engineering Student & Innovator.
        - School: Rizal Technological University (2022 - Present).
        - Skills: Java, Python, C++, HTML/CSS/JS, React, Node.js, MySQL, SQLite, Arduino, IoT.
        - Experience: IT Administrator, Technical Support (Hardware troubleshooting, networking, deployment, QA testing).
        - Top Projects: Restorant POS (Java), Xvidia (React Movie App), RFID Tollgate System (C++/IoT), AI Kilo Bot (Python/ML), Capstone 1 (IoT Research).
        - Contact: gamboa.khinandrei@gmail.com | +63 992 421 5230.
    `;

    try {
        // Fetch request to Gemini 1.5 Flash (Lightweight, fast, and free tier friendly)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: systemPrompt }]
                },
                contents: [
                    {
                        role: "user",
                        parts: [{ text: query }]
                    }
                ]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Gemini API Error:", data.error);
            return res.status(500).json({ error: 'Gemini API Error' });
        }

        // Extract the response text
        const answer = data.candidates[0].content.parts[0].text;

        return res.status(200).json({ answer });

    } catch (error) {
        console.error("Backend Error:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
