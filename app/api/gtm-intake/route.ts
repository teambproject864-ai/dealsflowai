import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/firebase-admin";
import { checkRateLimitSensitive } from "@/lib/rate-limiter-middleware";
import { sanitizeObject } from "@/lib/sanitize";
import { initializeIntegratedSystem, getOrchestrator, getMessageBus } from "@/lib/integrated-system";
import { A2AMessageBus, A2AMessageType } from "@/lib/a2a";

export const dynamic = "force-dynamic";

const gtmIntakeSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  websiteUrl: z.string().url("Valid website URL is required"),
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
  // Add intake form fields for Scrapling processing
  name: z.string().optional(),
  emailPersonal: z.string().optional(),
  caseStudies: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  trustFactors: z.string().optional(),
  socialPlatforms: z.array(z.string()).optional(),
  publishingFrequency: z.string().optional(),
  offerPromise: z.string().optional(),
  irresistibleHook: z.string().optional(),
  painPoint: z.string().optional(),
  riskReversal: z.array(z.string()).optional(),
  timeToStart: z.string().optional(),
  primaryCta: z.string().optional(),
  minimumAsset: z.array(z.string()).optional(),
  objectionsHandling: z.string().optional(),
  emailSequenceThemes: z.string().optional(),
  giftCard: z.string().optional(),
  icpDescription: z.string().optional(),
  targetIndustries: z.array(z.string()).optional(),
  targetCompanySizes: z.array(z.string()).optional(),
  targetGeographicRegionsText: z.string().optional(),
  decisionMakers: z.array(z.string()).optional(),
  buyingTriggers: z.array(z.string()).optional(),
  currentTools: z.array(z.string()).optional(),
  additionalNotes: z.string().optional(),
});

// Helper to delegate task to agent and wait for response
async function delegateTask(messageBus: A2AMessageBus, to: string, taskType: string, input: any): Promise<any> {
  const correlationId = crypto.randomUUID();
  const taskId = crypto.randomUUID();

  return new Promise((resolve, reject) => {
    const unsubscribe = messageBus.subscribe("gtm-intake-api", (message) => {
      if (
        message.correlationId === correlationId &&
        (message.type === A2AMessageType.TASK_RESULT || message.type === A2AMessageType.TASK_ERROR)
      ) {
        unsubscribe();
        if (message.type === A2AMessageType.TASK_RESULT) {
          resolve(message.payload.result);
        } else {
          reject(new Error(message.payload.error || "Task failed"));
        }
      }
    });

    messageBus
      .createAndSendMessage(
        "gtm-intake-api",
        to,
        A2AMessageType.TASK_DELEGATION,
        {
          taskId,
          taskType,
          input,
        },
        { correlationId, priority: "high" }
      )
      .catch((err) => {
        unsubscribe();
        reject(err);
      });
  });
}

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

    // Initialize integrated system
    const { messageBus, orchestrator } = initializeIntegratedSystem();

    // Delegate process_intake_form task to Vexa agent
    console.log(`[api-gtm-intake] Delegating task to Vexa agent for trackingId: ${trackingId}`);
    const vexaResult = await delegateTask(messageBus, "vexa-agent", "process_intake_form", {
      formData: validated,
      leadId: trackingId,
    });

    return NextResponse.json({
      success: true,
      trackingId,
      data: intakeRecord,
      gtmAnalysis: vexaResult.gtmAnalysis,
      playbook: vexaResult.playbook,
    }, { status: 200 });

  } catch (error) {
    console.error("[api-gtm-intake-post] Error processing GTM intake:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process GTM intake submission" },
      { status: 500 }
    );
  }
}
