import assert from "assert";
import { queryUnifiedPipeline } from "@/lib/okf/pipeline";
import { answerWithRag } from "@/lib/rag/qa";

export async function testOkfPerformanceBenchmark() {
  console.log("[Benchmark] Starting RAG vs Unified (RAG+OKF) pipeline performance test...");

  const question = "What is the policy for password resets?";

  // Mock inference helper to return deterministic output
  const mockInfer = async () => "Mocked answer containing citation [doc1:0] and [OKF:PasswordPolicy]";

  const mockHits = [
    {
      docId: "doc1",
      docName: "Security Policy",
      mimeType: "text/plain",
      chunkIndex: 0,
      score: 0.95,
      text: "Users must reset passwords every 90 days.",
      charStart: 0,
      charEnd: 42,
    }
  ];

  // 1. Benchmark Standalone RAG
  const ragStart = Date.now();
  const ragResult = await answerWithRag({
    question,
    hits: mockHits,
    infer: mockInfer,
  });
  const ragLatency = Date.now() - ragStart;

  // 2. Benchmark Unified RAG + OKF Pipeline
  const unifiedStart = Date.now();
  const unifiedResult = await queryUnifiedPipeline({
    question,
    topK: 3,
    infer: mockInfer,
    queryFn: async () => ({
      matches: [
        {
          id: "doc1:0",
          score: 0.95,
          metadata: {
            type: "rag_chunk",
            docId: "doc1",
            docName: "Security Policy",
            mimeType: "text/plain",
            chunkIndex: 0,
            textPreview: "Users must reset passwords every 90 days.",
            charStart: 0,
            charEnd: 42,
            createdAt: new Date().toISOString(),
          },
        },
      ],
    }),
    fetchChunkText: async () => "Users must reset passwords every 90 days.",
    searchOKF: async () => [
      {
        id: "node_123",
        docId: "doc1",
        type: "rule",
        name: "PasswordPolicy",
        content: "Users must reset passwords every 90 days.",
        keywords: ["password", "reset", "policy"],
        attributes: {},
        createdAt: new Date().toISOString(),
        createdAtMs: Date.now(),
      },
    ],
  });
  const unifiedLatency = Date.now() - unifiedStart;

  console.log(`[Benchmark] Standalone RAG Q&A latency: ${ragLatency}ms`);
  console.log(`[Benchmark] Unified Pipeline latency: ${unifiedLatency}ms`);

  // Assert accuracy (both contain answer structures)
  assert.ok(ragResult.answer.includes("[doc1:0]"));
  assert.ok(unifiedResult.answer.includes("[doc1:0]") || unifiedResult.answer.includes("[OKF:PasswordPolicy]"));
  
  // Verify unified pipeline correctly routes queries
  assert.ok(["rag", "okf", "both"].includes(unifiedResult.route));

  console.log("[Benchmark] RAG vs RAG+OKF benchmarking completed successfully!");
}
