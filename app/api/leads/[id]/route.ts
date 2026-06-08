import { NextResponse } from "next/server";
import { getInMemoryLeads } from "@/lib/memory-storage";

const inMemoryLeads = getInMemoryLeads();

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params;
    const lead = inMemoryLeads.get(leadId);

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      leadId,
      ...lead,
    });
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch lead" },
      { status: 500 }
    );
  }
}

