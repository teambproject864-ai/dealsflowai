import { NextResponse } from "next/server";
import { heygenClient } from "@/lib/heygen";
import { getInMemoryHeyGenVideos } from "@/lib/memory-storage";
import { checkRateLimit } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const storedVideo = getInMemoryHeyGenVideos().get(id);

    if (!storedVideo) {
      return NextResponse.json(
        { success: false, error: "Video not found" },
        { status: 404 }
      );
    }

    // Fetch the latest status from HeyGen
    const updatedVideo = await heygenClient.getVideoStatus(id);
    const mergedVideo = {
      ...storedVideo,
      ...updatedVideo,
      updatedAt: new Date().toISOString(),
    };
    getInMemoryHeyGenVideos().set(id, mergedVideo);

    return NextResponse.json({ success: true, data: mergedVideo });
  } catch (error) {
    console.error("[HeyGen Get Video] Error:", error);
    return NextResponse.json(
      { success: false, error: (error as any).message || "Failed to fetch video" },
      { status: 500 }
    );
  }
}

