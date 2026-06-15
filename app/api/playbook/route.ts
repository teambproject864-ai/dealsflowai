import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const filePath = path.join(process.cwd(), "playbooks", "DealFlow-ICP-Playbook-FINAL.md");
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, error: "Playbook file not found" }, { status: 404 });
    }
    const content = fs.readFileSync(filePath, "utf8");
    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error("Error reading playbook:", error);
    return NextResponse.json(
      { success: false, error: "Failed to read playbook" },
      { status: 500 }
    );
  }
}
