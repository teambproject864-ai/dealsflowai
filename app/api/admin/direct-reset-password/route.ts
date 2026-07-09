import { NextResponse } from "next/server";
import { requireAuth, hashPassword, addAuditLog } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { validatePasswordStrength } from "@/lib/security";
import { sendEmail } from "@/lib/notifications";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // 1. Authenticate as admin
  const { user: currentUser, errorResponse } = await requireAuth(req, ["admin"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { targetEmail, targetRole, newPassword } = body;

    if (!targetEmail || !targetRole || !newPassword) {
      return NextResponse.json(
        { success: false, error: "targetEmail, targetRole, and newPassword are required" },
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

    // 3. Find if user exists in Firestore users collection
    const userQuery = await db
      .collection("users")
      .where("email", "==", targetEmail.toLowerCase())
      .where("role", "==", targetRole)
      .get();

    let targetUserId = "";
    const newHashed = await hashPassword(newPassword);

    if (!userQuery.empty) {
      const userDoc = userQuery.docs[0];
      targetUserId = userDoc.id;
      // Update target user's password and reset lockout counters
      await db.collection("users").doc(targetUserId).update({
        hashedPassword: newHashed,
        passwordUpdatedAt: new Date().toISOString(),
        failedLoginAttempts: 0,
        isLocked: false,
        lockedUntil: null,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Create a brand new user record in Firestore (e.g. legacy demo fallback user)
      targetUserId = `${targetRole}-${Date.now()}`;
      const targetName = targetRole === "admin" ? "Administrator" : targetRole === "agent" ? "Agent" : "Customer";
      
      await db.collection("users").doc(targetUserId).set({
        id: targetUserId,
        email: targetEmail.toLowerCase(),
        hashedPassword: newHashed,
        name: targetName,
        role: targetRole,
        passwordUpdatedAt: new Date().toISOString(),
        failedLoginAttempts: 0,
        isLocked: false,
        lockedUntil: null,
        createdAt: new Date().toISOString(),
      });
    }

    // 4. Send email notification
    const emailSubject = "DealFlow.AI Account Password Update";
    const emailBody = `
      <h3>Hello from DealFlow.AI,</h3>
      <p>An administrator has directly reset your account password.</p>
      <p>Please use the following temporary credentials to log in:</p>
      <p><strong>Email:</strong> ${targetEmail}</p>
      <p><strong>Temporary Password:</strong> <code>${newPassword}</code></p>
      <p>For security, please change your password immediately after logging in.</p>
      <p>Regards,<br/>DealFlow.AI Support Team</p>
    `;

    try {
      await sendEmail({
        to: targetEmail,
        subject: emailSubject,
        body: emailBody,
      });
      logger.info(`[NOTIFICATIONS] Sent password reset notification email to ${targetEmail}`);
    } catch (emailErr: any) {
      // Log email failure and fall back silently (so the API request doesn't throw)
      logger.warn(`[NOTIFICATIONS] Email notification could not be delivered to ${targetEmail}: ${emailErr.message}. Simulated credentials: ${newPassword}`);
    }

    // 5. Log audit trail
    const ip = (req as any).ip || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";
    addAuditLog(
      currentUser!.email,
      "admin",
      true,
      `Direct password reset performed by Admin for user ${targetEmail} (Role: ${targetRole}, Target ID: ${targetUserId})`,
      ip,
      userAgent
    );

    return NextResponse.json({
      success: true,
      message: `Password has been successfully updated for ${targetEmail}.`,
    });
  } catch (error: any) {
    console.error("[direct-reset-password error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reset password" },
      { status: 500 }
    );
  }
}
