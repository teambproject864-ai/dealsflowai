import { NextResponse } from "next/server";
import { deleteAuthCookie, getCurrentUser, addAuditLog } from "@/lib/auth";

export async function POST() {
  const user = await getCurrentUser();
  if (user) {
    console.log(`[Logout] User ${user.email} logged out`);
    // Add audit log for logout
    addAuditLog(
      user.email, 
      user.role, 
      true, 
      "User logged out successfully"
    );
  }
  await deleteAuthCookie();
  return NextResponse.json({ success: true });
}

export async function GET() {
  return POST();
}
