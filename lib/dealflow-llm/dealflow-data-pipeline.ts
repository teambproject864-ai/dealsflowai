// Dealflow LLM: Synthetic Data Ingestion Pipeline
import { hfInfer } from '../huggingface';
import { nvInfer } from '../nvidia';
import { kimiInfer } from '../kimi';
import type { DealflowMarketDataPoint } from './dealflow-llm.types';

export interface BaselineModelConfig {
  modelName: string;
  provider: 'huggingface' | 'nvidia' | 'kimi';
  enabled: boolean;
}

const DEFAULT_BASELINE_MODELS: BaselineModelConfig[] = [
  { modelName: 'mistralai/Mistral-7B-Instruct-v0.3', provider: 'huggingface', enabled: true },
  { modelName: 'nvidia/nemotron', provider: 'nvidia', enabled: true },
  { modelName: 'kimi-v1', provider: 'kimi', enabled: true },
];

export interface SyntheticDataSample {
  id: string;
  prompt: string;
  referenceContent: string;
  baselineOutputs: { [modelName: string]: string };
  timestamp: number;
}

export class DealflowDataIngestionPipeline {
  private baselineModels: BaselineModelConfig[];
  private syntheticDataStore: SyntheticDataSample[];

  constructor(models?: BaselineModelConfig[]) {
    this.baselineModels = models || DEFAULT_BASELINE_MODELS;
    this.syntheticDataStore = [];
  }

  // Generate synthetic data from baseline models
  async generateSyntheticData(
    prompts: string[],
    systemPrompt: string = 'You are a go-to-market strategy expert. Generate clear, actionable, engaging content.'
  ): Promise<SyntheticDataSample[]> {
    const samples: SyntheticDataSample[] = [];

    for (const prompt of prompts) {
      const baselineOutputs: { [modelName: string]: string } = {};
      const enabledModels = this.baselineModels.filter(m => m.enabled);

      // Generate outputs from all enabled baselines in parallel
      await Promise.all(
        enabledModels.map(async model => {
          try {
            let output: string;
            switch (model.provider) {
              case 'huggingface':
                output = await hfInfer(prompt, systemPrompt);
                break;
              case 'nvidia':
                output = await nvInfer(prompt, systemPrompt);
                break;
              case 'kimi':
                output = await kimiInfer(prompt, systemPrompt);
                break;
            }
            baselineOutputs[model.modelName] = output;
          } catch (err) {
            console.warn(`[DealflowDataIngestion] Failed to generate from ${model.modelName}:`, err);
          }
        })
      );

      // Pick one baseline output as reference for evaluation
      const referenceModel = enabledModels[0]?.modelName;
      const referenceContent = referenceModel ? baselineOutputs[referenceModel] : '';

      samples.push({
        id: crypto.randomUUID(),
        prompt,
        referenceContent,
        baselineOutputs,
        timestamp: Date.now(),
      });
    }

    this.syntheticDataStore.push(...samples);
    if (this.syntheticDataStore.length > 1000) {
      this.syntheticDataStore.splice(0, this.syntheticDataStore.length - 1000);
    }

    return samples;
  }

  // Convert synthetic samples to training data points for Dealflow LLM
  convertToTrainingData(samples: SyntheticDataSample[]): DealflowMarketDataPoint[] {
    return samples.map(sample => {
      // Combine all baseline outputs for richer training data
      const allOutputs = Object.values(sample.baselineOutputs).join('\n---\n');
      return {
        id: sample.id,
        category: 'customer_insight',
        features: this.extractFeatures(sample.prompt + '\n' + allOutputs),
        label: sample.referenceContent,
        metadata: {
          prompt: sample.prompt,
          baselineModels: Object.keys(sample.baselineOutputs),
        },
        timestamp: sample.timestamp,
      };
    });
  }

  // Get stored synthetic data
  getSyntheticDataStore(): SyntheticDataSample[] {
    return [...this.syntheticDataStore];
  }

  // Clear stored data
  clearDataStore(): void {
    this.syntheticDataStore = [];
  }

  // Helper: Extract features from text
  private extractFeatures(text: string): number[] {
    const keywords = ['customer', 'campaign', 'engagement', 'conversion', 'growth', 'segment', 'roi', 'brand', 'product', 'launch', 'market', 'strategy', 'content', 'channel', 'personalization'];
    const words = text.toLowerCase().split(/\s+/);
    return keywords.map(keyword => words.filter(w => w.includes(keyword)).length / (words.length + 1));
  }
}
