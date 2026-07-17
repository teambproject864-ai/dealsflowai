import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 });
    }

    // Parse query params for pagination, search, filter
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    let query = db.collection("gtm_intakes").orderBy("createdAt", "desc");

    // Get total count first
    const totalSnapshot = await query.get();
    let total = totalSnapshot.size;

    // Apply search/filters (client-side for now since Firestore doesn't support complex queries easily without indexes)
    let intakes: any[] = [];
    totalSnapshot.forEach((doc: any) => {
      const data = doc.data();
      let matches = true;

      if (search) {
        const searchLower = search.toLowerCase();
        matches = 
          data.companyName?.toLowerCase().includes(searchLower) ||
          data.productName?.toLowerCase().includes(searchLower) ||
          data.productOwnerName?.toLowerCase().includes(searchLower) ||
          data.productOwnerEmail?.toLowerCase().includes(searchLower) ||
          data.id?.toLowerCase().includes(searchLower);
      }

      if (matches) {
        intakes.push({ id: doc.id, ...data });
      }
    });

    total = intakes.length;

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedIntakes = intakes.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      intakes: paginatedIntakes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error) {
    console.error("[api-portal-gtm-intakes-get] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch GTM intakes" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "GTM intake ID is required" }, { status: 400 });
    }

    await db.collection("gtm_intakes").doc(id).set(
      { ...updates, updatedAt: new Date().toISOString() },
      { merge: true }
    );

    const updatedDoc = await db.collection("gtm_intakes").doc(id).get();

    return NextResponse.json({
      success: true,
      intake: { id: updatedDoc.id, ...updatedDoc.data() },
    }, { status: 200 });
  } catch (error) {
    console.error("[api-portal-gtm-intakes-put] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to update GTM intake" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "GTM intake ID is required" }, { status: 400 });
    }

    await db.collection("gtm_intakes").doc(id).delete();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[api-portal-gtm-intakes-delete] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete GTM intake" }, { status: 500 });
  }
}
