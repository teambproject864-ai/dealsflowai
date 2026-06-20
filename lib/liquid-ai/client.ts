import { HfInference } from "@huggingface/inference";

/**
 * Liquid AI Model Client
 */
export class LiquidAIClient {
  private hf: HfInference;

  constructor(apiKey?: string) {
    this.hf = new HfInference(
      apiKey || process.env.HUGGINGFACE_API_TOKEN || process.env.HF_TOKEN
    );
  }

  /**
   * Generate embeddings using LFM2.5-Embedding-350M
   */
  async generateEmbeddings(
    texts: string[],
    options?: {
      model?: string;
    }
  ): Promise<{
    embeddings: number[][];
    model: string;
  }> {
    const model =
      options?.model || "LiquidAI/LFM2.5-Embedding-350M";

    const embeddings = await Promise.all(
      texts.map(async (text) => {
        const res = await this.hf.featureExtraction({
          model,
          inputs: text,
        });
        return res as number[];
      })
    );

    return {
      embeddings,
      model,
    };
  }

  /**
   * Generate ColBERT embeddings for multi-vector retrieval
   */
  async generateColbertEmbeddings(
    texts: string[],
    options?: {
      model?: string;
    }
  ): Promise<{
    embeddings: number[][][]; // Each text has multiple token-level embeddings
    model: string;
  }> {
    const model =
      options?.model || "LiquidAI/LFM2.5-ColBERT-350M";

    // For ColBERT, we'll use feature extraction with token-level outputs
    // Note: This is a simplified implementation; production ColBERT would use model-specific tokenization
    const embeddings = await Promise.all(
      texts.map(async (text) => {
        const res = await this.hf.featureExtraction({
          model,
          inputs: text,
        });
        // Assume res is a 2D array [num_tokens, embedding_dim]
        return Array.isArray(res[0]) ? (res as number[][]) : [res as number[]];
      })
    );

    return {
      embeddings,
      model,
    };
  }
}

// Singleton instance
let liquidAIClientInstance: LiquidAIClient | null = null;

export function getLiquidAIClient(): LiquidAIClient {
  if (!liquidAIClientInstance) {
    liquidAIClientInstance = new LiquidAIClient();
  }
  return liquidAIClientInstance;
}
