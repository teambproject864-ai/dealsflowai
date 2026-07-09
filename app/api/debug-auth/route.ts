import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// TEMPORARY DEBUG ENDPOINT — REMOVE AFTER FIXING LOGIN
export async function GET() {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  const bcrypt = require("bcrypt");
  
  let compareResult = null;
  if (hash) {
    try {
      compareResult = await bcrypt.compare("Pranee@1909", hash);
    } catch (e: any) {
      compareResult = `ERROR: ${e.message}`;
    }
  }

  return NextResponse.json({
    hashPresent: !!hash,
    hashPrefix: hash?.substring(0, 29) ?? "MISSING",
    hashLength: hash?.length ?? 0,
    compareResult,
    nodeEnv: process.env.NODE_ENV,
  });
}
