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

    // Step 1: Create and execute retrieval task
    const retrievalTask = framework.createTask("Retrieval", { query: body.query, topK: body.topK }, "high");

    // Step 2: If we have a document to add, chunk it first
    if (body.documentContent) {
      const chunks = chunkDocument(body.documentContent, body.documentType);
      console.log(`[Multi-Agent RAG] Chunked document into ${chunks.length} chunks`);
    }

    // Execute the pipeline and add synthesis, generation, verification tasks
    await framework.executePipeline();

    // Add remaining tasks now that retrieval is done
    const retrievalOutput = framework.getContext().tasks.find(t => t.id === retrievalTask.id)?.output;
    if (retrievalOutput) {
      framework.createTask("ContextSynthesis", { results: retrievalOutput.results }, "medium");
      framework.createTask("ResponseGeneration", { query: body.query, synthesizedContext: "" }, "medium");
      framework.createTask("Verification", { response: "", results: retrievalOutput.results }, "low");

      // Execute again for remaining tasks
      await framework.executePipeline();
    }

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

    // Find the response generation task's output
    const generationTask = finalContext.tasks.find(t => t.role === "ResponseGeneration" && t.status === "completed");

    return NextResponse.json({
      success: true,
      conversationId,
      response: generationTask?.output?.response || "No response generated",
      tasks: finalContext.tasks,
      metrics,
    });
  } catch (e: any) {
    const status = e?.name === "ZodError" ? 400 : 500;
    return NextResponse.json({ success: false, error: e?.message || "multi_agent_failed" }, { status });
  }
}
