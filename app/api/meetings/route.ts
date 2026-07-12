
import { NextResponse } from "next/server";
import { UnifiedMeetingSystem } from "@/lib/unified-meeting-system";
import { getCurrentUser } from "@/lib/auth";
import type { Meeting } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/meetings - Get all meetings for the current user
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const system = UnifiedMeetingSystem.getInstance();
    const meetings = await system.getMeetingsForUser(user.id);

    return NextResponse.json({
      success: true,
      meetings,
    });
  } catch (error: any) {
    console.error("[Meetings API GET]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/meetings - Create a new meeting
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      startAt,
      endAt,
      participants,
      agenda,
      platform,
    } = body;

    if (!title || !startAt || !endAt) {
      return NextResponse.json(
        { success: false, error: "Title, startAt, endAt required" },
        { status: 400 }
      );
    }

    const system = UnifiedMeetingSystem.getInstance();
    const meeting = await system.createMeeting({
      title,
      description,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      participants: participants || [],
      agenda,
      platform,
      createdBy: user.id,
    });

    return NextResponse.json({
      success: true,
      meeting,
    });
  } catch (error: any) {
    console.error("[Meetings API POST]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
