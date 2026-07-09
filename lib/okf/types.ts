export type OKFNodeType = "entity" | "fact" | "rule" | "workflow" | "concept";

export interface OKFNode {
  id: string;
  docId: string;
  type: OKFNodeType;
  name: string;
  content: string;
  keywords: string[];
  attributes: Record<string, string>;
  createdAt: string;
  createdAtMs: number;
}

export interface UnifiedAnswer {
  answer: string;
  sources: {
    ragSources: Array<{ docId: string; docName: string; chunkIndex: number; score: number }>;
    okfSources: Array<{ id: string; name: string; type: string }>;
  };
  route: "rag" | "okf" | "both";
  latencyMs: number;
}
