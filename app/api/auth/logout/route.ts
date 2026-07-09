import { NextRequest, NextResponse } from "next/server";
import { deleteAuthCookieFromResponse, getCurrentUser, addAuditLog } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const ip = (req as any).ip || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  try {
    const user = await getCurrentUser(req);
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
  }

  const response = NextResponse.json<{ success: boolean }>({ success: true });
  return deleteAuthCookieFromResponse(response);
}

export async function GET(req: NextRequest) {
  return POST(req);
}
