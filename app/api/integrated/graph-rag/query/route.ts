import { NextRequest, NextResponse } from "next/server";
import { getGraphRAG, initializeIntegratedSystem } from "@/lib/integrated-system";

export async function POST(request: NextRequest) {
  try {
    initializeIntegratedSystem();
    const graphRAG = getGraphRAG();
    const body = await request.json();
    
    const result = await graphRAG.query({
      text: body.query,
      includeVectorSearch: body.includeVectorSearch !== false,
      includeGraphTraversal: body.includeGraphTraversal !== false,
      limit: body.limit || 20,
    });
    
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
