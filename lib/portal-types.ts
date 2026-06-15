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

export interface CustomerCredits {
  customerId: string;
  balance: number;
  totalPurchased: number;
  totalSpent: number;
  transactions: Array<{
    id: string;
    type: "purchase" | "consultation" | "call" | "analysis" | "message" | "bonus";
    amount: number;
    description: string;
    createdAt: string;
  }>;
}

// --- CRM Requirement Types
export type RequirementCategory = "Technical Support" | "Feature Request" | "Billing Issue" | "General Inquiry";
export type RequirementPriority = "Low" | "Medium" | "High" | "Critical";
export type RequirementStatus = "Open" | "In Progress" | "Resolved" | "Closed";

export interface Requirement {
  id: string;
  customerId: string;
  customerName: string;
  requesterName: string;
  requesterEmail: string;
  category: RequirementCategory;
  description: string;
  priority: RequirementPriority;
  status: RequirementStatus;
  assignedAgentId?: string;
  assignedAgentName?: string;
  createdAt: string;
  updatedAt: string;
}

// --- GTM Report Types
export type GTMReportType = "internal" | "customer-submitted";
export type GTMReportFrequency = "daily" | "weekly";

export interface GTMReportMetric {
  id: string;
  customerId: string;
  reportName: string;
  reportType: GTMReportType;
  reportFrequency: GTMReportFrequency;
  dateRange: {
    start: string;
    end: string;
  };
  leadConversionRate: number;
  marketPenetration: number;
  pipelineValue: number;
  campaignEffectiveness: number;
  region?: string;
  segment?: string;
  dailyMetrics?: Array<{
    date: string;
    leadConversionRate: number;
    marketPenetration: number;
    pipelineValue: number;
    campaignEffectiveness: number;
  }>;
  weeklyTrendComparisons?: Array<{
    weekStart: string;
    weekEnd: string;
    leadConversionRateChange: number;
    marketPenetrationChange: number;
    pipelineValueChange: number;
    campaignEffectivenessChange: number;
  }>;
  actionableSuggestions: Array<{
    id: string;
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    estimatedImpact: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledReport {
  id: string;
  customerId: string;
  reportFrequency: GTMReportFrequency;
  recipients: string[];
  fileFormats: Array<"pdf" | "xlsx">;
  enabled: boolean;
  nextSendDate: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  customerId: string;
  requesterName: string;
  requesterEmail: string;
  category: "technical-support" | "feature-request" | "billing" | "general";
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "resolved" | "closed";
  assignedAgentId?: string;
  assignedAgentName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  inAppNotifications: boolean;
  preferredReportFormats: Array<"pdf" | "xlsx" | "csv">;
  dailyReportTime: string;
  weeklyReportDay: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
}

export interface CustomerGTMData {
  id: string;
  customerId: string;
  submittedBy: string;
  submittedAt: string;
  data: Record<string, any>;
  attachments?: FileAttachment[];
}
