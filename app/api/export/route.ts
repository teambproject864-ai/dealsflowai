import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { formatICPDocument } from "@/lib/icp-document-generator";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { v4 as uuidv4 } from "uuid";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // 1. Authenticate and verify role permissions
    const user = await getCurrentUser(req);
    
    // Allow 'admin' and 'agent', block 'customer' or null
    if (!user || (user.role !== "admin" && user.role !== "agent")) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Access Denied: You do not have permission to download GTM assets. ICP exports are restricted to GTM Analysts, RevOps, and Administrators." 
        }, 
        { status: 403 }
      );
    }

    const { format, documentData } = await req.json();

    if (!format || !documentData) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters: format and documentData are required." },
        { status: 400 }
      );
    }

    if (format === "markdown") {
      const markdown = formatICPDocument(documentData);
      
      return new NextResponse(markdown, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="icp_strategy_blueprint_${uuidv4().split("-")[0]}.md"`,
        },
      });
    } 
    
    if (format === "docx") {
      const tempDocxPath = path.join(os.tmpdir(), `tmp_${uuidv4()}.docx`);
      
      try {
        // Run Python compiler feeding JSON payload to standard input
        execSync(`python scripts/generate_icp_docx.py "${tempDocxPath}"`, {
          input: JSON.stringify(documentData),
          timeout: 15000,
          env: process.env,
        });

        if (!fs.existsSync(tempDocxPath)) {
          throw new Error("Python document generation script failed to write output file.");
        }

        const fileBuffer = fs.readFileSync(tempDocxPath);
        fs.unlinkSync(tempDocxPath); // Cleanup temp file

        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "Content-Disposition": `attachment; filename="icp_strategy_blueprint_${uuidv4().split("-")[0]}.docx"`,
          },
        });
      } catch (err: any) {
        console.error("DOCX Compilation error:", err);
        // Ensure cleanup if file exists
        if (fs.existsSync(tempDocxPath)) {
          fs.unlinkSync(tempDocxPath);
        }
        return NextResponse.json(
          { success: false, error: `DOCX generation failed: ${err.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: `Unsupported format: ${format}. Only 'docx' and 'markdown' are served by the backend.` },
      { status: 400 }
    );

  } catch (error: any) {
    console.error("Export endpoint error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error during document export." },
      { status: 500 }
    );
  }
}
