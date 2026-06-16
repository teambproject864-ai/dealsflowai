
export type LLMProvider = "huggingface" | "nvidia";

export interface LLMModel {
  id: string;
  provider: LLMProvider;
  name: string;
  maxTokens: number;
  costPerInputToken: number;
  costPerOutputToken: number;
  averageLatencyMs: number;
  performanceScore: number; // 0-100
  contentPolicyAlignment: boolean;
  available: boolean;
}

export interface LLMAPIKey {
  id: string;
  provider: LLMProvider;
  keyHash: string; // Encrypted API key
  rateLimitRemaining: number;
  rateLimitReset: number;
  lastUsed: Date;
  status: "active" | "inactive" | "exhausted";
}

export interface LLMRequest {
  id: string;
  provider?: LLMProvider;
  model?: string;
  taskType: "chat" | "rag" | "summarization" | "analysis";
  systemPrompt?: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  userId: string;
  useCase: string;
}

export interface LLMResponse {
  id: string;
  requestId: string;
  provider: LLMProvider;
  model: string;
  output: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  timestamp: Date;
}

export interface LLMInteraction {
  id: string;
  request: LLMRequest;
  response: LLMResponse | null;
  error: string | null;
  timestamp: Date;
  latencyMs: number;
  cost: number;
  modelId: string;
  provider: LLMProvider;
  userId: string;
  useCase: string;
}

export interface OrchestrationModel {
  id: string;
  version: string;
  createdAt: Date;
  accuracy: number;
  performanceScore: number;
  deployed: boolean;
}

