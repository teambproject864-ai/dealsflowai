import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export interface CustomerDocument {
  id: string;
  name: string;
  type: "pdf" | "xlsx" | "json";
  size: string;
  version: string;
  updatedAt: string;
  updateNotes: string;
  isNew: boolean;
}

export const mockCustomerDocs: Record<string, CustomerDocument[]> = {
  "customer-demo": [
    {
      id: "doc-icp-1",
      name: "Enterprise Segment ICP Profile.pdf",
      type: "pdf",
      size: "2.8 MB",
      version: "1.1",
      updatedAt: "2026-06-28T14:30:00Z",
      updateNotes: "Updated target geographies and CRM tool parameters.",
      isNew: true,
    },
    {
      id: "doc-gtm-1",
      name: "Q2 2026 GTM Strategy Blueprint.xlsx",
      type: "xlsx",
      size: "1.4 MB",
      version: "1.0",
      updatedAt: "2026-06-15T09:00:00Z",
      updateNotes: "Initial GTM strategy mapping.",
      isNew: false,
    },
  ],
  "customer-praneeth": [
    {
      id: "doc-icp-2",
      name: "SMB Segment ICP Profile.pdf",
      type: "pdf",
      size: "2.5 MB",
      version: "1.0",
      updatedAt: "2026-06-25T10:00:00Z",
      updateNotes: "Initial publication.",
      isNew: false,
    },
  ],
};

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (user.role === "customer") {
      const docs = mockCustomerDocs[user.id] || [];
      return NextResponse.json({ success: true, documents: docs }, { status: 200 });
    }

    // Agents and admins can access any documents (e.g., via query param ?customerId=...)
    const { searchParams } = new URL(request.url);
    const targetCustomerId = searchParams.get("customerId");
    if (!targetCustomerId) {
      return NextResponse.json({ success: false, error: "Missing customerId" }, { status: 400 });
    }

    const docs = mockCustomerDocs[targetCustomerId] || [];
    return NextResponse.json({ success: true, documents: docs }, { status: 200 });
  } catch (error) {
    console.error("Error in documents API:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
