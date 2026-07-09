import { NextResponse } from "next/server";
import { z } from "zod";
import { AgenticFramework, chunkDocument } from "@/lib/multi-agent-rag";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// --- Request Schema ---
const querySchema = z.object({
  query: z.string().min(1),
  topK: z.number().int().min(1).max(20).default(5),
  useAgenticFramework: z.boolean().default(true),
  documentContent: z.string().optional(),
  documentType: z.enum(["text", "manual", "research", "other"]).default("text"),
});

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const body = querySchema.parse(raw);

    const conversationId = uuidv4();
    const framework = new AgenticFramework(conversationId);

    // Step 1: If we have a document to add, chunk it first
    if (body.documentContent) {
      const chunks = chunkDocument(body.documentContent, body.documentType);
      console.log(`[Multi-Agent RAG] Chunked document into ${chunks.length} chunks`);
    }

    // Create all tasks first!
    framework.createTask("Retrieval", { query: body.query, topK: body.topK }, "high");

    // Execute full pipeline step by step, passing data between tasks
    await framework.executePipeline();

    // Get retrieval output
    let context = framework.getContext();
    const retrievalTask = context.tasks.find(t => t.role === "Retrieval" && t.status === "completed");
    if (!retrievalTask?.output) throw new Error("Retrieval failed");
    const retrievalResults = retrievalTask.output.results;

    // Create synthesis task
    framework.createTask("ContextSynthesis", { results: retrievalResults }, "medium");
    await framework.executePipeline();
    context = framework.getContext();
    const synthesisTask = context.tasks.find(t => t.role === "ContextSynthesis" && t.status === "completed");
    if (!synthesisTask?.output) throw new Error("Synthesis failed");
    const synthesizedContext = synthesisTask.output.synthesizedContext;

    // Create generation task
    framework.createTask("ResponseGeneration", { query: body.query, synthesizedContext }, "medium");
    await framework.executePipeline();
    context = framework.getContext();
    const generationTask = context.tasks.find(t => t.role === "ResponseGeneration" && t.status === "completed");
    if (!generationTask?.output) throw new Error("Generation failed");
    const finalResponse = generationTask.output.response;

    // Create verification task
    framework.createTask("Verification", { response: finalResponse, results: retrievalResults }, "low");
    await framework.executePipeline();

    // Optionally add A.G.E.N.T.I.C. framework tasks
    if (body.useAgenticFramework) {
      framework.createTask("Audit", {}, "low");
      framework.createTask("Graph", {}, "low");
      framework.createTask("Equip", {}, "low");
      framework.createTask("Network", {}, "low");
      framework.createTask("Track", {}, "low");
      framework.createTask("Influence", {}, "low");
      framework.createTask("Convert", {}, "low");
      await framework.executePipeline();
    }

    const finalContext = framework.getContext();
    const metrics = framework.getMetrics();

    return NextResponse.json({
      success: true,
      conversationId,
      response: finalResponse,
      tasks: finalContext.tasks,
      metrics,
    });
  } catch (e: any) {
    const status = e?.name === "ZodError" ? 400 : 500;
    return NextResponse.json({ success: false, error: e?.message || "multi_agent_failed" }, { status });
  }
}
