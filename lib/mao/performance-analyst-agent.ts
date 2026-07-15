import { MAOBaseAgent } from "./base-agent";
import { MAOMessage } from "./types";
import { MAOTask } from "../portal-types";

export class PerformanceAnalystAgent extends MAOBaseAgent {
  constructor(id: string) {
    super(id, "performance-analyst", "Performance Analyst Agent");
  }

  protected async handleMessage(message: MAOMessage): Promise<void> {
    if (message.type === "task") {
      const { taskId, input } = message.content;
      const task: MAOTask = {
        id: taskId,
        type: "performance-report",
        status: "in-progress",
        customerId: input.customerId,
        inputData: input,
        createdAt: new Date().toISOString(),
        startedAt: new Date().toISOString(),
        priority: input.priority || "medium",
      };
      try {
        const output = await this.runTaskWithRetries(task);
        this.emit("taskCompleted", { taskId, output });
      } catch (error) {
        this.emit("taskFailed", { taskId, error: (error as Error).message });
      }
    }
  }

  protected async executeTask(task: MAOTask): Promise<Record<string, any>> {
    // Simulate performance analysis
    const { timeRange, metrics } = task.inputData;
    return {
      summary: `Performance report for ${timeRange}`,
      keyMetrics: {
        conversionRate: 8.5,
        ctr: 2.3,
        roas: 4.2,
        impressions: 125000,
        clicks: 2875,
        conversions: 244,
      },
      insights: ["CTR improved 15% week-over-week", "ROAS strong at 4.2"],
      recommendations: ["Increase budget on high-performing channels"],
    };
  }
}
