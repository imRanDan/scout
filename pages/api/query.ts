import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prompt } = req.body;

  const systemPrompt = `
You're Scout, an intelligent local assistant for Toronto.

Primary job: Help users find cafés and venues based on natural language.

Bonus abilities:
- Suggest fun things to do in Toronto
- Recommend areas for coworking
- Offer venue picks for meetups, dates, or study sessions

Always return clean JSON in this format:
[
  {
    "name": "",
    "description": "",
    "location": "",
    "vibe": "",
    "hours": ""
  }
]
Don't return markdown or commentary. Just the JSON.
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
  console.error("❌ Failed to parse GPT:", reply); // 👀 inspect raw
  res.status(500).json({ error: "Failed to parse GPT response", raw: reply });
}

}
