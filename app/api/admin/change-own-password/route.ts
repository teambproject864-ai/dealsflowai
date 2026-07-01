import { NextResponse } from "next/server";
import { requireAuth, verifyPassword, hashPassword, addAuditLog } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { validatePasswordStrength } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // 1. Authenticate as admin
  const { user: currentUser, errorResponse } = await requireAuth(req, ["admin"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    // 2. Validate password strength
    if (!validatePasswordStrength(newPassword)) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
        },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 503 }
      );
    }

    // 3. Find current admin user doc
    const adminDoc = await db.collection("users").doc(currentUser!.id).get();
    if (!adminDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Admin account not found in database" },
        { status: 404 }
      );
    }

    const adminData = adminDoc.data();
    if (!adminData) {
      return NextResponse.json(
        { success: false, error: "Invalid admin account data" },
        { status: 400 }
      );
    }

    // 4. Verify current password
    const isCurrentValid = await verifyPassword(currentPassword, adminData.hashedPassword);
    if (!isCurrentValid) {
      return NextResponse.json(
        { success: false, error: "Incorrect current password" },
        { status: 401 }
      );
    }

    // 5. Hash and update password
    const newHashed = await hashPassword(newPassword);
    await db.collection("users").doc(currentUser!.id).update({
      hashedPassword: newHashed,
      passwordUpdatedAt: new Date().toISOString(),
      failedLoginAttempts: 0,
      isLocked: false,
      lockedUntil: null,
      updatedAt: new Date().toISOString(),
    });

    // 6. Audit log
    const ip = (req as any).ip || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";
    addAuditLog(
      currentUser!.email,
      "admin",
      true,
      `Admin changed their own password successfully`,
      ip,
      userAgent
    );

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error: any) {
    console.error("[change-own-password error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to change password" },
      { status: 500 }
    );
  }
}
