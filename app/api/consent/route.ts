import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import admin from "@/lib/firebase-admin";
import { hashIp } from "@/lib/security";
import { checkRateLimitByRoute } from "@/lib/rate-limiter";

async function verifyToken(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) throw new Error("Missing auth token");
  return admin.auth().verifyIdToken(token);
}

/**
 * POST /api/consent
 * Records user consent (GDPR Art. 7 / CCPA).
 * Body: { consentVersion: string, purposes: string[] }
 *
 * GET /api/consent
 * Returns the current consent record for the authenticated user.
 */

export async function POST(req: Request) {
  const rateLimitCheck = await checkRateLimitByRoute(req, "consent");
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
    let uid: string;
    try {
      const decoded = await verifyToken(req);
      uid = decoded.uid;
    } catch {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const { consentVersion, purposes } = await req.json();
    if (!consentVersion || !Array.isArray(purposes)) {
      return NextResponse.json(
        { success: false, error: "consentVersion and purposes[] are required." },
        { status: 400 }
      );
    }

    const ipRaw = req.headers.get("x-forwarded-for") ?? "unknown";
    const consentRecord = {
      userId:          uid,
      consentVersion,
      purposes,
      consentedAt:     admin.firestore.FieldValue.serverTimestamp(),
      ipHash:          hashIp(ipRaw),
      userAgent:       req.headers.get("user-agent") ?? "unknown",
    };

    await db.collection("user_consent").doc(uid).set(consentRecord, { merge: true });

    // Audit
    await db.collection("audit_log").add({
      action:    "CONSENT_RECORDED",
      userId:    uid,
      consentVersion,
      purposes,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: "Consent recorded." });
  } catch (error: any) {
    console.error("[consent POST] Error:", error?.message ?? error);
    return NextResponse.json(
      { success: false, error: "Failed to record consent." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    let uid: string;
    try {
      const decoded = await verifyToken(req);
      uid = decoded.uid;
    } catch {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const snap = await db.collection("user_consent").doc(uid).get();
    if (!snap.exists) {
      return NextResponse.json({ success: true, consent: null });
    }

    const data = snap.data();
    return NextResponse.json({
      success: true,
      consent: {
        consentVersion: data?.consentVersion,
        purposes:       data?.purposes,
        consentedAt:    data?.consentedAt,
      },
    });
  } catch (error: any) {
    console.error("[consent GET] Error:", error?.message ?? error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve consent." },
      { status: 500 }
    );
  }
}
