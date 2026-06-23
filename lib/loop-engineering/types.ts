
export enum LoopPhase {
  REQUIREMENT_PARSE = "requirement_parse",
  TASK_DECOMPOSITION = "task_decomposition",
  CODE_GENERATION = "code_generation",
  VALIDATION = "validation",
  SELF_IMPROVEMENT = "self_improvement",
  DEPLOYMENT = "deployment"
}

export enum LoopStatus {
  IDLE = "idle",
  RUNNING = "running",
  PAUSED = "paused",
  COMPLETED = "completed",
  FAILED = "failed"
}

export enum AgentType {
  REQUIREMENT_ANALYST = "requirement_analyst",
  TASK_DECOMPOSER = "task_decomposer",
  CODE_GENERATOR = "code_generator",
  TESTING_AGENT = "testing_agent",
  MONITORING_AGENT = "monitoring_agent",
  IMPROVEMENT_AGENT = "improvement_agent"
}

export interface LoopIteration {
  id: string;
  loopId: string;
  phase: LoopPhase;
  startedAt: number;
  completedAt?: number;
  status: LoopStatus;
  metrics?: Record<string, any>;
  output?: any;
  error?: string;
}

export interface LoopMetrics {
  totalIterations: number;
  totalTime: number;
  averageTimePerIteration: number;
  errorRate: number;
  improvementRate: number;
  tasksCompleted: number;
}

export interface FeedbackItem {
  id: string;
  loopId: string;
  iterationId?: string;
  type: "performance" | "quality" | "bug" | "suggestion";
  content: string;
  timestamp: number;
  source: "user" | "agent" | "system" | "monitor";
  priority: "low" | "medium" | "high" | "critical";
  processed: boolean;
}

export interface LoopConfiguration {
  id: string;
  name: string;
  projectId: string;
  maxIterations: number;
  targetErrorRate: number;
  enableSelfImprovement: boolean;
  phases: LoopPhase[];
}

export interface LoopState {
  id: string;
  config: LoopConfiguration;
  status: LoopStatus;
  currentPhase: LoopPhase;
  currentIteration: number;
  iterations: LoopIteration[];
  metrics: LoopMetrics;
  feedback: FeedbackItem[];
  startedAt: number;
  completedAt?: number;
}

