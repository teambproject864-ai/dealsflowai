import { NextResponse } from "next/server";
import { getKimiClient } from "@/lib/instances";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { messages, model } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: "Messages array is required" },
        { status: 400 }
      );
    }

    const kimiClient = getKimiClient();
    const response = await kimiClient.chatCompletion({
      model: model || process.env.KIMI_MODEL || "moonshot-v1-8k",
      messages,
    });

    return NextResponse.json({ success: true, response });
  } catch (error) {
    console.error("Error in Kimi chat:", error);
    const message = error instanceof Error ? error.message : "Kimi chat failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
