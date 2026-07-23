// GM LLM: Main Go-to-Market LLM System
import { hfInfer } from '../huggingface';
import { GMVAE } from './vae';
import { GMGAN } from './gan';
import type { GMOutput, GMLatentVector, GMLearningState, GMMarketDataPoint, GMLLMConfig } from './gm-llm.types';

export class GMLLM {
  private vae: GMVAE;
  private gan: GMGAN;
  private config: GMLLMConfig;
  private learningState: GMLearningState;
  private trainingData: GMMarketDataPoint[];

  constructor(config?: Partial<GMLLMConfig>) {
    this.config = {
      maxLatentDim: 64,
      numEpochs: 100,
      learningRate: 0.001,
      fusionStrategy: 'llm_primary_with_enhancements',
      ...config,
    };
    this.vae = new GMVAE(this.config.maxLatentDim);
    this.gan = new GMGAN(this.config.maxLatentDim);
    this.learningState = {
      epoch: 0,
      loss: { llm: 0, ganGenerator: 0, ganDiscriminator: 0, vae: 0, total: 0 },
      modeCollapseRisk: 0,
    };
    this.trainingData = [];
  }

  // Extract features from text for VAE
  private extractFeatures(text: string): number[] {
    // Simple bag-of-words-like features
    const words = text.toLowerCase().split(/\s+/);
    const keywords = ['customer', 'campaign', 'engagement', 'conversion', 'growth', 'segment', 'roi', 'brand', 'product', 'launch', 'market', 'strategy', 'content', 'channel', 'personalization'];
    return keywords.map(keyword => words.filter(w => w.includes(keyword)).length / (words.length + 1));
  }

  // Add training data
  addTrainingData(data: GMMarketDataPoint) {
    this.trainingData.push(data);
  }

  // Train all components
  train(numEpochs = this.config.numEpochs): GMLearningState {
    for (let epoch = 0; epoch < numEpochs; epoch++) {
      let totalVaeLoss = 0;
      let totalGanGeneratorLoss = 0;
      let totalGanDiscriminatorLoss = 0;

      for (const dataPoint of this.trainingData) {
        // Train VAE
        const vaeLoss = this.vae.learn(dataPoint, this.config.learningRate);
        totalVaeLoss += vaeLoss;

        // Train GAN with VAE latent
        const { latent } = this.vae.encode(dataPoint.features);
        const ganLosses = this.gan.train(dataPoint, latent, this.config.learningRate);
        totalGanGeneratorLoss += ganLosses.ganGenerator;
        totalGanDiscriminatorLoss += ganLosses.ganDiscriminator;
      }

      // Update learning state
      this.learningState.epoch++;
      this.learningState.loss.vae = totalVaeLoss / Math.max(this.trainingData.length, 1);
      this.learningState.loss.ganGenerator = totalGanGeneratorLoss / Math.max(this.trainingData.length, 1);
      this.learningState.loss.ganDiscriminator = totalGanDiscriminatorLoss / Math.max(this.trainingData.length, 1);
      this.learningState.modeCollapseRisk = this.vae.calculateModeCollapseRisk();
      this.learningState.loss.total =
        this.learningState.loss.vae +
        this.learningState.loss.ganGenerator +
        this.learningState.loss.ganDiscriminator;
    }

    return this.learningState;
  }

  // Inference: parallel processing of LLM, VAE, GAN
  async infer(
    prompt: string,
    systemPrompt: string = 'You are a go-to-market strategy expert. Generate clear, actionable, engaging content.',
    options: any = {}
  ): Promise<GMOutput> {
    const startTime = Date.now();
    const features = this.extractFeatures(prompt + ' ' + systemPrompt);

    // Run all components in parallel
    const [llmOutput, vaeResult] = await Promise.all([
      // Core LLM via Hugging Face
      hfInfer(prompt, systemPrompt, options),
      // VAE encoding/decoding
      Promise.resolve().then(() => {
        const { latent } = this.vae.encode(features);
        const reconstruction = this.vae.generateTextReconstruction(latent);
        return { latent, reconstruction };
      }),
    ]);

    // GAN enhancement
    const ganOutput = this.gan.generateContent(llmOutput, vaeResult.latent);

    // Fusion module
    const fusedOutput = this.fuseOutputs(llmOutput, ganOutput, vaeResult);

    const processingTimeMs = Date.now() - startTime;

    return {
      llmOutput,
      ganOutput,
      vaeOutput: vaeResult,
      fusedOutput,
      confidence: 0.85 - this.learningState.modeCollapseRisk * 0.2,
      metadata: {
        timestamp: Date.now(),
        processingTimeMs,
        modelVersions: {
          llm: 'mistralai/Mistral-7B-Instruct-v0.3',
          gan: 'gm-gan-v1',
          vae: 'gm-vae-v1',
        },
      },
    };
  }

  // Fusion strategy implementation
  private fuseOutputs(llm: string, gan: string, vae: { reconstruction: string }): string {
    switch (this.config.fusionStrategy) {
      case 'weighted_average':
        return `${llm}\n\n--- GAN Enhancement ---\n${gan}\n\n--- VAE Context ---\n${vae.reconstruction}`;
      case 'consensus':
        return `${llm}\n\n💡 Enhanced by GM LLM GAN & VAE`;
      case 'llm_primary_with_enhancements':
      default:
        // Take LLM as primary, append GAN enhancements, weave in VAE keywords
        const vaeKeywords = vae.reconstruction.split(' ').slice(0, 5);
        let enhancedText = llm;
        vaeKeywords.forEach((keyword, i) => {
          if (keyword && !enhancedText.toLowerCase().includes(keyword.toLowerCase())) {
            enhancedText = enhancedText.replace(/\.\s|$/, `, leveraging ${keyword}. `);
          }
        });
        const ganEnhancement = gan.split('\n\n').slice(1).join('\n\n');
        return `${enhancedText}\n\n${ganEnhancement}`;
    }
  }

  // Get learning state
  getLearningState(): GMLearningState {
    return { ...this.learningState };
  }
}

// Singleton instance
export const gmLLM = new GMLLM();
