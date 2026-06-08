export enum AgentRole {
  RESEARCH = "research",
  DATA_ANALYSIS = "data_analysis",
  FACT_CHECKING = "fact_checking",
  SYNTHESIS = "synthesis",
}

export enum TaskStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: "task" | "result" | "error" | "status";
  content: any;
  timestamp: number;
}

export interface AgentTask {
  id: string;
  assignedTo: AgentRole;
  status: TaskStatus;
  input: any;
  output?: any;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AgentState {
  id: string;
  role: AgentRole;
  currentTask?: AgentTask;
  available: boolean;
  lastActive: number;
}

export interface ResearchInput {
  query: string;
  context?: string;
}

export interface ResearchOutput {
  findings: string[];
  sources: string[];
  summary: string;
}

export interface DataAnalysisInput {
  data: any[];
  analysisType: "descriptive" | "inferential" | "predictive";
}

export interface DataAnalysisOutput {
  insights: string[];
  charts?: any[];
  statistics: Record<string, any>;
}

export interface FactCheckingInput {
  claims: string[];
  sources: string[];
}

export interface FactCheckingOutput {
  verifiedClaims: Array<{
    claim: string;
    verified: boolean;
    confidence: number;
    evidence: string;
  }>;
}

export interface SynthesisInput {
  research: ResearchOutput;
  analysis: DataAnalysisOutput;
  factCheck: FactCheckingOutput;
}

export interface SynthesisOutput {
  finalReport: string;
  keyTakeaways: string[];
  recommendations: string[];
}
