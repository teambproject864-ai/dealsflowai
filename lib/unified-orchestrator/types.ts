export enum TaskStatus {
  PENDING = "pending",
  ASSIGNED = "assigned",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export interface Task {
  id: string;
  type: string;
  description?: string;
  input: Record<string, any>;
  status: TaskStatus;
  assignedAgentId?: string;
  result?: Record<string, any>;
  error?: string;
  priority: "low" | "medium" | "high" | "critical";
  tags: string[];
  createdAt: number;
  updatedAt: number;
  startedAt?: number;
  completedAt?: number;
  deadline?: number;
  metadata: Record<string, any>;
}

export interface Agent {
  id: string;
  name: string;
  type: string;
  capabilities: string[];
  status: "idle" | "busy" | "offline";
  currentTaskId?: string;
  lastActive: number;
  metadata: Record<string, any>;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  tasks: string[]; // Task IDs in order
  status: "pending" | "running" | "completed" | "failed";
  currentTaskIndex: number;
  createdAt: number;
  updatedAt: number;
  metadata: Record<string, any>;
}

export interface OrchestratorEvent {
  id: string;
  type: "task_created" | "task_assigned" | "task_completed" | "task_failed" | "agent_registered" | "workflow_started" | "workflow_completed";
  timestamp: number;
  data: Record<string, any>;
}
