import { NextResponse } from "next/server";
import { heygenClient } from "@/lib/heygen";
import { checkRateLimit } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Check rate limit first
  const rateLimitCheck = await checkRateLimit(request);
  if (!rateLimitCheck.allowed) {
    const headers = new Headers();
    if (rateLimitCheck.msBeforeNext) {
      headers.set("Retry-After", Math.ceil(rateLimitCheck.msBeforeNext / 1000).toString());
    }
    return NextResponse.json(
      { success: false, error: "Too many requests, please try again later" },
      { status: 429, headers }
    );
  }

  try {
    const avatars = await heygenClient.listAvatars();
    return NextResponse.json({
      success: true,
      data: avatars,
    });
  } catch (error) {
    console.error("[HeyGen Avatars] Error:", error);
    return NextResponse.json(
      { success: false, error: (error as any).message || "Failed to fetch avatars" },
      { status: 500 }
    );
  }
}
