// Dealflow LLM: Cross-Model Evaluation & Comparison Module
import type { DealflowOutput } from './dealflow-llm.types';

export interface EvaluationMetrics {
  perplexity: number;
  bleuScore: number;
  rouge1: number;
  rouge2: number;
  rougeL: number;
  domainRelevance: number;
  engagementScore: number;
  overallScore: number;
}

export interface ModelComparisonResult {
  modelName: string;
  metrics: EvaluationMetrics;
  timestamp: number;
  contentSample: string;
  passesThresholds: boolean;
}

export interface ThresholdConfig {
  minOverallScore: number;
  minDomainRelevance: number;
  minEngagementScore: number;
  maxPerplexity: number;
}

const DEFAULT_THRESHOLDS: ThresholdConfig = {
  minOverallScore: 0.7,
  minDomainRelevance: 0.6,
  minEngagementScore: 0.5,
  maxPerplexity: 50,
};

export class DealflowEvaluator {
  private thresholds: ThresholdConfig;
  private comparisonHistory: ModelComparisonResult[];

  constructor(thresholds?: Partial<ThresholdConfig>) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
    this.comparisonHistory = [];
  }

  // Calculate Perplexity (simplified approximation)
  calculatePerplexity(text: string): number {
    const words = text.split(/\s+/);
    const uniqueWords = new Set(words);
    // Higher unique word ratio → lower perplexity (more coherent)
    const uniqueRatio = uniqueWords.size / (words.length + 1);
    return Math.max(10, 100 * (1 - uniqueRatio));
  }

  // Calculate BLEU score (simplified n-gram overlap)
  calculateBleuScore(candidate: string, reference: string): number {
    const candidateNGrams = this.getNGrams(candidate, 2);
    const referenceNGrams = this.getNGrams(reference, 2);
    let matches = 0;
    candidateNGrams.forEach(gram => {
      if (referenceNGrams.has(gram)) matches++;
    });
    return matches / (candidateNGrams.size + 1);
  }

  // Calculate ROUGE scores (simplified)
  calculateRougeScores(candidate: string, reference: string): { rouge1: number; rouge2: number; rougeL: number } {
    const candidateWords = candidate.toLowerCase().split(/\s+/);
    const referenceWords = reference.toLowerCase().split(/\s+/);
    const candidateSet = new Set(candidateWords);
    const referenceSet = new Set(referenceWords);

    // ROUGE-1: unigram overlap
    let rouge1 = 0;
    candidateSet.forEach(word => {
      if (referenceSet.has(word)) rouge1++;
    });
    rouge1 /= (referenceSet.size + 1);

    // ROUGE-2: bigram overlap
    const candidateBigrams = this.getNGrams(candidate, 2);
    const referenceBigrams = this.getNGrams(reference, 2);
    let rouge2 = 0;
    candidateBigrams.forEach(gram => {
      if (referenceBigrams.has(gram)) rouge2++;
    });
    rouge2 /= (referenceBigrams.size + 1);

    // ROUGE-L: longest common subsequence (simplified)
    const lcs = this.longestCommonSubsequence(candidateWords, referenceWords);
    const rougeL = lcs / (referenceWords.length + 1);

    return { rouge1, rouge2, rougeL };
  }

  // Calculate domain relevance (keyword-based)
  calculateDomainRelevance(text: string): number {
    const domainKeywords = [
      'customer', 'campaign', 'conversion', 'engagement', 'growth', 'segment',
      'roi', 'brand', 'product', 'launch', 'market', 'strategy', 'content',
      'channel', 'personalization', 'lead', 'sales', 'marketing', 'go-to-market'
    ];
    const words = text.toLowerCase().split(/\s+/);
    let matches = 0;
    domainKeywords.forEach(keyword => {
      if (words.some(word => word.includes(keyword))) matches++;
    });
    return matches / domainKeywords.length;
  }

  // Calculate engagement score (emoji, exclamation, question marks, etc.)
  calculateEngagementScore(text: string): number {
    const hasEmoji = /[\p{Emoji}]/u.test(text);
    const exclamationCount = (text.match(/!/g) || []).length;
    const questionCount = (text.match(/\?/g) || []).length;
    const callToAction = /(click|learn more|sign up|buy now|contact us)/i.test(text);
    return Math.min(1, (
      (hasEmoji ? 0.2 : 0) +
      Math.min(exclamationCount * 0.1, 0.3) +
      Math.min(questionCount * 0.05, 0.2) +
      (callToAction ? 0.3 : 0)
    ));
  }

  // Evaluate a single output
  evaluateOutput(output: string, reference: string): EvaluationMetrics {
    const perplexity = this.calculatePerplexity(output);
    const bleuScore = this.calculateBleuScore(output, reference);
    const rouge = this.calculateRougeScores(output, reference);
    const domainRelevance = this.calculateDomainRelevance(output);
    const engagementScore = this.calculateEngagementScore(output);

    // Calculate overall score (weighted average)
    const overallScore = (
      (1 - Math.min(1, perplexity / 100)) * 0.15 + // Lower perplexity = better
      bleuScore * 0.2 +
      rouge.rouge1 * 0.15 +
      rouge.rougeL * 0.15 +
      domainRelevance * 0.2 +
      engagementScore * 0.15
    );

    return {
      perplexity,
      bleuScore,
      rouge1: rouge.rouge1,
      rouge2: rouge.rouge2,
      rougeL: rouge.rougeL,
      domainRelevance,
      engagementScore,
      overallScore,
    };
  }

  // Compare Dealflow LLM output to baseline models
  compareModels(
    dealflowllmOutput: DealflowOutput,
    baselineOutputs: { modelName: string; content: string }[],
    referenceContent: string
  ): ModelComparisonResult[] {
    const results: ModelComparisonResult[] = [];

    // Evaluate Dealflow LLM
    const dfMetrics = this.evaluateOutput(dealflowllmOutput.fusedOutput, referenceContent);
    const dfPasses = this.checkThresholds(dfMetrics);
    results.push({
      modelName: 'dealflow-llm',
      metrics: dfMetrics,
      timestamp: Date.now(),
      contentSample: dealflowllmOutput.fusedOutput,
      passesThresholds: dfPasses,
    });

    // Evaluate baselines
    baselineOutputs.forEach(baseline => {
      const metrics = this.evaluateOutput(baseline.content, referenceContent);
      const passes = this.checkThresholds(metrics);
      results.push({
        modelName: baseline.modelName,
        metrics,
        timestamp: Date.now(),
        contentSample: baseline.content,
        passesThresholds: passes,
      });
    });

    this.comparisonHistory.push(...results);
    if (this.comparisonHistory.length > 100) {
      this.comparisonHistory.splice(0, this.comparisonHistory.length - 100);
    }

    return results;
  }

  // Check if metrics meet thresholds
  checkThresholds(metrics: EvaluationMetrics): boolean {
    return (
      metrics.overallScore >= this.thresholds.minOverallScore &&
      metrics.domainRelevance >= this.thresholds.minDomainRelevance &&
      metrics.engagementScore >= this.thresholds.minEngagementScore &&
      metrics.perplexity <= this.thresholds.maxPerplexity
    );
  }

  // Get comparison history
  getComparisonHistory(): ModelComparisonResult[] {
    return [...this.comparisonHistory];
  }

  // Helper: Get n-grams
  private getNGrams(text: string, n: number): Set<string> {
    const words = text.toLowerCase().split(/\s+/);
    const ngrams = new Set<string>();
    for (let i = 0; i <= words.length - n; i++) {
      ngrams.add(words.slice(i, i + n).join(' '));
    }
    return ngrams;
  }

  // Helper: Longest common subsequence
  private longestCommonSubsequence(a: string[], b: string[]): number {
    const dp: number[][] = Array(a.length + 1).fill(0).map(() => Array(b.length + 1).fill(0));
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    return dp[a.length][b.length];
  }
}
