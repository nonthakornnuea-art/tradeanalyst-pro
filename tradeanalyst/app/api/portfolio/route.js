import Anthropic from "@anthropic-ai/sdk";
import { SYS_PORTFOLIO } from "../../../lib/prompts";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req) {
  try {
    const { imageB64 } = await req.json();

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: SYS_PORTFOLIO,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: "image/jpeg", data: imageB64 },
            },
            {
              type: "text",
              text: "อ่านรูปพอร์ตนี้และวิเคราะห์ครบทุก section ตาม format ที่กำหนด",
            },
          ],
        },
      ],
    });

    const text = msg.content.map((b) => b.text || "").join("\n");
    const clean = text.replace(/```json|```/g, "").trim();
    return Response.json(JSON.parse(clean));
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
