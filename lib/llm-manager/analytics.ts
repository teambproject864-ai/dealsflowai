
import type { LLMInteraction } from "./types";
import { modelCatalog } from "./model-catalog";

interface Report {
  generatedAt: Date;
  timeRange: {
    start: Date;
    end: Date;
  };
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  totalCost: number;
  averageCostPerRequest: number;
  averageLatencyMs: number;
  providerBreakdown: {
    [provider: string]: {
      count: number;
      cost: number;
      averageLatency: number;
    };
  };
  modelBreakdown: {
    [modelId: string]: {
      count: number;
      cost: number;
      averageLatency: number;
    };
  };
}

interface Alert {
  id: string;
  type: "error_spike" | "budget_exceeded" | "performance_drop";
  message: string;
  timestamp: Date;
  severity: "low" | "medium" | "high";
}

class AnalyticsEngine {
  private alerts: Alert[] = [];
  private budgetThreshold = 100; // $100
  private budgetSpent = 0;

  generateReport(interactions: LLMInteraction[]): Report {
    const totalRequests = interactions.length;
    const successfulRequests = interactions.filter((i) => i.response !== null).length;
    const failedRequests = interactions.filter((i) => i.error !== null).length;

    const totalCost = interactions.reduce((sum, i) => sum + i.cost, 0);
    this.budgetSpent = totalCost;

    const totalLatency = interactions.reduce((sum, i) => sum + i.latencyMs, 0);
    const averageLatencyMs = totalRequests > 0 ? totalLatency / totalRequests : 0;

    // Provider breakdown
    const providerBreakdown: Report["providerBreakdown"] = {};
    interactions.forEach((interaction) => {
      if (!providerBreakdown[interaction.provider]) {
        providerBreakdown[interaction.provider] = { count: 0, cost: 0, averageLatency: 0 };
      }
      const entry = providerBreakdown[interaction.provider];
      entry.count++;
      entry.cost += interaction.cost;
      entry.averageLatency =
        (entry.averageLatency * (entry.count - 1) + interaction.latencyMs) / entry.count;
    });

    // Model breakdown
    const modelBreakdown: Report["modelBreakdown"] = {};
    interactions.forEach((interaction) => {
      if (!modelBreakdown[interaction.modelId]) {
        modelBreakdown[interaction.modelId] = { count: 0, cost: 0, averageLatency: 0 };
      }
      const entry = modelBreakdown[interaction.modelId];
      entry.count++;
      entry.cost += interaction.cost;
      entry.averageLatency =
        (entry.averageLatency * (entry.count - 1) + interaction.latencyMs) / entry.count;
    });

    // Check for alerts
    this.checkAlerts({ totalCost, successRate: successfulRequests / totalRequests });

    return {
      generatedAt: new Date(),
      timeRange: {
        start: interactions.length > 0 ? interactions[0].timestamp : new Date(),
        end: interactions.length > 0 ? interactions[interactions.length - 1].timestamp : new Date(),
      },
      totalRequests,
      successfulRequests,
      failedRequests,
      successRate: totalRequests > 0 ? successfulRequests / totalRequests : 0,
      totalCost,
      averageCostPerRequest: totalRequests > 0 ? totalCost / totalRequests : 0,
      averageLatencyMs,
      providerBreakdown,
      modelBreakdown,
    };
  }

  private checkAlerts(metrics: { totalCost: number; successRate: number }) {
    // Check budget alert
    if (metrics.totalCost > this.budgetThreshold) {
      this.addAlert({
        id: `budget-${Date.now()}`,
        type: "budget_exceeded",
        message: `Budget exceeded! Spent $${metrics.totalCost.toFixed(2)} of $${this.budgetThreshold}`,
        timestamp: new Date(),
        severity: "high",
      });
    }

    // Check error rate alert
    if (metrics.successRate < 0.9) {
      this.addAlert({
        id: `error-${Date.now()}`,
        type: "error_spike",
        message: `Error rate high! Success rate is ${(metrics.successRate * 100).toFixed(1)}%`,
        timestamp: new Date(),
        severity: "medium",
      });
    }
  }

  private addAlert(alert: Alert) {
    this.alerts.push(alert);
    console.warn(`LLM Manager Alert [${alert.severity.toUpperCase()}]: ${alert.message}`);
  }

  getAlerts(limit: number = 10): Alert[] {
    return this.alerts.slice(-limit);
  }
}

export const analyticsEngine = new AnalyticsEngine();

