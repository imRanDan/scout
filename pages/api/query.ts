import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prompt } = req.body;

const systemPrompt = `
You are Scout, a hyper-local AI assistant that helps users find cafés, bars, restaurants, and venues in **Toronto** based on natural language requests.

Rules:
- Tailor responses based on the **area** or **intersection** the user mentions (e.g. "Yonge and College", "Kensington", etc).
- Return places that are within **reasonable reach** via **walking, BikeShare, TTC, or short Uber ride** (ideally under 15 minutes).
- Prioritize places that are **open now or opening soon**.
- Do NOT include venues that are permanently or temporarily closed.
- If unsure about a venue’s status, skip it.
- Always return exactly **3 unique** recommendations.
- Each recommendation must include:
  - name,
  - description (1–2 sentences),
  - location (neighborhood or intersection),
  - vibe (short tags),
  - hours (e.g. "Open until 11pm").
- Avoid repeating previous suggestions if user asks for more.
- Return ONLY a raw JSON array. No text, no markdown.

Example response:
[
  {
    "name": "Bar Vibe",
    "description": "Cozy bar with dim lighting and a laid-back vibe, great for solo drinks or dates.",
    "location": "Queen St W & Dufferin",
    "vibe": "chill, dimly-lit, solo-friendly",
    "hours": "Open until 2am"
  },
  ...
]
`;



  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4-1106-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    }),
  });

  const json = await openaiRes.json();
  const reply = json.choices?.[0]?.message?.content || "[]";

  try {
  const spots = JSON.parse(reply);
  console.log("✅ GPT returned:", spots); // 🔍 confirm what GPT gives you
  res.status(200).json({ spots });
} catch (err) {
  console.error("❌ Failed to parse GPT:", err); // 👀 inspect raw
  res.status(500).json({ error: "Failed to parse GPT response", raw: reply });
}

}
