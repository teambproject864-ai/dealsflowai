import {
  AgentRole,
  AgentTask,
  TaskStatus,
  AgentMessage,
  ResearchInput,
  DataAnalysisInput,
  FactCheckingInput,
  SynthesisInput,
  SynthesisOutput,
} from "./types";
import { MessageQueue } from "./message-queue";
import { ResearchAgent } from "./research-agent";
import { DataAnalysisAgent } from "./data-analysis-agent";
import { FactCheckingAgent } from "./fact-checking-agent";
import { SynthesisAgent } from "./synthesis-agent";
import { KimiClient } from "../kimi";

export class Orchestrator {
  private messageQueue: MessageQueue;
  private agents: Map<AgentRole, any[]>;
  private tasks: Map<string, AgentTask>;
  private kimiClient: KimiClient;
  private workflowCallbacks: Map<string, (output: SynthesisOutput) => void>;

  constructor(kimiClient: KimiClient) {
    this.messageQueue = new MessageQueue();
    this.agents = new Map();
    this.tasks = new Map();
    this.kimiClient = kimiClient;
    this.workflowCallbacks = new Map();
    this.initializeAgents();
    this.startListening();
  }

  private initializeAgents(): void {
    // Initialize agents
    const researchAgent = new ResearchAgent("research-1", this.messageQueue, this.kimiClient);
    const dataAnalysisAgent = new DataAnalysisAgent("analysis-1", this.messageQueue, this.kimiClient);
    const factCheckingAgent = new FactCheckingAgent("fact-check-1", this.messageQueue, this.kimiClient);
    const synthesisAgent = new SynthesisAgent("synthesis-1", this.messageQueue, this.kimiClient);

    this.agents.set(AgentRole.RESEARCH, [researchAgent]);
    this.agents.set(AgentRole.DATA_ANALYSIS, [dataAnalysisAgent]);
    this.agents.set(AgentRole.FACT_CHECKING, [factCheckingAgent]);
    this.agents.set(AgentRole.SYNTHESIS, [synthesisAgent]);
  }

  private startListening(): void {
    this.messageQueue.subscribe("orchestrator", async (message) => {
      if (message.type === "result" || message.type === "error") {
        await this.handleAgentResponse(message);
      }
    });
  }

  private async handleAgentResponse(message: AgentMessage): Promise<void> {
    const task = message.content as AgentTask;
    this.tasks.set(task.id, task);

    if (message.type === "error") {
      console.error(`Task ${task.id} failed:`, task.error);
      return;
    }

    // Handle workflow completion
    if (task.assignedTo === AgentRole.SYNTHESIS) {
      const callback = this.workflowCallbacks.get(task.id);
      if (callback) {
        callback(task.output);
        this.workflowCallbacks.delete(task.id);
      }
    }
  }

  async runResearchWorkflow(
    query: string,
    data?: any[]
  ): Promise<SynthesisOutput> {
    const workflowId = crypto.randomUUID();

    return new Promise((resolve) => {
      this.workflowCallbacks.set(workflowId, resolve);
      this.startWorkflowStep1(workflowId, query, data);
    });
  }

  private startWorkflowStep1(workflowId: string, query: string, data?: any[]): void {
    const researchInput: ResearchInput = { query };
    const taskId = crypto.randomUUID();

    this.tasks.set(taskId, {
      id: taskId,
      assignedTo: AgentRole.RESEARCH,
      status: TaskStatus.PENDING,
      input: researchInput,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    this.messageQueue.send({
      id: crypto.randomUUID(),
      from: "orchestrator",
      to: "research-1",
      type: "task",
      content: { taskId, input: researchInput, workflowId, data },
      timestamp: Date.now(),
    });

    // Wait for research result, then proceed
    setTimeout(() => {
      this.startWorkflowStep2(workflowId, data);
    }, 2000);
  }

  private startWorkflowStep2(workflowId: string, data?: any[]): void {
    if (data) {
      const analysisInput: DataAnalysisInput = {
        data,
        analysisType: "descriptive",
      };
      const taskId = crypto.randomUUID();

      this.tasks.set(taskId, {
        id: taskId,
        assignedTo: AgentRole.DATA_ANALYSIS,
        status: TaskStatus.PENDING,
        input: analysisInput,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      this.messageQueue.send({
        id: crypto.randomUUID(),
        from: "orchestrator",
        to: "analysis-1",
        type: "task",
        content: { taskId, input: analysisInput, workflowId },
        timestamp: Date.now(),
      });
    }

    setTimeout(() => {
      this.startWorkflowStep3(workflowId);
    }, 2000);
  }

  private startWorkflowStep3(workflowId: string): void {
    const factCheckInput: FactCheckingInput = {
      claims: ["Sample claim"],
      sources: ["Sample source"],
    };
    const taskId = crypto.randomUUID();

    this.tasks.set(taskId, {
      id: taskId,
      assignedTo: AgentRole.FACT_CHECKING,
      status: TaskStatus.PENDING,
      input: factCheckInput,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    this.messageQueue.send({
      id: crypto.randomUUID(),
      from: "orchestrator",
      to: "fact-check-1",
      type: "task",
      content: { taskId, input: factCheckInput, workflowId },
      timestamp: Date.now(),
    });

    setTimeout(() => {
      this.startWorkflowStep4(workflowId);
    }, 2000);
  }

  private startWorkflowStep4(workflowId: string): void {
    const synthesisInput: SynthesisInput = {
      research: { findings: ["Finding"], sources: ["Source"], summary: "Summary" },
      analysis: { insights: ["Insight"], statistics: {} },
      factCheck: { verifiedClaims: [{ claim: "Claim", verified: true, confidence: 0.9, evidence: "Evidence" }] },
    };

    this.messageQueue.send({
      id: crypto.randomUUID(),
      from: "orchestrator",
      to: "synthesis-1",
      type: "task",
      content: { taskId: workflowId, input: synthesisInput },
      timestamp: Date.now(),
    });
  }

  getTasks(): AgentTask[] {
    return Array.from(this.tasks.values());
  }
}
