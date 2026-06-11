import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getInMemoryLeads } from "@/lib/memory-storage";
import { intakeSchema } from "@/lib/types";
import { checkRateLimit } from "@/lib/rate-limiter";
import { sanitizeObject } from "@/lib/sanitize";

const inMemoryLeads = getInMemoryLeads();

export async function POST(req: Request) {
  // Check rate limit first
  const rateLimitCheck = await checkRateLimit(req);
  if (!rateLimitCheck.allowed) {
    const headers = new Headers();
    if (rateLimitCheck.msBeforeNext) {
      headers.set('Retry-After', Math.ceil(rateLimitCheck.msBeforeNext / 1000).toString());
    }
    return NextResponse.json(
      { success: false, error: "Too many requests, please try again later" },
      { status: 429, headers }
    );
  }

  try {
    const companyData = await req.json();
    // Sanitize all inputs first
    const sanitizedData = sanitizeObject(companyData);

    // Validate incoming data against our Zod schema
    const validationResult = intakeSchema.safeParse(sanitizedData);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid lead data",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const leadId = uuidv4();

    inMemoryLeads.set(leadId, {
      ...validationResult.data,
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
