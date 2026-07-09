
import type { LLMModel } from "./types";

export const modelCatalog: LLMModel[] = [
  // Hugging Face models
  {
    id: "hf-gemma-4-31b-it",
    provider: "huggingface",
    name: "google/gemma-4-31b-it",
    maxTokens: 131072,
    costPerInputToken: 0.000001,
    costPerOutputToken: 0.000002,
    averageLatencyMs: 1200,
    performanceScore: 92,
    contentPolicyAlignment: true,
    available: true,
  },
  {
    id: "hf-llama-3-70b-it",
    provider: "huggingface",
    name: "meta-llama/Llama-3.1-70B-Instruct",
    maxTokens: 131072,
    costPerInputToken: 0.000002,
    costPerOutputToken: 0.000004,
    averageLatencyMs: 1800,
    performanceScore: 95,
    contentPolicyAlignment: true,
    available: true,
  },

  // NVIDIA models
  {
    id: "nvidia-llama-3-70b-it",
    provider: "nvidia",
    name: "meta-llama/Llama-3.1-70B-Instruct",
    maxTokens: 131072,
    costPerInputToken: 0.0000015,
    costPerOutputToken: 0.000003,
    averageLatencyMs: 1400,
    performanceScore: 94,
    contentPolicyAlignment: true,
    available: true,
  },
  {
    id: "nvidia-mixtral-8x7b",
    provider: "nvidia",
    name: "mistralai/mixtral-8x7b-instruct-v0.3",
    maxTokens: 32768,
    costPerInputToken: 0.0000005,
    costPerOutputToken: 0.000001,
    averageLatencyMs: 900,
    performanceScore: 88,
    contentPolicyAlignment: true,
    available: true,
  },
];

export function getModelById(id: string): LLMModel | undefined {
  return modelCatalog.find((model) => model.id === id || model.name === id);
}

export function getModelsByProvider(provider: "huggingface" | "nvidia"): LLMModel[] {
  return modelCatalog.filter((model) => model.provider === provider && model.available);
}

export function selectModelForTask(
  taskType: "chat" | "rag" | "summarization" | "analysis",
  constraints?: {
    maxLatencyMs?: number;
    maxCostPerThousandTokens?: number;
    minPerformanceScore?: number;
  }
): LLMModel {
  let availableModels = modelCatalog.filter((model) => model.available);

  // Apply constraints
  if (constraints?.maxLatencyMs) {
    availableModels = availableModels.filter(
      (model) => model.averageLatencyMs <= constraints.maxLatencyMs!
    );
  }
  if (constraints?.minPerformanceScore) {
    availableModels = availableModels.filter(
      (model) => model.performanceScore >= constraints.minPerformanceScore!
    );
  }

  // Sort by performance/cost ratio
  availableModels.sort((a, b) => {
    const ratioA = a.performanceScore / (a.costPerInputToken + a.costPerOutputToken);
    const ratioB = b.performanceScore / (b.costPerInputToken + b.costPerOutputToken);
    return ratioB - ratioA;
  });

  // Task-specific preferences
  if (taskType === "rag") {
    availableModels = availableModels.filter((model) => model.maxTokens >= 8192);
  } else if (taskType === "analysis") {
    availableModels = availableModels.filter((model) => model.performanceScore >= 90);
  }

  if (availableModels.length === 0) {
    throw new Error("No available models meet the specified criteria");
  }

  return availableModels[0];
}

