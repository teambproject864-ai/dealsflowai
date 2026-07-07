import { NextResponse } from "next/server";
import { z } from "zod";
import { queryUnifiedPipeline } from "@/lib/okf/pipeline";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  question: z.string().min(1),
  topK: z.number().int().min(1).max(20).default(5),
  minScore: z.number().min(0).max(1).optional(),
  docIds: z.array(z.string().min(1)).optional(),
  provider: z.enum(["huggingface", "nvidia"]).optional(),
  model: z.string().min(1).optional(),
});

export async function POST(req: Request) {
  const { errorResponse, user } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const raw = await req.json();
    const body = bodySchema.parse(raw);

    const result = await queryUnifiedPipeline({
      question: body.question,
      topK: body.topK,
      minScore: body.minScore,
      docIds: body.docIds,
      provider: body.provider,
      model: body.model,
      userId: user?.id,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (e: any) {
    const status = e?.name === "ZodError" ? 400 : 500;
    return NextResponse.json({ success: false, error: e?.message || "ask_unified_failed" }, { status });
  }
}
