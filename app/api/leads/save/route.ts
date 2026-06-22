import { NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { getInMemoryLeads } from "@/lib/memory-storage";
import { checkRateLimitByRoute } from "@/lib/rate-limiter";
import { sanitizeObject } from "@/lib/sanitize";
import { db } from "@/lib/firebase-admin";
import { encryptLead } from "@/lib/security";

// Schema for normalized lead data
const normalizedLeadSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactName: z.string().min(1, "Name is required"),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().optional(),
  source: z.string().optional(),
}).passthrough(); // Allow extra fields to be stored

const inMemoryLeads = getInMemoryLeads();

function normalizeLeadData(data: any) {
  // Normalize the data to the standard field names
  return {
    companyName: data.companyName || data.company,
    contactName: data.contactName || data.name,
    contactEmail: data.contactEmail || data.emailPersonal || data.email,
    contactPhone: data.contactPhone || data.phone || "",
    source: data.source || "unknown",
    ...data, // Keep all other fields
  };
}

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
    const normalizedData = normalizeLeadData(sanitizedData);

    // Validate the normalized data
    const validationResult = normalizedLeadSchema.safeParse(normalizedData);
    if (!validationResult.success) {
      // Get a human-readable error message
      const errorMessages = validationResult.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ');
      return NextResponse.json(
        {
          success: false,
          error: `Invalid lead data: ${errorMessages}`,
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;
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
