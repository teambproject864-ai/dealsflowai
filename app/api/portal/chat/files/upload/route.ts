
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "image/gif",
  "text/plain",
];

// In-memory storage for file metadata (replace with DB in production)
const fileMetadata: Record<string, {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  sessionId: string;
  filePath: string;
}> = {};

export async function POST(req: Request) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const sessionId = formData.get("sessionId") as string;

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json({ success: false, error: "Session ID required" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File too large. Max size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 413 }
      );
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type) && file.type !== "") {
      return NextResponse.json(
        { success: false, error: "File type not allowed" },
        { status: 415 }
      );
    }

    // Create upload directory
    const uploadDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique file name
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fileExt = file.name.split(".").pop() || "bin";
    const uniqueFileName = `${fileId}.${fileExt}`;
    const filePath = join(uploadDir, uniqueFileName);

    // Write file to disk
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // Store metadata
    const metadata = {
      id: fileId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadedBy: user.id,
      uploadedAt: new Date().toISOString(),
      sessionId,
      filePath,
    };
    fileMetadata[fileId] = metadata;

    console.log("[PORTAL UPLOAD] File uploaded successfully:", metadata);

    return NextResponse.json({
      success: true,
      file: {
        id: fileId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        url: `/uploads/${uniqueFileName}`,
        uploadedAt: metadata.uploadedAt,
      },
    });
  } catch (error: any) {
    console.error("[PORTAL UPLOAD ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      // Return all files for the user's sessions (demo)
      return NextResponse.json({
        success: true,
        files: Object.values(fileMetadata),
      });
    }

    const metadata = fileMetadata[fileId];
    if (!metadata) {
      return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      file: metadata,
    });
  } catch (error: any) {
    console.error("[PORTAL FILES GET ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch files" },
      { status: 500 }
    );
  }
}
