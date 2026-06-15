import { v4 as uuidv4 } from "uuid";
import {
  AgenticContext,
  AgentTask,
  AgentRole,
  FrameworkConfig,
  FrameworkMetrics,
} from "../types";
import { createAgent } from "./agents";

// --- Default Configuration ---
export const DEFAULT_FRAMEWORK_CONFIG: FrameworkConfig = {
  maxConcurrentTasks: 5,
  defaultTimeoutMs: 30000,
  selfHealingEnabled: true,
  retryBackoffMs: 1000,
};

// --- A.G.E.N.T.I.C. Framework Orchestrator ---
export class AgenticFramework {
  private config: FrameworkConfig;
  private context: AgenticContext;
  private taskQueue: AgentTask[] = [];
  private activeTasks: Map<string, AgentTask> = new Map();
  private startTime: number = Date.now();
  private metrics: FrameworkMetrics = {
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    averageLatency: 0,
    uptime: 0,
    agentLoad: {} as Record<AgentRole, number>,
  };

  constructor(
    conversationId: string,
    config: Partial<FrameworkConfig> = DEFAULT_FRAMEWORK_CONFIG
  ) {
    this.config = { ...DEFAULT_FRAMEWORK_CONFIG, ...config };
    this.context = {
      conversationId,
      tasks: [],
      messages: [],
      contextualMemory: {},
      timestamp: new Date().toISOString(),
    };
  }

  // --- Public API ---
  public createTask(
    role: AgentRole,
    input: Record<string, any>,
    priority: AgentTask["priority"] = "medium",
    maxRetries = 3
  ): AgentTask {
    const task: AgentTask = {
      id: uuidv4(),
      role,
      priority,
      status: "pending",
      input,
      retries: 0,
      maxRetries,
      createdAt: new Date().toISOString(),
    };
    this.taskQueue.push(task);
    this.context.tasks.push(task);
    this.metrics.totalTasks++;
    return task;
  }

  public async executePipeline(): Promise<AgenticContext> {
    // Sort by priority first
    this.taskQueue.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    for (const task of this.taskQueue) {
      if (this.activeTasks.size < this.config.maxConcurrentTasks) {
        await this.executeTask(task);
      }
    }

    return this.context;
  }

  public getMetrics(): FrameworkMetrics {
    this.metrics.uptime = Date.now() - this.startTime;
    return this.metrics;
  }

  public getContext(): AgenticContext {
    return { ...this.context, timestamp: new Date().toISOString() };
  }

  // --- Private Helpers ---
  private async executeTask(task: AgentTask): Promise<void> {
    console.log(`[AgenticFramework] Executing task ${task.id} (role: ${task.role})`);
    task.status = "in-progress";
    task.startedAt = new Date().toISOString();
    this.activeTasks.set(task.id, task);

    try {
      const agent = createAgent(task.role);
      const output = await Promise.race([
        agent.execute(task.input),
        this.timeout(this.config.defaultTimeoutMs),
      ]);

      task.output = output;
      task.status = "completed";
      task.completedAt = new Date().toISOString();
      this.metrics.completedTasks++;

      console.log(`[AgenticFramework] Task ${task.id} completed successfully`);
    } catch (err) {
      if (this.config.selfHealingEnabled && task.retries < task.maxRetries) {
        task.retries++;
        task.status = "reassigned";
        console.log(`[AgenticFramework] Retrying task ${task.id} (attempt ${task.retries})`);
        await this.sleep(this.config.retryBackoffMs * task.retries);
        await this.executeTask(task);
        return;
      } else {
        task.status = "failed";
        this.metrics.failedTasks++;
        console.error(`[AgenticFramework] Task ${task.id} failed:`, err);
      }
    }

    this.activeTasks.delete(task.id);
    const latency = task.startedAt && task.completedAt ?
      new Date(task.completedAt).getTime() - new Date(task.startedAt).getTime() : 0;
    this.metrics.averageLatency =
      (this.metrics.averageLatency * (this.metrics.completedTasks - 1) + latency) /
      this.metrics.completedTasks;
  }

  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) => setTimeout(() => reject(new Error("Task timeout")), ms));
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
