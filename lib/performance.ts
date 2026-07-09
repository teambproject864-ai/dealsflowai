import { logger } from './logger';

interface TimingResult {
  name: string;
  durationMs: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private startTimes: Map<string, number> = new Map();
  private recentTimings: TimingResult[] = [];
  private maxRecentTimings = 100;

  start(name: string, metadata?: Record<string, any>): string {
    const id = `${name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.startTimes.set(id, performance.now());
    logger.info(`[PERF] Starting ${name}`, { id, metadata });
    return id;
  }

  end(id: string): TimingResult {
    const startTime = this.startTimes.get(id);
    if (!startTime) {
      logger.warn(`[PERF] Tried to end unknown timing: ${id}`);
      return { name: id, durationMs: 0 };
    }
    const durationMs = performance.now() - startTime;
    const result: TimingResult = {
      name: id.split('-').slice(0, -2).join('-'),
      durationMs,
    };
    this.startTimes.delete(id);
    this.recentTimings.push(result);
    if (this.recentTimings.length > this.maxRecentTimings) {
      this.recentTimings.shift();
    }
    logger.info(`[PERF] Completed ${result.name}`, { id, durationMs });
    return result;
  }

  async measure<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const id = this.start(name, metadata);
    try {
      const result = await fn();
      this.end(id);
      return result;
    } catch (error) {
      this.end(id);
      throw error;
    }
  }

  getRecentTimings(): TimingResult[] {
    return [...this.recentTimings];
  }

  getStats(): { avgDurationMs: number; count: number; maxDurationMs: number; minDurationMs: number } {
    if (this.recentTimings.length === 0) {
      return { avgDurationMs: 0, count: 0, maxDurationMs: 0, minDurationMs: 0 };
    }
    const durations = this.recentTimings.map(t => t.durationMs);
    return {
      avgDurationMs: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
      count: this.recentTimings.length,
      maxDurationMs: Math.max(...durations),
      minDurationMs: Math.min(...durations),
    };
  }
}

export const perf = new PerformanceMonitor();
