import { NextResponse } from "next/server";
import { getInMemoryPageLocks } from "@/lib/memory-storage";
import { PageLockState } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { leadId, pageIndex, locked, lockedBy } = body;

    if (!leadId || typeof pageIndex !== "number") {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const pageLocksMap = getInMemoryPageLocks();
    let leadPageLocks = pageLocksMap.get(leadId) || [];

    if (locked) {
      const existingIndex = leadPageLocks.findIndex(l => l.pageIndex === pageIndex);
      const newLock: PageLockState = {
        id: uuidv4(),
        leadId,
        pageIndex,
        locked: true,
        lockedAt: new Date().toISOString(),
        lockedBy: lockedBy || "unknown",
      };
      if (existingIndex >= 0) {
        leadPageLocks[existingIndex] = newLock;
      } else {
        leadPageLocks.push(newLock);
      }
    } else {
      leadPageLocks = leadPageLocks.filter(l => l.pageIndex !== pageIndex);
    }

    pageLocksMap.set(leadId, leadPageLocks);

    return NextResponse.json({ success: true, pageLocks: leadPageLocks });
  } catch (error) {
    console.error("[page-locks POST] failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update page locks" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("leadId");

    if (!leadId) {
      return NextResponse.json(
        { success: false, error: "Missing leadId" },
        { status: 400 }
      );
    }

    const pageLocks = getInMemoryPageLocks().get(leadId) || [];
    return NextResponse.json({ success: true, pageLocks });
  } catch (error) {
    console.error("[page-locks GET] failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch page locks" },
      { status: 500 }
    );
  }
}