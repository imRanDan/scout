import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prompt } = req.body;

  const systemPrompt = `
You are Scout, an AI agent that helps users find cafés and venues in Toronto based on natural language requests.

- Always return exactly 3 recommendations.
- Each must have: name, description, location, vibe, and hours.
- If the user is asking for more, AVOID repeating previous suggestions.
- Return ONLY raw JSON array. No text, no markdown.

Respond like:
[
  {
    "name": "Café X",
    "description": "...",
    "location": "...",
    "vibe": "...",
    "hours": "..."
  }
]
`;

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
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
