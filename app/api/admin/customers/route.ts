import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import bcrypt from "bcrypt";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { errorResponse } = await requireAuth(req, ["admin", "agent"]);
  if (errorResponse) return errorResponse;

  try {
    let customers: any[] = [];

    if (db) {
      const snapshot = await db.collection("customers").orderBy("createdAt", "desc").get();
      snapshot.forEach((doc) => {
        customers.push({ id: doc.id, ...doc.data() });
      });
    }

    return NextResponse.json({
      success: true,
      customers,
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
    const { action, customerId, name, email, phone, companyName, industry, assignedAgentId, assignedAgentName, businessModel, serviceConfigurations, status } = body;

    if (!db) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 });
    }

    if (action === "onboard") {
      if (!name || !email || !companyName) {
        return NextResponse.json(
          { success: false, error: "Name, email, and company name are required" },
          { status: 400 }
        );
      }

      // Check if user already exists
      const userSnap = await db.collection("users").where("email", "==", email.toLowerCase()).get();
      if (!userSnap.empty) {
        return NextResponse.json({ success: false, error: "User with this email already exists" }, { status: 409 });
      }

      const newCustomerId = customerId || `customer-${Date.now()}`;
      const defaultPassword = `Customer@${companyName.replace(/[^a-zA-Z0-9]/g, "") || "Brand"}!2026`;
      const hashedPassword = bcrypt.hashSync(defaultPassword, 10);

      const customerUser = {
        id: newCustomerId,
        email: email.toLowerCase(),
        name,
        role: "customer",
        hashedPassword,
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      const customerRecord = {
        id: newCustomerId,
        name,
        email: email.toLowerCase(),
        phone: phone || "",
        companyName,
        industry: industry || "",
        status: status || "onboarding",
        assignedAgentId: assignedAgentId || "",
        assignedAgentName: assignedAgentName || "",
        businessModel: businessModel || "b2b",
        serviceConfigurations: serviceConfigurations || { gtmReports: true },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.collection("users").doc(newCustomerId).set(customerUser);
      await db.collection("customers").doc(newCustomerId).set(customerRecord);

      await db.collection("audit_logs").add({
        id: `audit-${Date.now()}`,
        actionType: "customer_onboard",
        actionDetails: `Admin onboarded new customer: ${name} (${companyName})`,
        performedBy: user!.id,
        performedByRole: user!.role,
        targetId: newCustomerId,
        targetType: "customer",
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: "Customer onboarded successfully",
        customer: customerRecord,
        defaultPassword,
      });
    }

    // Default update behavior
    if (!customerId) {
      return NextResponse.json(
        { success: false, error: "Customer ID is required" },
        { status: 400 }
      );
    }

    const doc = await db.collection("customers").doc(customerId).get();
    if (!doc.exists) {
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
    if (assignedAgentId) {
      updatedData.assignedAgentId = assignedAgentId;
      updatedData.assignedAgentName = assignedAgentName || "";
    }

    await db.collection("customers").doc(customerId).set(updatedData, { merge: true });

    await db.collection("audit_logs").add({
      id: `audit-${Date.now()}`,
      actionType: "document_update",
      actionDetails: `Admin updated customer ${customerId} parameters.`,
      performedBy: user!.id,
      performedByRole: user!.role,
      targetId: customerId,
      targetType: "customer",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Customer updated successfully",
      customer: { id: customerId, ...doc.data(), ...updatedData },
    });
  } catch (error) {
    console.error("[admin-customers-post] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update/onboard customer" },
      { status: 500 }
    );
  }
}
