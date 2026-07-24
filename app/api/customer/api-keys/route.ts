import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  saveCustomerAPIKey,
  getCustomerAPIKeys,
  deleteCustomerAPIKey,
  updateCustomerAPIKey,
  validateAPIKeyFormat
} from "@/lib/customer-api-keys";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { user, errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const keys = await getCustomerAPIKeys(user!.id);
    return NextResponse.json({
      success: true,
      keys
    });
  } catch (err: any) {
    console.error("[customer/api-keys GET] failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch API keys" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { user, errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { provider, label, rawKey } = body;

    if (!provider || !rawKey) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: provider, rawKey" },
        { status: 400 }
      );
    }

    const formatCheck = validateAPIKeyFormat(provider, rawKey);
    if (!formatCheck.isValid) {
      return NextResponse.json(
        { success: false, error: formatCheck.error || "Invalid API key format" },
        { status: 400 }
      );
    }

    const keyRecord = await saveCustomerAPIKey({
      customerId: user!.id,
      provider,
      label: label || `${provider.toUpperCase()} Key`,
      rawKey
    });

    return NextResponse.json({
      success: true,
      message: "API Key validated and encrypted successfully",
      key: keyRecord
    });
  } catch (err: any) {
    console.error("[customer/api-keys POST] failed:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save API key" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const { user, errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const keyId = searchParams.get("keyId");

    if (!keyId) {
      return NextResponse.json(
        { success: false, error: "Missing keyId query parameter" },
        { status: 400 }
      );
    }

    await deleteCustomerAPIKey(user!.id, keyId);
    return NextResponse.json({
      success: true,
      message: "API key deleted successfully"
    });
  } catch (err: any) {
    console.error("[customer/api-keys DELETE] failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete API key" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const { user, errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { keyId, status, label } = body;

    if (!keyId) {
      return NextResponse.json(
        { success: false, error: "Missing keyId" },
        { status: 400 }
      );
    }

    const success = await updateCustomerAPIKey(user!.id, keyId, { status, label });
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Key not found or permission denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "API key updated successfully"
    });
  } catch (err: any) {
    console.error("[customer/api-keys PUT] failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update API key" },
      { status: 500 }
    );
  }
}
