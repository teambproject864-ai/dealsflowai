import { OrchestratorEvent } from "./types";

export interface Span {
  id: string;
  parentId?: string;
  traceId: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  attributes: Record<string, any>;
  status: "ok" | "error";
}

export interface Metric {
  name: string;
  value: number;
  timestamp: number;
  attributes: Record<string, any>;
}

export class ObservabilitySystem {
  private spans: Map<string, Span> = new Map();
  private metrics: Metric[] = [];
  private events: OrchestratorEvent[] = [];
  private maxEvents: number = 10000;
  private maxMetrics: number = 10000;
  private activeSpans: Map<string, Span> = new Map();

  /**
   * Starts a new span
   */
  startSpan(
    name: string,
    options?: {
      parentId?: string;
      traceId?: string;
      attributes?: Record<string, any>;
    }
  ): Span {
    const span: Span = {
      id: crypto.randomUUID(),
      parentId: options?.parentId,
      traceId: options?.traceId || crypto.randomUUID(),
      name,
      startTime: Date.now(),
      attributes: options?.attributes || {},
      status: "ok",
    };

    this.activeSpans.set(span.id, span);
    return span;
  }

  /**
   * Ends a span
   */
  endSpan(spanId: string, status: "ok" | "error" = "ok"): Span | undefined {
    const span = this.activeSpans.get(spanId);
    if (!span) return undefined;

    const endTime = Date.now();
    const completedSpan: Span = {
      ...span,
      endTime,
      duration: endTime - span.startTime,
      status,
    };

    this.spans.set(spanId, completedSpan);
    this.activeSpans.delete(spanId);

    return completedSpan;
  }

  /**
   * Records a metric
   */
  recordMetric(
    name: string,
    value: number,
    attributes?: Record<string, any>
  ): void {
    const metric: Metric = {
      name,
      value,
      timestamp: Date.now(),
      attributes: attributes || {},
    };

    this.metrics.push(metric);

    // Trim if needed
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * Records an event
   */
  recordEvent(event: OrchestratorEvent): void {
    this.events.push(event);

    // Trim if needed
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }
  }

  /**
   * Gets trace by trace ID
   */
  getTrace(traceId: string): Span[] {
    return Array.from(this.spans.values())
      .filter(span => span.traceId === traceId)
      .sort((a, b) => a.startTime - b.startTime);
  }

  /**
   * Gets metrics by name
   */
  getMetrics(name: string, timeRange?: { start: number; end: number }): Metric[] {
    let metrics = this.metrics.filter(m => m.name === name);
    
    if (timeRange) {
      metrics = metrics.filter(m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end);
    }

    return metrics;
  }

  /**
   * Gets recent events
   */
  getEvents(limit: number = 100): OrchestratorEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Gets aggregated statistics
   */
  getStatistics(): {
    totalSpans: number;
    totalMetrics: number;
    totalEvents: number;
    activeSpans: number;
    averageSpanDuration?: number;
  } {
    const completedSpans = Array.from(this.spans.values()).filter(s => s.duration !== undefined);
    const totalDuration = completedSpans.reduce((sum, s) => sum + (s.duration || 0), 0);
    const averageDuration = completedSpans.length > 0 ? totalDuration / completedSpans.length : undefined;

    return {
      totalSpans: this.spans.size,
      totalMetrics: this.metrics.length,
      totalEvents: this.events.length,
      activeSpans: this.activeSpans.size,
      averageSpanDuration: averageDuration,
    };
  }
}
