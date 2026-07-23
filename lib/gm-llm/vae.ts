// GM LLM: Variational Autoencoder (VAE) Component
import type { GMLatentVector, GMLearningState, GMMarketDataPoint } from './gm-llm.types';

export class GMVAE {
  private latentDim: number;
  private encoderWeights: number[][];
  private decoderWeights: number[][];
  private modeCollapseHistory: number[];

  constructor(latentDim = 64) {
    this.latentDim = latentDim;
    this.modeCollapseHistory = [];
    this.encoderWeights = this.initWeights(128, latentDim * 2);
    this.decoderWeights = this.initWeights(latentDim, 128);
  }

  private initWeights(inDim: number, outDim: number): number[][] {
    return Array.from({ length: inDim }, () =>
      Array.from({ length: outDim }, () => (Math.random() - 0.5) * 0.1)
    );
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  private relu(x: number): number {
    return Math.max(0, x);
  }

  private tanh(x: number): number {
    return Math.tanh(x);
  }

  // Encode input features to latent space
  encode(features: number[]): { mean: number[]; logVar: number[]; latent: GMLatentVector } {
    // Pad or truncate features to fixed size
    const paddedFeatures = Array.from({ length: 128 }, (_, i) => features[i] || 0);

    // Encoder forward pass
    let hidden = paddedFeatures.map((val, i) =>
      this.relu(val * this.encoderWeights[i].reduce((sum, w) => sum + w, 0) / 128)
    );

    // Split into mean and log variance
    const mean = hidden.slice(0, this.latentDim);
    const logVar = hidden.slice(this.latentDim, this.latentDim * 2).map(v => this.sigmoid(v));

    // Reparameterization trick: sample from N(mean, exp(logVar/2))
    const epsilon = Array.from({ length: this.latentDim }, () =>
      (Math.random() - 0.5) * 2
    );
    const vector = mean.map((m, i) => m + Math.exp(logVar[i] / 2) * epsilon[i]);

    return {
      mean,
      logVar,
      latent: {
        id: crypto.randomUUID(),
        vector,
        timestamp: Date.now(),
        metadata: { source: 'gm-vae-encoder' },
      },
    };
  }

  // Decode latent vector back to feature space
  decode(latent: GMLatentVector): number[] {
    // Decoder forward pass
    let hidden = latent.vector.map((val, i) =>
      this.tanh(val * this.decoderWeights[i].reduce((sum, w) => sum + w, 0) / this.latentDim)
    );

    // Pad to 128 features
    return Array.from({ length: 128 }, (_, i) => hidden[i] || 0);
  }

  // Learn from data point and update weights
  learn(dataPoint: GMMarketDataPoint, learningRate = 0.001): GMLearningState['loss']['vae'] {
    const { latent } = this.encode(dataPoint.features);
    const reconstructed = this.decode(latent);

    // Calculate reconstruction loss
    const reconstructionLoss = dataPoint.features.reduce((sum, val, i) => {
      const target = val || 0;
      const pred = reconstructed[i] || 0;
      return sum + Math.pow(target - pred, 2);
    }, 0) / Math.max(dataPoint.features.length, 1);

    // Calculate KL divergence
    const klDivergence = 0.5 * (
      latent.vector.reduce((sum, v) => sum + v * v, 0) -
      latent.vector.length -
      latent.vector.reduce((sum, v) => sum + Math.log(1e-8 + Math.abs(v)), 0)
    );

    const totalLoss = reconstructionLoss + klDivergence * 0.1;

    // Update mode collapse risk
    const modeCollapseRisk = this.calculateModeCollapseRisk();
    this.modeCollapseHistory.push(modeCollapseRisk);
    if (this.modeCollapseHistory.length > 100) this.modeCollapseHistory.shift();

    // Simple weight update (gradient descent approximation)
    this.encoderWeights = this.encoderWeights.map(row =>
      row.map(w => w - learningRate * totalLoss * 0.01)
    );
    this.decoderWeights = this.decoderWeights.map(row =>
      row.map(w => w - learningRate * totalLoss * 0.01)
    );

    return totalLoss;
  }

  // Calculate risk of mode collapse in GAN
  calculateModeCollapseRisk(): number {
    if (this.modeCollapseHistory.length < 10) return 0;
    const recent = this.modeCollapseHistory.slice(-10);
    const variance = recent.reduce((sum, v, i, arr) => {
      const mean = arr.reduce((s, x) => s + x, 0) / arr.length;
      return sum + Math.pow(v - mean, 2);
    }, 0) / recent.length;
    return Math.max(0, 1 - variance * 10);
  }

  // Generate text reconstruction from latent vector
  generateTextReconstruction(latent: GMLatentVector): string {
    const decoded = this.decode(latent);
    const keywords = [
      'campaign', 'customer', 'engagement', 'conversion', 'growth',
      'segmentation', 'personalization', 'ROI', 'channel', 'content',
      'brand', 'product', 'launch', 'market', 'strategy'
    ];
    return decoded
      .slice(0, 10)
      .map((v, i) => keywords[Math.floor(Math.abs(v * keywords.length)) % keywords.length])
      .join(' ');
  }
}
