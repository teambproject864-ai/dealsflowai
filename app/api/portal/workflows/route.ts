import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { MicrosoftAgentFramework } from "@/lib/microsoft-agent-framework";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { user, errorResponse } = await requireAuth(req, ["admin", "agent"]);
  if (errorResponse) return errorResponse;

  try {
    const framework = MicrosoftAgentFramework.getInstance();
    const workflows = framework.getAllWorkflows();
    const performance = framework.getPerformanceMetrics();

    return NextResponse.json({
      success: true,
      workflows,
      performance,
    });
  } catch (error) {
    console.error("[workflows-api-get] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch workflows" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { user, errorResponse } = await requireAuth(req, ["admin", "agent"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { type, customerId, customerName, metadata } = body;

    if (!type || !customerId || !customerName) {
      return NextResponse.json(
        { success: false, error: "Missing type, customerId, or customerName" },
        { status: 400 }
      );
    }

    if (type !== "gtm-audit" && type !== "outreach-campaign") {
      return NextResponse.json(
        { success: false, error: "Invalid workflow type" },
        { status: 400 }
      );
    }

    const framework = MicrosoftAgentFramework.getInstance();
    const workflow = await framework.startWorkflow(
      type,
      customerId,
      customerName,
      metadata || {}
    );

    return NextResponse.json({
      success: true,
      workflow,
    });
  } catch (error) {
    console.error("[workflows-api-post] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to start workflow" },
      { status: 500 }
    );
  }
}
