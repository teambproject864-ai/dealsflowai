import { NextRequest, NextResponse } from "next/server";
import { deleteAuthCookie, getCurrentUser, addAuditLog } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const ip = (req as any).ip || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  try {
    const user = await getCurrentUser();
    if (user) {
      console.log(`[Logout] User ${user.email} logged out`);
      // Add audit log for logout matching the login log format
      addAuditLog(
        user.email,
        user.role,
        true,
        "User logged out successfully",
        ip,
        userAgent
      );
    } else {
      console.log("[Logout] No active user session found, clearing auth cookies.");
    }
  } catch (error) {
    console.error("[Logout Error] Failed to retrieve user info during logout:", error);
  } finally {
    try {
      await deleteAuthCookie();
    } catch (cookieError) {
      console.error("[Logout Error] Failed to delete authentication cookie:", cookieError);
    }
  }

  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
