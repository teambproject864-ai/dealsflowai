import { NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { getInMemoryLeads } from "@/lib/memory-storage";
import { checkRateLimitByRoute } from "@/lib/rate-limiter";
import { sanitizeObject } from "@/lib/sanitize";
import { db } from "@/lib/firebase-admin";
import { encryptLead } from "@/lib/security";

// Simple schema for booking widget submissions (just the basics)
const simpleLeadSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactName: z.string().min(1, "Name is required"),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().optional(),
  source: z.string().optional(),
});

const inMemoryLeads = getInMemoryLeads();

export async function POST(req: Request) {
  // Check rate limit first
  const rateLimitCheck = await checkRateLimitByRoute(req, "leads/save");
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

    // Try to validate against simple schema first (for booking widget)
    let validatedData;
    const simpleResult = simpleLeadSchema.safeParse(sanitizedData);
    if (simpleResult.success) {
      validatedData = simpleResult.data;
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid lead data",
          details: simpleResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const leadId = uuidv4();
    const leadRecord = {
      ...validatedData,
      id: leadId,
      createdAt: new Date().toISOString(),
      analysisId: "",
    };

    const encryptedLead = encryptLead(leadRecord);

    // Save to Firestore
    if (db) {
      await db.collection("leads").doc(leadId).set(encryptedLead);
    }

    // Keep memory storage cache updated
    inMemoryLeads.set(leadId, leadRecord);

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
