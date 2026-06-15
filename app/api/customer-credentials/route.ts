import { NextResponse } from "next/server";
import {
  getInMemoryCustomerCredentials,
  getInMemoryLeads,
} from "@/lib/memory-storage";
import { CustomerCredentials } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/firebase-admin";
import { checkRateLimit } from "@/lib/rate-limiter";
import * as admin from "firebase-admin";
import { requireAuth, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

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
    const body = await req.json();
    const { leadId, email, password } = body;

    if (!leadId || !email) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (leadId, email)" },
        { status: 400 }
      );
    }

    // Hash the password with bcrypt for password persistence
    let hashedPassword = "";
    if (password) {
      hashedPassword = await hashPassword(password);
    }

    const credentials: CustomerCredentials = {
      id: uuidv4(),
      leadId,
      email,
      passwordHash: hashedPassword,
      createdAt: new Date().toISOString(),
      isVerified: true,
    };

    const credsMap = getInMemoryCustomerCredentials();
    credsMap.set(credentials.id, credentials);

    // Save to Firestore
    if (db) {
      await db.collection("customer_credentials").doc(credentials.id).set(credentials);
    }

    // Also update lead record in Firestore and cache, and create user account
    const leadsMap = getInMemoryLeads();
    let lead = leadsMap.get(leadId);
    if (!lead && db) {
      const doc = await db.collection("leads").doc(leadId).get();
      if (doc.exists) {
        lead = doc.data();
      }
    }

    const customerId = `customer-${Date.now()}`;
    const newUser = {
      id: customerId,
      email,
      hashedPassword,
      name: lead?.name || "Customer",
      role: "customer" as const,
      createdAt: new Date().toISOString(),
    };

    if (db) {
      await db.collection("users").doc(customerId).set(newUser);
    }

    if (lead) {
      const updatedLead = {
        ...lead,
        customerId,
        customerCredentialsId: credentials.id,
      };
      leadsMap.set(leadId, updatedLead);
      if (db) {
        await db.collection("leads").doc(leadId).set(updatedLead);
      }
    }

    return NextResponse.json({
      success: true,
      credentials: { ...credentials, passwordHash: undefined },
    });
  } catch (error) {
    console.error("[customer-credentials POST] failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create credentials" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  // ── Authentication ─────────────────────────────────────────
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("leadId");
    const email = searchParams.get("email");

    let creds: CustomerCredentials[] = [];

    // Retrieve from Firestore if available
    if (db) {
      let query: any = db.collection("customer_credentials");
      if (leadId) {
        query = query.where("leadId", "==", leadId);
      }
      if (email) {
        query = query.where("email", "==", email);
      }
      const snap = await query.get();
      snap.forEach((doc: any) => {
        creds.push(doc.data() as CustomerCredentials);
      });
    } else {
      creds = Array.from(getInMemoryCustomerCredentials().values());
      if (leadId) {
        creds = creds.filter(c => c.leadId === leadId);
      }
      if (email) {
        creds = creds.filter(c => c.email === email);
      }
    }

    // Return without password hash
    const sanitized = creds.map(c => ({ ...c, passwordHash: undefined }));
    return NextResponse.json({ success: true, credentials: sanitized });
  } catch (error) {
    console.error("[customer-credentials GET] failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch credentials" },
      { status: 500 }
    );
  }
}