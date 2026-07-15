import { MAOAgent, MAOTask, MAOAgentRole } from "../portal-types";
import { MAOMessage } from "./types";
import { EventEmitter } from "events";

export abstract class MAOBaseAgent extends EventEmitter {
  protected agent: MAOAgent;
  protected messageQueue: MAOMessage[];
  protected config: { maxRetries: number; retryDelay: number; taskTimeout: number };

  constructor(id: string, role: MAOAgentRole, name: string) {
    super();
    this.agent = {
      id,
      role,
      name,
      status: "idle",
      tasksCompleted: 0,
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.messageQueue = [];
    this.config = { maxRetries: 3, retryDelay: 1000, taskTimeout: 30000 };
  }

  getAgentInfo(): MAOAgent {
    return { ...this.agent };
  }

  updateStatus(status: MAOAgent["status"]): void {
    this.agent.status = status;
    this.agent.lastActive = new Date().toISOString();
    this.emit("statusChanged", this.agent);
  }

  receiveMessage(message: MAOMessage): void {
    this.messageQueue.push(message);
    this.processMessages();
  }

  protected async processMessages(): Promise<void> {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        await this.handleMessage(message);
      }
    }
  }

  protected abstract handleMessage(message: MAOMessage): Promise<void>;

  protected abstract executeTask(task: MAOTask): Promise<Record<string, any>>;

  protected async runTaskWithRetries(task: MAOTask): Promise<Record<string, any>> {
    let lastError: Error | undefined;
    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        this.updateStatus("working");
        this.agent.currentTaskId = task.id;
        const result = await this.executeTask(task);
        this.agent.tasksCompleted++;
        this.updateStatus("idle");
        this.agent.currentTaskId = undefined;
        return result;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Agent ${this.agent.id} task failed (attempt ${attempt + 1}/${this.config.maxRetries}):`, error);
        if (attempt < this.config.maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * (attempt + 1)));
        }
      }
    }
    this.updateStatus("error");
    this.agent.currentTaskId = undefined;
    throw lastError || new Error("Task failed after multiple retries");
  }
}
