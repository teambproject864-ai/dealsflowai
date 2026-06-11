import { NextResponse } from "next/server";
import {
  getInMemoryCustomerCredentials,
  getInMemoryLeads,
} from "@/lib/memory-storage";
import { CustomerCredentials } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { leadId, email, password } = body;

    if (!leadId || !email) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (leadId, email)" },
        { status: 400 }
      );
    }

    const credentials: CustomerCredentials = {
      id: uuidv4(),
      leadId,
      email,
      // In a real app, we'd use bcrypt to hash this
      passwordHash: password ? `hashed_${password}` : undefined,
      createdAt: new Date().toISOString(),
      isVerified: false,
    };

    const credsMap = getInMemoryCustomerCredentials();
    credsMap.set(credentials.id, credentials);

    // Also update lead record
    const leadsMap = getInMemoryLeads();
    const lead = leadsMap.get(leadId);
    if (lead) {
      leadsMap.set(leadId, {
        ...lead,
        customerCredentialsId: credentials.id,
      });
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
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("leadId");
    const email = searchParams.get("email");

    const creds = Array.from(getInMemoryCustomerCredentials().values());
    let filteredCreds = creds;

    if (leadId) {
      filteredCreds = filteredCreds.filter(c => c.leadId === leadId);
    }
    if (email) {
      filteredCreds = filteredCreds.filter(c => c.email === email);
    }

    // Return without password hash
    const sanitized = filteredCreds.map(c => ({ ...c, passwordHash: undefined }));
    return NextResponse.json({ success: true, credentials: sanitized });
  } catch (error) {
    console.error("[customer-credentials GET] failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch credentials" },
      { status: 500 }
    );
  }
}