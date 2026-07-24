import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { seedFirestore } from "@/lib/db-init";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await seedFirestore();

    let feedback: any[] = [];
    if (db) {
      let queryRef: any = db.collection("feedback");

      if (user.role === "customer") {
        queryRef = queryRef.where("customerId", "==", user.id);
      } else if (user.role === "agent") {
        queryRef = queryRef.where("agentId", "==", user.id);
      }

      const snap = await queryRef.orderBy("createdAt", "desc").get();
      if (snap && snap.forEach) {
        snap.forEach((doc: any) => {
          feedback.push({ id: doc.id, ...doc.data() });
        });
      }

    }

    return NextResponse.json({ success: true, feedback }, { status: 200 });
  } catch (error) {
    console.error("[api-portal-feedback-get] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch feedback" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "customer") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { rating, comment, agentId, sessionId = "session-1" } = body;

    if (!rating || !agentId) {
      return NextResponse.json({ success: false, error: "Rating and Agent ID are required" }, { status: 400 });
    }

    const fbId = `fb-${Date.now()}`;
    const fbData = {
      id: fbId,
      sessionId,
      agentId,
      customerId: user.id,
      rating: Number(rating),
      comment: comment || "",
      createdAt: new Date().toISOString(),
    };

    await db.collection("feedback").doc(fbId).set(fbData);

    return NextResponse.json({ success: true, feedback: fbData }, { status: 200 });
  } catch (error) {
    console.error("[api-portal-feedback-post] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to save feedback" }, { status: 500 });
  }
}
