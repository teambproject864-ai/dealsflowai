// Dealflow LLM: Main Go-to-Market LLM System
import { hfInfer } from '../huggingface';
import { DealflowVAE } from './dealflow-vae';
import { DealflowGAN } from './dealflow-gan';
import { DealflowEvaluator } from './dealflow-evaluator';
import { DealflowDataIngestionPipeline, SyntheticDataSample } from './dealflow-data-pipeline';
import type { DealflowOutput, DealflowLatentVector, DealflowLearningState, DealflowMarketDataPoint, DealflowLLMConfig } from './dealflow-llm.types';
import type { ThresholdConfig } from './dealflow-evaluator';

export class DealflowLLM {
  private vae: DealflowVAE;
  private gan: DealflowGAN;
  private evaluator: DealflowEvaluator;
  private dataPipeline: DealflowDataIngestionPipeline;
  private config: DealflowLLMConfig & Partial<ThresholdConfig>;
  private learningState: DealflowLearningState;
  private trainingData: DealflowMarketDataPoint[];
  private retrainingInProgress: boolean;

  constructor(config?: Partial<DealflowLLMConfig & ThresholdConfig>) {
    this.config = {
      maxLatentDim: 64,
      numEpochs: 100,
      learningRate: 0.001,
      fusionStrategy: 'llm_primary_with_enhancements',
      minOverallScore: 0.7,
      minDomainRelevance: 0.6,
      minEngagementScore: 0.5,
      maxPerplexity: 50,
      ...config,
    };
    this.vae = new DealflowVAE(this.config.maxLatentDim);
    this.gan = new DealflowGAN(this.config.maxLatentDim);
    this.evaluator = new DealflowEvaluator({
      minOverallScore: this.config.minOverallScore,
      minDomainRelevance: this.config.minDomainRelevance,
      minEngagementScore: this.config.minEngagementScore,
      maxPerplexity: this.config.maxPerplexity,
    });
    this.dataPipeline = new DealflowDataIngestionPipeline();
    this.learningState = {
      epoch: 0,
      loss: { llm: 0, ganGenerator: 0, ganDiscriminator: 0, vae: 0, total: 0 },
      modeCollapseRisk: 0,
    };
    this.trainingData = [];
    this.retrainingInProgress = false;
  }

  // Extract features from text for VAE
  private extractFeatures(text: string): number[] {
    // Simple bag-of-words-like features
    const words = text.toLowerCase().split(/\s+/);
    const keywords = ['customer', 'campaign', 'engagement', 'conversion', 'growth', 'segment', 'roi', 'brand', 'product', 'launch', 'market', 'strategy', 'content', 'channel', 'personalization'];
    return keywords.map(keyword => words.filter(w => w.includes(keyword)).length / (words.length + 1));
  }

  // Add training data
  addTrainingData(data: DealflowMarketDataPoint) {
    this.trainingData.push(data);
  }

  // Train all components
  train(numEpochs = this.config.numEpochs): DealflowLearningState {
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
  ): Promise<DealflowOutput> {
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
          gan: 'dealflow-gan-v1',
          vae: 'dealflow-vae-v1',
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
        return `${llm}\n\n💡 Enhanced by Dealflow LLM GAN & VAE`;
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
  getLearningState(): DealflowLearningState {
    return { ...this.learningState };
  }

  // Get evaluator instance
  getEvaluator(): DealflowEvaluator {
    return this.evaluator;
  }

  // Get data pipeline instance
  getDataPipeline(): DealflowDataIngestionPipeline {
    return this.dataPipeline;
  }

  // Ingest and train on synthetic baseline data
  async ingestAndTrainFromBaselines(prompts: string[]): Promise<DealflowLearningState> {
    console.log('[DealflowLLM] Generating synthetic training data from baselines...');
    const syntheticData = await this.dataPipeline.generateSyntheticData(prompts);
    const trainingPoints = this.dataPipeline.convertToTrainingData(syntheticData);
    
    trainingPoints.forEach(point => this.addTrainingData(point));
    
    console.log('[DealflowLLM] Training Dealflow LLM on synthetic data...');
    return this.train();
  }

  // Evaluate and conditionally retrain
  async evaluateAndConditionallyRetrain(
    prompt: string,
    referenceContent: string,
    systemPrompt?: string
  ): Promise<{ retrained: boolean; comparisonResults: any[] }> {
    if (this.retrainingInProgress) {
      console.warn('[DealflowLLM] Retraining already in progress, skipping...');
      return { retrained: false, comparisonResults: [] };
    }

    // Generate baseline outputs
    const syntheticData = await this.dataPipeline.generateSyntheticData([prompt], systemPrompt);
    const sample = syntheticData[0];
    if (!sample) throw new Error('No synthetic data generated');

    const baselineOutputs = Object.entries(sample.baselineOutputs).map(([modelName, content]) => ({
      modelName,
      content,
    }));

    // Generate Dealflow LLM output
    const dealflowllmOutput = await this.infer(prompt, systemPrompt);

    // Compare models
    const comparisonResults = this.evaluator.compareModels(
      dealflowllmOutput,
      baselineOutputs,
      referenceContent || sample.referenceContent
    );

    const dealflowllmResult = comparisonResults.find(r => r.modelName === 'dealflow-llm');
    if (!dealflowllmResult) throw new Error('Dealflow LLM result not found');

    // Check if retraining is needed
    const needsRetraining = !dealflowllmResult.passesThresholds;

    if (needsRetraining) {
      console.log('[DealflowLLM] Dealflow LLM failed thresholds, initiating retraining...');
      this.retrainingInProgress = true;
      try {
        await this.ingestAndTrainFromBaselines([prompt, ...baselineOutputs.map(b => b.content)]);
      } finally {
        this.retrainingInProgress = false;
      }
      return { retrained: true, comparisonResults };
    }

    console.log('[DealflowLLM] Dealflow LLM passed thresholds, no retraining needed');
    return { retrained: false, comparisonResults };
  }
}

// Singleton instance
export const dealflowLLM = new DealflowLLM();
