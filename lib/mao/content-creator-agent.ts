import { MAOBaseAgent } from "./base-agent";
import { MAOMessage } from "./types";
import { MAOTask } from "../portal-types";

export class ContentCreatorAgent extends MAOBaseAgent {
  constructor(id: string) {
    super(id, "content-creator", "Content Creator Agent");
  }

  protected async handleMessage(message: MAOMessage): Promise<void> {
    if (message.type === "task") {
      const { taskId, input } = message.content;
      const task: MAOTask = {
        id: taskId,
        type: "content-generation",
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
    // Simulate content generation
    const { contentType, topic, tone, keywords } = task.inputData;
    return {
      content: `Generated ${contentType} about "${topic}" in ${tone} tone. Keywords: ${(keywords || []).join(", ")}`,
      title: `${contentType === "blog-post" ? "The Ultimate Guide to " + topic : topic}`,
      metadata: {
        keywords: keywords || [],
        seoTitle: topic,
        seoDescription: `Learn about ${topic} in this comprehensive guide.`,
      },
    };
  }
}
