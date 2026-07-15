import { MAOAgent, MAOTask, MAOMetrics, MAOAgentRole } from "../portal-types";
import { MAOMessage } from "./types";
import { ContentCreatorAgent } from "./content-creator-agent";
import { AudienceSegmenterAgent } from "./audience-segmenter-agent";
import { CampaignOptimizerAgent } from "./campaign-optimizer-agent";
import { PerformanceAnalystAgent } from "./performance-analyst-agent";
import { MAOBaseAgent } from "./base-agent";
import EventEmitter from "events";

export class MAOOrchestrator extends EventEmitter {
  private agents: Map<string, MAOBaseAgent>;
  private tasks: Map<string, MAOTask>;
  private taskQueue: string[];
  private agentPools: Map<MAOAgentRole, string[]>;
  private startTime: number;

  constructor(initialAgentCount: number = 4) {
    super();
    this.agents = new Map();
    this.tasks = new Map();
    this.taskQueue = [];
    this.agentPools = new Map();
    this.startTime = Date.now();

    // Initialize agent pools
    this.initializeAgents(initialAgentCount);
  }

  private initializeAgents(count: number): void {
    const roles: MAOAgentRole[] = ["content-creator", "audience-segmenter", "campaign-optimizer", "performance-analyst"];
    
    roles.forEach(role => {
      this.agentPools.set(role, []);
      for (let i = 0; i < Math.ceil(count / roles.length); i++) {
        this.createAgent(role);
      }
    });
  }

  private createAgent(role: MAOAgentRole): string {
    let agent: MAOBaseAgent;
    const id = `${role}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    switch (role) {
      case "content-creator":
        agent = new ContentCreatorAgent(id);
        break;
      case "audience-segmenter":
        agent = new AudienceSegmenterAgent(id);
        break;
      case "campaign-optimizer":
        agent = new CampaignOptimizerAgent(id);
        break;
      case "performance-analyst":
        agent = new PerformanceAnalystAgent(id);
        break;
      default:
        throw new Error(`Unknown agent role: ${role}`);
    }

    this.agents.set(id, agent);
    const pool = this.agentPools.get(role)!;
    pool.push(id);
    
    // Set up event listeners
    agent.on("taskCompleted", ({ taskId, output }) => {
      this.handleTaskCompletion(taskId, output);
    });
    agent.on("taskFailed", ({ taskId, error }) => {
      this.handleTaskFailure(taskId, error);
    });
    agent.on("statusChanged", (agentInfo) => {
      this.emit("agentStatusChanged", agentInfo);
    });

    return id;
  }

  public getMetrics(): MAOMetrics {
    const totalAgents = this.agents.size;
    const activeAgents = Array.from(this.agents.values()).filter(a => a.getAgentInfo().status === "working").length;
    const tasksPending = this.taskQueue.length;
    const tasksInProgress = Array.from(this.tasks.values()).filter(t => t.status === "in-progress" || t.status === "assigned").length;
    const tasksCompleted = Array.from(this.tasks.values()).filter(t => t.status === "completed").length;
    const tasksFailed = Array.from(this.tasks.values()).filter(t => t.status === "failed").length;
    
    const completedTasks = Array.from(this.tasks.values()).filter(t => t.completedAt && t.startedAt);
    const averageTaskDuration = completedTasks.length > 0 
      ? completedTasks.reduce((sum, t) => sum + (new Date(t.completedAt!).getTime() - new Date(t.startedAt!).getTime()), 0) / completedTasks.length
      : 0;
    
    const systemUptime = (Date.now() - this.startTime) / 1000;

    return {
      activeAgents,
      totalAgents,
      tasksPending,
      tasksInProgress,
      tasksCompleted,
      tasksFailed,
      averageTaskDuration,
      systemUptime,
    };
  }

  public getAgents(): MAOAgent[] {
    return Array.from(this.agents.values()).map(agent => agent.getAgentInfo());
  }

  public getTasks(): MAOTask[] {
    return Array.from(this.tasks.values());
  }

  public submitTask(type: MAOTask["type"], customerId: string, inputData: Record<string, any>, priority: MAOTask["priority"] = "medium"): string {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const task: MAOTask = {
      id: taskId,
      type,
      status: "pending",
      customerId,
      inputData,
      createdAt: new Date().toISOString(),
      priority,
    };

    this.tasks.set(taskId, task);
    this.taskQueue.push(taskId);
    this.emit("taskSubmitted", task);
    this.processQueue();

    return taskId;
  }

  private processQueue(): void {
    while (this.taskQueue.length > 0) {
      const taskId = this.taskQueue[0];
      const task = this.tasks.get(taskId);
      if (!task) {
        this.taskQueue.shift();
        continue;
      }

      const agentRole = this.getRequiredAgentRole(task.type);
      const availableAgentId = this.getAvailableAgent(agentRole);
      
      if (availableAgentId) {
        this.assignTask(taskId, availableAgentId);
        this.taskQueue.shift();
      } else {
        // No available agent, check if we can scale up
        if (this.agents.size < 50) {
          this.createAgent(agentRole);
        }
        break; // Wait for an agent to become available
      }
    }
  }

  private getRequiredAgentRole(taskType: MAOTask["type"]): MAOAgentRole {
    switch (taskType) {
      case "content-generation":
        return "content-creator";
      case "audience-analysis":
        return "audience-segmenter";
      case "campaign-optimization":
        return "campaign-optimizer";
      case "performance-report":
        return "performance-analyst";
      default:
        throw new Error(`Unknown task type: ${taskType}`);
    }
  }

  private getAvailableAgent(role: MAOAgentRole): string | undefined {
    const pool = this.agentPools.get(role);
    if (!pool) return undefined;

    for (const agentId of pool) {
      const agent = this.agents.get(agentId);
      if (agent && agent.getAgentInfo().status === "idle") {
        return agentId;
      }
    }
    return undefined;
  }

  private assignTask(taskId: string, agentId: string): void {
    const task = this.tasks.get(taskId);
    const agent = this.agents.get(agentId);
    if (!task || !agent) return;

    task.status = "assigned";
    task.assignedAgentId = agentId;
    this.tasks.set(taskId, task);

    const message: MAOMessage = {
      id: `msg-${Date.now()}`,
      from: "orchestrator",
      to: agentId,
      type: "task",
      content: { taskId, input: task.inputData },
      timestamp: Date.now(),
    };

    agent.receiveMessage(message);
    task.status = "in-progress";
    task.startedAt = new Date().toISOString();
    this.tasks.set(taskId, task);
    this.emit("taskAssigned", { taskId, agentId });
  }

  private handleTaskCompletion(taskId: string, output: Record<string, any>): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = "completed";
    task.outputData = output;
    task.completedAt = new Date().toISOString();
    this.tasks.set(taskId, task);
    this.emit("taskCompleted", task);
    this.processQueue();
  }

  private handleTaskFailure(taskId: string, error: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = "failed";
    task.error = error;
    this.tasks.set(taskId, task);
    this.emit("taskFailed", { taskId, error });
    this.processQueue();
  }

  public scaleUp(count: number = 1): void {
    const roles: MAOAgentRole[] = ["content-creator", "audience-segmenter", "campaign-optimizer", "performance-analyst"];
    for (let i = 0; i < count; i++) {
      const role = roles[i % roles.length];
      this.createAgent(role);
    }
  }

  public scaleDown(count: number = 1): void {
    const agentIds = Array.from(this.agents.keys()).filter(id => {
      const agent = this.agents.get(id);
      return agent && agent.getAgentInfo().status === "idle";
    });

    for (let i = 0; i < count && agentIds.length > 0; i++) {
      const agentId = agentIds.pop()!;
      this.removeAgent(agentId);
    }
  }

  private removeAgent(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    const pool = this.agentPools.get(agent.getAgentInfo().role);
    if (pool) {
      const index = pool.indexOf(agentId);
      if (index > -1) pool.splice(index, 1);
    }

    this.agents.delete(agentId);
  }
}

// Singleton instance
let orchestratorInstance: MAOOrchestrator | null = null;

export function getMAOOrchestrator(): MAOOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new MAOOrchestrator(4);
  }
  return orchestratorInstance;
}
