import Anthropic from "@anthropic-ai/sdk";
import { SYS_NEWS } from "../../../lib/prompts";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req) {
  try {
    const { ticker } = await req.json();

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2500,
      system: SYS_NEWS,
      messages: [
        {
          role: "user",
          content: `ค้นหาข่าวล่าสุดของ ${ticker} ในช่วง 2 สัปดาห์ที่ผ่านมา แล้ววิเคราะห์ impact และ sentiment ตาม format ที่กำหนด`,
        },
      ],
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 5 }],
    });

    // Find the final text block (after tool use rounds)
    const text = msg.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    const clean = text.replace(/```json|```/g, "").trim();
    // Extract JSON object from the text in case there's preamble
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    return Response.json(JSON.parse(jsonMatch ? jsonMatch[0] : clean));
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
