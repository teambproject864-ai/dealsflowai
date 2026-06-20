import { z } from "zod";

// Define LLM provider types
export type LLMProvider = "huggingface" | "openai" | "anthropic" | "ollama";

// Define LLM model configuration
export interface LLMModel {
  id: string;
  provider: LLMProvider;
  name: string;
  maxTokens: number;
  costPerThousandInputTokens: number;
  costPerThousandOutputTokens: number;
  averageLatencyMs: number;
  capabilities: {
    textGeneration: boolean;
    embeddings: boolean;
    reasoning: boolean;
    codeGeneration: boolean;
  };
  isAvailable: boolean;
}

// Define routing criteria
export interface LLMRoutingCriteria {
  maxTokens?: number;
  priority: "cost" | "speed" | "quality" | "balanced";
  requiredCapabilities?: Partial<LLMModel["capabilities"]>;
  maxCostPerThousandInputTokens?: number;
  maxLatencyMs?: number;
}

// Sample model configurations
export const DEFAULT_LLM_MODELS: LLMModel[] = [
  {
    id: "gpt-4o",
    provider: "openai",
    name: "GPT-4o",
    maxTokens: 128000,
    costPerThousandInputTokens: 0.005,
    costPerThousandOutputTokens: 0.015,
    averageLatencyMs: 1200,
    capabilities: {
      textGeneration: true,
      embeddings: false,
      reasoning: true,
      codeGeneration: true,
    },
    isAvailable: true,
  },
  {
    id: "gpt-3.5-turbo",
    provider: "openai",
    name: "GPT-3.5 Turbo",
    maxTokens: 16384,
    costPerThousandInputTokens: 0.0005,
    costPerThousandOutputTokens: 0.0015,
    averageLatencyMs: 400,
    capabilities: {
      textGeneration: true,
      embeddings: false,
      reasoning: true,
      codeGeneration: true,
    },
    isAvailable: true,
  },
  {
    id: "claude-3-5-sonnet",
    provider: "anthropic",
    name: "Claude 3.5 Sonnet",
    maxTokens: 200000,
    costPerThousandInputTokens: 0.003,
    costPerThousandOutputTokens: 0.015,
    averageLatencyMs: 1500,
    capabilities: {
      textGeneration: true,
      embeddings: false,
      reasoning: true,
      codeGeneration: true,
    },
    isAvailable: true,
  },
  {
    id: "llama-3.1-8b",
    provider: "ollama",
    name: "Llama 3.1 8B",
    maxTokens: 32768,
    costPerThousandInputTokens: 0,
    costPerThousandOutputTokens: 0,
    averageLatencyMs: 600,
    capabilities: {
      textGeneration: true,
      embeddings: false,
      reasoning: true,
      codeGeneration: true,
    },
    isAvailable: true,
  },
  {
    id: "mistral-large",
    provider: "huggingface",
    name: "Mistral Large",
    maxTokens: 128000,
    costPerThousandInputTokens: 0.002,
    costPerThousandOutputTokens: 0.006,
    averageLatencyMs: 1000,
    capabilities: {
      textGeneration: true,
      embeddings: true,
      reasoning: true,
      codeGeneration: true,
    },
    isAvailable: true,
  },
];

// LLM Router class
export class LLMRouter {
  private models: LLMModel[];

  constructor(models?: LLMModel[]) {
    this.models = models || DEFAULT_LLM_MODELS;
  }

  // Method to select the best model based on criteria
  selectBestModel(criteria: LLMRoutingCriteria): LLMModel | null {
    let filteredModels = this.models.filter(
      (model) => model.isAvailable
    );

    // Filter by max tokens
    if (criteria.maxTokens) {
      filteredModels = filteredModels.filter(
        (model) => model.maxTokens >= criteria.maxTokens
      );
    }

    // Filter by required capabilities
    if (criteria.requiredCapabilities) {
      filteredModels = filteredModels.filter((model) => {
        for (const [capability, required] of Object.entries(
          criteria.requiredCapabilities
        )) {
          if (required && !model.capabilities[capability as keyof LLMModel["capabilities"]]) {
            return false;
          }
        }
        return true;
      });
    }

    // Filter by max cost
    if (criteria.maxCostPerThousandInputTokens !== undefined) {
      filteredModels = filteredModels.filter(
        (model) =>
          model.costPerThousandInputTokens <=
          criteria.maxCostPerThousandInputTokens!
      );
    }

    // Filter by max latency
    if (criteria.maxLatencyMs) {
      filteredModels = filteredModels.filter(
        (model) => model.averageLatencyMs <= criteria.maxLatencyMs
      );
    }

    if (filteredModels.length === 0) {
      return null;
    }

    // Sort based on priority
    switch (criteria.priority) {
      case "cost":
        filteredModels.sort(
          (a, b) => a.costPerThousandInputTokens - b.costPerThousandInputTokens
        );
        break;
      case "speed":
        filteredModels.sort(
          (a, b) => a.averageLatencyMs - b.averageLatencyMs
        );
        break;
      case "quality":
        // Simple quality heuristic based on max tokens and capabilities
        filteredModels.sort((a, b) => {
          const aScore =
            a.maxTokens + Object.values(a.capabilities).filter(Boolean).length * 10000;
          const bScore =
            b.maxTokens + Object.values(b.capabilities).filter(Boolean).length * 10000;
          return bScore - aScore;
        });
        break;
      case "balanced":
        filteredModels.sort((a, b) => {
          const aCostNormalized = a.costPerThousandInputTokens / 0.01;
          const aLatencyNormalized = a.averageLatencyMs / 2000;
          const aScore = (aCostNormalized + aLatencyNormalized) / 2;

          const bCostNormalized = b.costPerThousandInputTokens / 0.01;
          const bLatencyNormalized = b.averageLatencyMs / 2000;
          const bScore = (bCostNormalized + bLatencyNormalized) / 2;

          return aScore - bScore;
        });
        break;
    }

    return filteredModels[0];
  }

  // Add new model
  addModel(model: LLMModel): void {
    this.models.push(model);
  }

  // Remove model
  removeModel(modelId: string): void {
    this.models = this.models.filter((model) => model.id !== modelId);
  }

  // Update model availability
  updateModelAvailability(modelId: string, isAvailable: boolean): void {
    const model = this.models.find((m) => m.id === modelId);
    if (model) {
      model.isAvailable = isAvailable;
    }
  }

  // Get all models
  getAllModels(): LLMModel[] {
    return [...this.models];
  }
}

// Singleton instance
let routerInstance: LLMRouter | null = null;

export function getLLMRouter(): LLMRouter {
  if (!routerInstance) {
    routerInstance = new LLMRouter();
  }
  return routerInstance;
}
