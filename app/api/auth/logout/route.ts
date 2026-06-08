import { NextResponse } from "next/server";
import { deleteAuthCookie, getCurrentUser } from "@/lib/auth";

export async function POST() {
  const user = await getCurrentUser();
  if (user) {
    console.log(`[Logout] User ${user.email} logged out`);
  }
  await deleteAuthCookie();
  return NextResponse.json({ success: true });
}

export async function GET() {
  return POST();
}
