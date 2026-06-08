import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getInMemoryLeads } from "@/lib/memory-storage";

const inMemoryLeads = getInMemoryLeads();

export async function POST(req: Request) {
  try {
    const companyData = await req.json();
    const leadId = uuidv4();

    inMemoryLeads.set(leadId, {
      ...companyData,
      id: leadId,
      createdAt: new Date().toISOString(),
      analysisId: "",
    });

    return NextResponse.json({
      success: true,
      leadId,
    });
  } catch (error) {
    console.error("Error saving lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save lead" },
      { status: 500 }
    );
  }
}
