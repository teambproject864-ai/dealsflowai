import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { errorResponse } = await requireAuth(req, ["admin"]);
  if (errorResponse) return errorResponse;

  try {
    const logs: any[] = [];
    if (db) {
      const snapshot = await db
        .collection("audit_logs")
        .orderBy("timestamp", "desc")
        .limit(50)
        .get();

      snapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() });
      });
    }
    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
