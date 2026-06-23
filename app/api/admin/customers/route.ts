import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { demoCustomers } from "@/lib/portal-demo-data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { errorResponse } = await requireAuth(req, ["admin"]);
  if (errorResponse) return errorResponse;

  try {
    let customersList = [...demoCustomers];

    if (db) {
      const snapshot = await db.collection("customers").get();
      const firestoreCustomers: any[] = [];
      snapshot.forEach((doc) => {
        firestoreCustomers.push({ id: doc.id, ...doc.data() });
      });

      // Merge firestore with demo data
      firestoreCustomers.forEach((fc) => {
        const idx = customersList.findIndex((dc) => dc.id === fc.id);
        if (idx !== -1) {
          customersList[idx] = { ...customersList[idx], ...fc };
        } else {
          customersList.push(fc);
        }
      });
    }

    return NextResponse.json({
      success: true,
      customers: customersList,
    });
  } catch (error) {
    console.error("[admin-customers-get] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customers list" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { user, errorResponse } = await requireAuth(req, ["admin"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { customerId, businessModel, status, serviceConfigurations } = body;

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: "Customer ID is required" },
        { status: 400 }
      );
    }

    let customerToUpdate = demoCustomers.find((c) => c.id === customerId);
    if (!customerToUpdate && db) {
      const doc = await db.collection("customers").doc(customerId).get();
      if (doc.exists) {
        customerToUpdate = { id: doc.id, ...doc.data() } as any;
      }
    }

    if (!customerToUpdate) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    const updatedData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (businessModel) updatedData.businessModel = businessModel;
    if (status) updatedData.status = status;
    if (serviceConfigurations) updatedData.serviceConfigurations = serviceConfigurations;

    // 1. Update Firestore
    if (db) {
      await db.collection("customers").doc(customerId).set(updatedData, { merge: true });
      await db.collection("audit_logs").add({
        id: `audit-${Date.now()}`,
        actionType: "document_update",
        actionDetails: `Admin updated customer ${customerToUpdate.companyName || customerId} business model to ${businessModel}`,
        performedBy: user!.id,
        performedByRole: user!.role,
        targetId: customerId,
        targetType: "customer",
        createdAt: new Date().toISOString(),
      });
    }

    // 2. Update demo data in-memory
    const idx = demoCustomers.findIndex((c) => c.id === customerId);
    if (idx !== -1) {
      demoCustomers[idx] = {
        ...demoCustomers[idx],
        ...updatedData,
      };
    }

    return NextResponse.json({
      success: true,
      message: "Customer updated successfully",
      customer: demoCustomers.find((c) => c.id === customerId),
    });
  } catch (error) {
    console.error("[admin-customers-post] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update customer" },
      { status: 500 }
    );
  }
}
