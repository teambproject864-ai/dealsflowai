import { NextResponse } from "next/server";
import { heygenClient } from "@/lib/heygen";
import { getInMemoryHeyGenVideos } from "@/lib/memory-storage";
import { checkRateLimit } from "@/lib/rate-limiter";
import type { HeyGenVideo } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
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
    const { prompt, avatarId, templateId, title, userId } = await request.json();
    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    const videoId = await heygenClient.generateVideo(
      prompt,
      avatarId,
      templateId
    );
    const video: HeyGenVideo = {
      id: videoId,
      status: "pending",
      title,
      prompt,
      avatarId,
      templateId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId,
    };

    getInMemoryHeyGenVideos().set(videoId, video);
    return NextResponse.json({ success: true, data: video });
  } catch (error) {
    console.error("[HeyGen Create Video] Error:", error);
    return NextResponse.json(
      { success: false, error: (error as any).message || "Failed to create video" },
      { status: 500 }
    );
  }
}

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
    const videos = Array.from(getInMemoryHeyGenVideos().values());
    return NextResponse.json({ success: true, data: videos });
  } catch (error) {
    console.error("[HeyGen List Videos] Error:", error);
    return NextResponse.json(
      { success: false, error: (error as any).message || "Failed to fetch videos" },
      { status: 500 }
    );
  }
}
