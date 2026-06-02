import Anthropic from "@anthropic-ai/sdk";
import { SYS_STOCK } from "../../../lib/prompts";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req) {
  try {
    const { ticker, imageB64 } = await req.json();

    const content = [];
    if (imageB64) {
      content.push({
        type: "image",
        source: { type: "base64", media_type: "image/jpeg", data: imageB64 },
      });
    }
    content.push({
      type: "text",
      text: `วิเคราะห์หุ้น ${ticker} ให้ครบทุก section ตาม format ที่กำหนด`,
    });

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: SYS_STOCK,
      messages: [{ role: "user", content }],
    });

    const text = msg.content.map((b) => b.text || "").join("\n");
    const clean = text.replace(/```json|```/g, "").trim();
    return Response.json(JSON.parse(clean));
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
