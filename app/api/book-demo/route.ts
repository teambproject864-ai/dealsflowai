import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/firebase-admin";
import { getInMemoryLeads } from "@/lib/memory-storage";
import { sanitizeObject } from "@/lib/sanitize";
import { encryptLead } from "@/lib/security";

const inMemoryLeads = getInMemoryLeads();

export async function POST(req: Request) {
  try {
    const rawData = await req.json();
    const data = sanitizeObject(rawData);

    const { name, email, company, message } = data;
    if (!name || !email || !company) {
      return NextResponse.json(
        { success: false, error: "Name, email, and company name are required." },
        { status: 400 }
      );
    }

    const leadId = uuidv4();
    const leadRecord = {
      id: leadId,
      companyName: company,
      contactName: name,
      contactEmail: email,
      contactPhone: "",
      source: "book-demo-direct-form",
      message: message || "",
      createdAt: new Date().toISOString(),
      analysisId: "",
    };

    // Encrypt lead details if encryption helper is ready (we'll implement it shortly in BUG-06, but let's prepare it now)
    let leadToWrite = leadRecord;
    try {
      leadToWrite = encryptLead(leadRecord);
    } catch (e) {
      console.warn("[book-demo API] Encryption not yet ready or failed:", e);
    }

    if (db) {
      await db.collection("leads").doc(leadId).set(leadToWrite);
    }
    inMemoryLeads.set(leadId, leadRecord);

    return NextResponse.json({
      success: true,
      message: "Demo request successfully received.",
      leadId,
    });
  } catch (error) {
    console.error("Error in /api/book-demo:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process demo request." },
      { status: 500 }
    );
  }
}
