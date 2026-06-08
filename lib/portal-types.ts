// --- Portal & Agent Workspace Core Types ---

export interface PortalUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "agent" | "customer";
  createdAt: string;
}

export type TaskStatus = "todo" | "in-progress" | "completed" | "blocked";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedAgentId: string;
  customerId: string;
  priority: "urgent" | "high" | "medium" | "low";
  progressNotes: string[];
  milestones: Array<{
    id: string;
    title: string;
    completed: boolean;
    completedAt?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface FileAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  senderRole: "admin" | "agent" | "customer";
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: FileAttachment[];
}

export interface PortalCallRecord {
  id: string;
  sessionId: string;
  callerId: string;
  callerName: string;
  callerRole: "admin" | "agent" | "customer";
  receiverId: string;
  receiverName: string;
  receiverRole: "admin" | "agent" | "customer";
  status: "completed" | "failed" | "canceled" | "scheduled" | "in-progress";
  duration: number;
  startedAt: string;
  endedAt?: string;
}

export interface CustomerFeedback {
  id: string;
  sessionId: string;
  agentId: string;
  customerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AgentPerformanceMetrics {
  agentId: string;
  periodStart: string;
  periodEnd: string;
  tasksCompleted: number;
  totalTasks: number;
  averageResolutionTime: number;
  averageRating: number;
  totalInteractions: number;
  totalFeedback: number;
}

export interface AgentCredits {
  agentId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  transactions: Array<{
    id: string;
    type: "onboarding" | "lead" | "call" | "analysis" | "message";
    amount: number;
    description: string;
    createdAt: string;
  }>;
}
