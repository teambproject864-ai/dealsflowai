import { hfInfer } from "@/lib/huggingface";
import { nvChatCompletion, nvChatCompletionStream } from "@/lib/nvidia";
import { llmManager } from "@/lib/llm-manager";
import type { RagAnswer, RagSearchHit } from "./types";

function buildContext(hits: RagSearchHit[]) {
  return hits
    .map((h, idx) => {
      const header = `Source ${idx + 1}: ${h.docName} (docId=${h.docId}, chunk=${h.chunkIndex}, score=${h.score.toFixed(3)})`;
      return `${header}\n${h.text}`;
    })
    .join("\n\n---\n\n");
}

function buildRagPrompt(question: string, hits: RagSearchHit[]) {
  const system =
    "You are a helpful assistant. Use ONLY the provided context to answer. If the context is insufficient, say you don't know. Include citations as [docId:chunkIndex] for each factual claim.";

  const context = buildContext(hits);
  const user = `Question:\n${question}\n\nContext:\n${context}\n\nAnswer with citations.`;
  return { system, user };
}

export async function answerWithRag(args: {
  question: string;
  hits: RagSearchHit[];
  infer?: typeof hfInfer;
  provider?: "huggingface" | "nvidia";
  model?: string;
  userId?: string;
}): Promise<RagAnswer> {
  const { system, user } = buildRagPrompt(args.question, args.hits);

  // If stubbed infer function is provided, use that instead of LLM manager (for testing)
  if (args.infer) {
    const answer = await args.infer(user, system, { max_tokens: 800, temperature: 0.2, top_p: 0.9 });
    return {
      answer: (answer || "").trim(),
      sources: args.hits.map((h) => ({
        docId: h.docId,
        docName: h.docName,
        chunkIndex: h.chunkIndex,
        score: h.score,
      })),
    };
  }

  // Otherwise, use LLM manager for intelligent routing
  const response = await llmManager.executeRequest({
    id: `rag-${Date.now()}`,
    provider: args.provider,
    model: args.model,
    taskType: "rag",
    systemPrompt: system,
    userPrompt: user,
    maxTokens: 900,
    temperature: 0.2,
    topP: 0.95,
    userId: args.userId || "system",
    useCase: "rag_question_answering",
  });

  return {
    answer: response.output.trim(),
    sources: args.hits.map((h) => ({
      docId: h.docId,
      docName: h.docName,
      chunkIndex: h.chunkIndex,
      score: h.score,
    })),
  };
}

export async function* answerWithRagStream(args: {
  question: string;
  hits: RagSearchHit[];
  infer?: typeof hfInfer;
  provider?: "huggingface" | "nvidia";
  model?: string;
  signal?: AbortSignal;
  userId?: string;
}): AsyncGenerator<string> {
  const { system, user } = buildRagPrompt(args.question, args.hits);

  // For streaming, fall back to direct calls (LLM manager streaming support coming soon!)
  const provider = args.provider || (process.env.RAG_LLM_PROVIDER as any) || "huggingface";
  const model = args.model || process.env.RAG_LLM_MODEL || "google/gemma-4-31b-it";

  if (provider === "nvidia") {
    yield* nvChatCompletionStream({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      maxTokens: 900,
      temperature: 0.2,
      topP: 0.95,
      signal: args.signal,
    });
    return;
  }

  const full = await (args.infer || hfInfer)(user, system, { max_tokens: 800, temperature: 0.2, top_p: 0.9 });
  if (typeof full === "string" && full.length) yield full;
}
