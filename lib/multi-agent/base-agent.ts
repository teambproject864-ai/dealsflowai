import { AgentRole, AgentState, AgentTask, AgentMessage, TaskStatus } from "./types";
import { MessageQueue } from "./message-queue";
import { KimiClient } from "../kimi";

export abstract class BaseAgent {
  protected state: AgentState;
  protected messageQueue: MessageQueue;
  protected kimiClient: KimiClient;

  constructor(
    id: string,
    role: AgentRole,
    messageQueue: MessageQueue,
    kimiClient: KimiClient
  ) {
    this.state = {
      id,
      role,
      available: true,
      lastActive: Date.now(),
    };
    this.messageQueue = messageQueue;
    this.kimiClient = kimiClient;
    this.startListening();
  }

  getState(): AgentState {
    return { ...this.state };
  }

  protected abstract executeTask(task: AgentTask): Promise<any>;

  private startListening(): void {
    this.messageQueue.subscribe(this.state.id, async (message) => {
      if (message.type === "task") {
        await this.handleTask(message);
      }
    });
  }

  private async handleTask(message: AgentMessage): Promise<void> {
    const task: AgentTask = {
      id: message.content.taskId,
      assignedTo: this.state.role,
      status: TaskStatus.IN_PROGRESS,
      input: message.content.input,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.state.currentTask = task;
    this.state.available = false;
    this.state.lastActive = Date.now();

    try {
      const output = await this.executeTask(task);
      task.status = TaskStatus.COMPLETED;
      task.output = output;
      this.sendResult(message.from, task);
    } catch (error: any) {
      task.status = TaskStatus.FAILED;
      task.error = error.message;
      this.sendError(message.from, task);
    } finally {
      this.state.available = true;
      this.state.currentTask = undefined;
      this.state.lastActive = Date.now();
    }
  }

  protected sendResult(to: string, task: AgentTask): void {
    this.messageQueue.send({
      id: crypto.randomUUID(),
      from: this.state.id,
      to,
      type: "result",
      content: task,
      timestamp: Date.now(),
    });
  }

  protected sendError(to: string, task: AgentTask): void {
    this.messageQueue.send({
      id: crypto.randomUUID(),
      from: this.state.id,
      to,
      type: "error",
      content: task,
      timestamp: Date.now(),
    });
  }
}
