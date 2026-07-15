import { MAOAgent, MAOTask, MAOAgentRole, MAOTaskStatus, MAOMetrics } from "../portal-types";

export interface MAOMessage {
  id: string;
  from: string;
  to: string;
  type: "task" | "result" | "error" | "status";
  content: any;
  timestamp: number;
}

export interface MAOAgentConfig {
  maxRetries: number;
  retryDelay: number;
  taskTimeout: number;
}
