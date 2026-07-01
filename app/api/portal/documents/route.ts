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

    let documents: any[] = [];
    if (db) {
      let queryRef: any = db.collection("documents");

      if (user.role === "customer") {
        queryRef = queryRef.where("customerId", "==", user.id);
      }

      const snap = await queryRef.orderBy("createdAt", "desc").get();
      snap.forEach((doc: any) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
    }

    return NextResponse.json({ success: true, documents }, { status: 200 });
  } catch (error) {
    console.error("[api-portal-documents-get] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { id, customerId, documentType, title, description, createdBy, accessRoles, name, type, size, version, updateNotes, isNew } = body;

    const docId = id || `doc-${Date.now()}`;
    const docData: any = {
      customerId: customerId || user.id,
      documentType: documentType || "other",
      title: title || name || "Untitled Document",
      description: description || updateNotes || "",
      createdBy: createdBy || user.id,
      accessRoles: accessRoles || ["admin", "agent", "customer"],
      name: name || title || "Untitled Document",
      type: type || "pdf",
      size: size || "0 KB",
      version: version || "1.0",
      updateNotes: updateNotes || "",
      isNew: isNew ?? true,
      updatedAt: new Date().toISOString(),
    };

    if (!id) {
      docData.id = docId;
      docData.createdAt = new Date().toISOString();
    }

    await db.collection("documents").doc(docId).set(docData, { merge: true });

    // Write audit log
    await db.collection("audit_logs").add({
      id: `audit-${Date.now()}`,
      actionType: id ? "document_update" : "document_upload",
      actionDetails: `${user.name} (${user.role}) ${id ? "updated" : "uploaded"} document: ${docData.title}`,
      performedBy: user.id,
      performedByRole: user.role,
      targetId: docId,
      targetType: "document",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, document: { id: docId, ...docData } }, { status: 200 });
  } catch (error) {
    console.error("[api-portal-documents-post] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to save document" }, { status: 500 });
  }
}
