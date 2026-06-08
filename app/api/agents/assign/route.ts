import { NextResponse } from "next/server";
import { assignOptimalAgent } from "@/lib/revenue-agents";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const preferredKeys: string[] = Array.isArray(body.preferredKeys)
      ? body.preferredKeys
      : [];
    const challengeTags: string[] = Array.isArray(body.challengeTags)
      ? body.challengeTags
      : [];

    const assignment = await assignOptimalAgent(preferredKeys, challengeTags);
    return NextResponse.json({ success: true, ...assignment });
  } catch (error) {
    console.error("[agents/assign] failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to assign agent" },
      { status: 500 }
    );
  }
}
