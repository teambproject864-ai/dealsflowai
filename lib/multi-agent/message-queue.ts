import { AgentMessage } from "./types";

export class MessageQueue {
  private queues: Map<string, AgentMessage[]> = new Map();
  private subscribers: Map<string, Set<(msg: AgentMessage) => void>> = new Map();

  send(message: AgentMessage): void {
    if (!this.queues.has(message.to)) {
      this.queues.set(message.to, []);
    }
    this.queues.get(message.to)!.push(message);
    this.notifySubscribers(message.to, message);
  }

  receive(agentId: string): AgentMessage | null {
    const queue = this.queues.get(agentId);
    if (!queue || queue.length === 0) return null;
    return queue.shift()!;
  }

  subscribe(agentId: string, callback: (msg: AgentMessage) => void): () => void {
    if (!this.subscribers.has(agentId)) {
      this.subscribers.set(agentId, new Set());
    }
    this.subscribers.get(agentId)!.add(callback);
    return () => {
      this.subscribers.get(agentId)?.delete(callback);
    };
  }

  private notifySubscribers(agentId: string, message: AgentMessage): void {
    this.subscribers.get(agentId)?.forEach(callback => callback(message));
  }
}
