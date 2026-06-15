import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { requireAuth } from "@/lib/auth";
import { getInMemoryLeads } from "@/lib/memory-storage";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { user, errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    let leadsList: any[] = [];

    // Query from Firestore if available
    if (db) {
      let query: any = db.collection("leads");
      
      // Filter by role
      if (user.role === "agent") {
        const agentKey = user.id.replace(/^agent-/, "");
        query = query.where("assignedAgentKey", "==", agentKey);
      } else if (user.role === "customer") {
        query = query.where("customerId", "==", user.id);
      }

      const snapshot = await query.get();
      snapshot.forEach((doc: any) => {
        leadsList.push({ id: doc.id, ...doc.data() });
      });
    } else {
      // Fallback to in-memory
      const inMemoryLeads = getInMemoryLeads();
      leadsList = Array.from(inMemoryLeads.entries()).map(([id, data]) => ({
        id,
        ...data,
      }));

      // Filter in-memory leads
      if (user.role === "agent") {
        const agentKey = user.id.replace(/^agent-/, "");
        leadsList = leadsList.filter((l) => l.assignedAgentKey === agentKey);
      } else if (user.role === "customer") {
        leadsList = leadsList.filter((l) => l.customerId === user.id);
      }
    }

    return NextResponse.json({
      success: true,
      leads: leadsList,
    });
  } catch (error) {
    console.error("Error fetching leads list:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leads list" },
      { status: 500 }
    );
  }
}
