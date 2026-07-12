import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/firebase-admin";
import { checkRateLimitSensitive } from "@/lib/rate-limiter-middleware";
import { sanitizeObject } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

const gtmIntakeSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  productOwnerName: z.string().min(1, "Product owner name is required"),
  productOwnerEmail: z.string().email("Valid owner email is required"),
  targetLaunchDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Valid target launch date is required",
  }),
  targetMarketRegion: z.string().min(1, "Target market region is required"),
  primaryUseCase: z.string().min(1, "Primary product use case is required"),
  marketingBudgetAllocation: z.coerce.number().min(0, "Marketing budget allocation must be a non-negative number"),
  stakeholders: z.array(z.string()).min(1, "At least one cross-functional stakeholder is required"),
  complianceDocuments: z.array(z.string()).min(1, "At least one compliance document is required"),
});

export async function POST(req: Request) {
  // Check rate limit first
  const rateLimitResponse = await checkRateLimitSensitive(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const rawBody = await req.json();
    const sanitized = sanitizeObject(rawBody);

    // Preprocess fields that might be passed as strings
    const stakeholders = typeof sanitized.stakeholders === "string"
      ? sanitized.stakeholders.split(",").map((s: string) => s.trim()).filter(Boolean)
      : (Array.isArray(sanitized.stakeholders) ? sanitized.stakeholders : []);

    const complianceDocuments = typeof sanitized.complianceDocuments === "string"
      ? sanitized.complianceDocuments.split(",").map((d: string) => d.trim()).filter(Boolean)
      : (Array.isArray(sanitized.complianceDocuments) ? sanitized.complianceDocuments : []);

    const payload = {
      ...sanitized,
      stakeholders,
      complianceDocuments,
    };

    const validation = gtmIntakeSchema.safeParse(payload);
    if (!validation.success) {
      const errorDetails = validation.error.flatten().fieldErrors;
      const errorMessages = validation.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");

      return NextResponse.json(
        {
          success: false,
          error: `Validation failed: ${errorMessages}`,
          details: errorDetails,
        },
        { status: 400 }
      );
    }

    const validated = validation.data;
    
    // Generate a unique tracking ID
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const trackingId = `GTM-${randomSuffix}`;

    const intakeRecord = {
      id: trackingId,
      ...validated,
      createdAt: new Date().toISOString(),
    };

    // Save to Firestore if available
    if (db) {
      await db.collection("gtm_intakes").doc(trackingId).set(intakeRecord);
    }

    return NextResponse.json({
      success: true,
      trackingId,
      data: intakeRecord,
    }, { status: 200 });

  } catch (error) {
    console.error("[api-gtm-intake-post] Error saving GTM intake:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process GTM intake submission" },
      { status: 500 }
    );
  }
}
