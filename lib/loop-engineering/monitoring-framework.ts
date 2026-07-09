
import { LoopState, LoopMetrics, LoopIteration, LoopStatus } from "./types";

export interface Alert {
  id: string;
  loopId: string;
  type: "error" | "warning" | "info";
  message: string;
  timestamp: number;
  resolved: boolean;
}

export class MonitoringFramework {
  private alerts: Alert[];
  private alertCallbacks: Array<(alert: Alert) => void>;

  constructor() {
    this.alerts = [];
    this.alertCallbacks = [];
  }

  registerAlertCallback(callback: (alert: Alert) => void): void {
    this.alertCallbacks.push(callback);
  }

  monitorLoop(loop: LoopState): void {
    // Check for errors
    if (loop.status === LoopStatus.FAILED) {
      this.createAlert(loop.id, "error", `Loop ${loop.id} failed`);
    }

    // Check error rate
    if (loop.metrics.errorRate > 0.3) {
      this.createAlert(loop.id, "warning", `High error rate: ${(loop.metrics.errorRate * 100).toFixed(1)}%`);
    }

    // Check for long running iterations
    const longRunning = loop.iterations.filter(i => {
      if (!i.completedAt) {
        return Date.now() - i.startedAt > 30000;
      }
      return false;
    });
    if (longRunning.length > 0) {
      this.createAlert(loop.id, "warning", `${longRunning.length} long running iterations`);
    }
  }

  private createAlert(loopId: string, type: Alert["type"], message: string): void {
    const alert: Alert = {
      id: crypto.randomUUID(),
      loopId,
      type,
      message,
      timestamp: Date.now(),
      resolved: false
    };
    this.alerts.push(alert);
    this.alertCallbacks.forEach(cb => cb(alert));
  }

  getAlerts(loopId?: string): Alert[] {
    if (loopId) {
      return this.alerts.filter(a => a.loopId === loopId);
    }
    return this.alerts;
  }

  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  generateReport(loop: LoopState): Record<string, any> {
    return {
      loopId: loop.id,
      loopName: loop.config.name,
      status: loop.status,
      metrics: loop.metrics,
      iterationCount: loop.iterations.length,
      successRate: (loop.metrics.tasksCompleted / (loop.iterations.length || 1)) * 100,
      alerts: this.getAlerts(loop.id).filter(a => !a.resolved),
      feedbackCount: loop.feedback.length
    };
  }
}

