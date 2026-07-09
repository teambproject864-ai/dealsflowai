import { searchRag } from "@/lib/rag/search";
import { OKFSystem } from "./index";
import { classifyQuery } from "./router";
import { llmManager } from "@/lib/llm-manager";
import { hfInfer } from "@/lib/huggingface";
import type { OKFNode, UnifiedAnswer } from "./types";
import type { RagSearchHit } from "@/lib/rag/types";

function buildRagContext(hits: RagSearchHit[]): string {
  if (hits.length === 0) return "No semantic chunks retrieved.";
  return hits
    .map(
      (h, idx) =>
        `[RAG Hit ${idx + 1}] Document: ${h.docName} (docId=${h.docId}, chunk=${h.chunkIndex}, score=${h.score.toFixed(3)})\n${h.text}`
    )
    .join("\n\n---\n\n");
}

function buildOkfContext(nodes: OKFNode[]): string {
  if (nodes.length === 0) return "No structured facts or rules retrieved.";
  return nodes
    .map(
      (n, idx) =>
        `[OKF Fact ${idx + 1}] Type: ${n.type} | Name: ${n.name} (docId=${n.docId})\nContent: ${n.content}\nKeywords: ${(n.keywords || []).join(", ")}`
    )
    .join("\n\n---\n\n");
}

export async function queryUnifiedPipeline(args: {
  question: string;
  topK?: number;
  minScore?: number;
  docIds?: string[];
  provider?: "huggingface" | "nvidia";
  model?: string;
  userId?: string;
  infer?: typeof hfInfer; // For testing stubs
  queryFn?: any;
  fetchChunkText?: any;
  searchOKF?: typeof OKFSystem.searchOKF;
}): Promise<UnifiedAnswer> {
  const start = Date.now();

  const route = classifyQuery(args.question);
  const topK = args.topK || 5;

  let hits: RagSearchHit[] = [];
  let okfNodes: OKFNode[] = [];

  // Parallel retrieval depending on the routed option
  const retrievals: Promise<any>[] = [];

  if (route === "rag" || route === "both") {
    retrievals.push(
      searchRag({
        query: args.question,
        topK,
        minScore: args.minScore,
        docIds: args.docIds,
        queryFn: args.queryFn,
        fetchChunkText: args.fetchChunkText,
      }).then((res) => {
        hits = res;
      })
    );
  }

  if (route === "okf" || route === "both") {
    const searchOKFFn = args.searchOKF || OKFSystem.searchOKF;
    retrievals.push(
      searchOKFFn({
        query: args.question,
        limit: topK,
        docIds: args.docIds,
      }).then((res) => {
        okfNodes = res;
      })
    );
  }

  await Promise.all(retrievals);

  const systemPrompt = `You are a helpful assistant. Use ONLY the provided context to answer. If the context is insufficient, say you don't know. 
The context consists of raw semantic segments (RAG) and structured facts/rules/entities (OKF).
Cite your sources clearly:
- Use [docId:chunkIndex] for semantic RAG segments.
- Use [OKF:FactName] for structured OKF facts.`;

  const ragContext = buildRagContext(hits);
  const okfContext = buildOkfContext(okfNodes);

  const userPrompt = `Question:\n${args.question}\n\nStructured Facts & Rules (OKF Context):\n${okfContext}\n\nSemantic Chunks (RAG Context):\n${ragContext}\n\nAnswer with citations.`;

  let answerText = "";

  if (args.infer) {
    // Test environment fallback
    answerText = await args.infer(userPrompt, systemPrompt, { max_tokens: 800, temperature: 0.2 });
  } else {
    // Call LLM manager
    const response = await llmManager.executeRequest({
      id: `unified-${Date.now()}`,
      provider: args.provider,
      model: args.model,
      taskType: "rag", // categorized under RAG task type for billing/routing
      systemPrompt,
      userPrompt,
      maxTokens: 900,
      temperature: 0.2,
      topP: 0.95,
      userId: args.userId || "system",
      useCase: "unified_rag_okf_answering",
    });
    answerText = response.output;
  }

  const latencyMs = Date.now() - start;

  return {
    answer: answerText.trim(),
    sources: {
      ragSources: hits.map((h) => ({
        docId: h.docId,
        docName: h.docName,
        chunkIndex: h.chunkIndex,
        score: h.score,
      })),
      okfSources: okfNodes.map((n) => ({
        id: n.id,
        name: n.name,
        type: n.type,
      })),
    },
    route,
    latencyMs,
  };
}
