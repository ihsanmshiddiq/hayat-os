import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

/**
 * POST /api/tts
 * Body: { text: string, voice?: string, speed?: number }
 * Returns: audio/wav buffer
 *
 * Used by the Asma'ul Husna "Listen" button to pronounce each divine name's
 * transliteration (e.g. "Ar-Rahman, The Most Compassionate").
 * TTS skill limits: 1024 chars max, speed 0.5-2.0.
 */
export async function POST(req: NextRequest) {
  try {
    const { text, voice = "tongtong", speed = 0.9 } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const trimmed = text.trim();
    if (trimmed.length === 0) {
      return NextResponse.json({ error: "Text cannot be empty" }, { status: 400 });
    }
    if (trimmed.length > 1024) {
      return NextResponse.json({ error: "Text exceeds 1024 chars" }, { status: 413 });
    }

    const zai = await ZAI.create();
    const response = await zai.audio.tts.create({
      input: trimmed,
      voice,
      speed,
      response_format: "wav",
      stream: false,
    });

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (error) {
    console.error("TTS API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "TTS generation failed" },
      { status: 500 }
    );
  }
}
