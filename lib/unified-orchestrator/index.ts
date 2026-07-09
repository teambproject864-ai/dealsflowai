import { TaskManager } from "./task-manager";
import { ObservabilitySystem } from "./observability";
import { Task, Agent, Workflow, OrchestratorEvent, TaskStatus } from "./types";
import { A2AMessageBus, A2AMessageType, A2AAgentInfo } from "../a2a";
import { GraphRAGSystem } from "../graph-rag";
import { ContextGraphLayer, MemoryType, AccessLevel } from "../context-graph";

export class UnifiedOrchestrator {
  private taskManager: TaskManager;
  private observability: ObservabilitySystem;
  private messageBus: A2AMessageBus;
  private graphRAG: GraphRAGSystem;
  private contextGraph: ContextGraphLayer;
  private agents: Map<string, Agent> = new Map();
  private workflows: Map<string, Workflow> = new Map();
  private isRunning: boolean = false;
  private pollInterval?: NodeJS.Timeout;

  constructor(options: {
    messageBus: A2AMessageBus;
    graphRAG: GraphRAGSystem;
    contextGraph: ContextGraphLayer;
  }) {
    this.taskManager = new TaskManager();
    this.observability = new ObservabilitySystem();
    this.messageBus = options.messageBus;
    this.graphRAG = options.graphRAG;
    this.contextGraph = options.contextGraph;

    this.setupMessageHandlers();
  }

  /**
   * Starts the orchestrator
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Start polling for pending tasks
    this.pollInterval = setInterval(() => this.pollTasks(), 1000);

    console.log("Unified Orchestrator started");
  }

  /**
   * Stops the orchestrator
   */
  stop(): void {
    this.isRunning = false;
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = undefined;
    }
    console.log("Unified Orchestrator stopped");
  }

  /**
   * Registers an agent
   */
  registerAgent(agent: Omit<Agent, "status" | "lastActive">): Agent {
    const now = Date.now();
    const newAgent: Agent = {
      ...agent,
      status: "idle",
      lastActive: now,
    };

    this.agents.set(agent.id, newAgent);

    // Register with message bus
    this.messageBus.registerAgent({
      id: agent.id,
      name: agent.name,
      type: agent.type,
      capabilities: agent.capabilities.map(c => ({ name: c, version: "1.0", supportedOperations: ["execute"] })),
      status: "online",
      lastSeen: now,
      metadata: agent.metadata,
    });

    // Record event
    this.recordEvent({
      type: "agent_registered",
      data: { agentId: agent.id, agent },
    });

    // Store in context graph
    this.contextGraph.storeAgentState(agent.id, { agent });

    return newAgent;
  }

  /**
   * Creates a new task
   */
  createTask(
    task: Omit<Task, "id" | "status" | "createdAt" | "updatedAt">
  ): Task {
    const span = this.observability.startSpan("create_task", {
      attributes: { taskType: task.type },
    });

    const newTask = this.taskManager.createTask(task);

    // Record event
    this.recordEvent({
      type: "task_created",
      data: { taskId: newTask.id, task: newTask },
    });

    // Store in context graph
    this.contextGraph.storeInteraction("orchestrator", {
      action: "create_task",
      taskId: newTask.id,
      taskType: newTask.type,
    });

    this.observability.endSpan(span.id);
    return newTask;
  }

  /**
   * Gets a task
   */
  getTask(taskId: string): Task | undefined {
    return this.taskManager.getTask(taskId);
  }

  /**
   * Gets all tasks
   */
  getAllTasks(): Task[] {
    return this.taskManager.getAllTasks();
  }

  /**
   * Gets all agents
   */
  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Queries Graph RAG
   */
  async queryGraphRAG(query: string) {
    const span = this.observability.startSpan("graph_rag_query", {
      attributes: { query },
    });

    try {
      const result = await this.graphRAG.query({
        text: query,
        includeVectorSearch: true,
        includeGraphTraversal: true,
      });

      this.observability.endSpan(span.id, "ok");
      return result;
    } catch (error) {
      this.observability.endSpan(span.id, "error");
      throw error;
    }
  }

  /**
   * Gets observability statistics
   */
  getStatistics() {
    return {
      ...this.observability.getStatistics(),
      totalTasks: this.taskManager.getAllTasks().length,
      totalAgents: this.agents.size,
      pendingTasks: this.taskManager.getTasksByStatus(TaskStatus.PENDING).length,
      inProgressTasks: this.taskManager.getTasksByStatus(TaskStatus.IN_PROGRESS).length,
      completedTasks: this.taskManager.getTasksByStatus(TaskStatus.COMPLETED).length,
    };
  }

  /**
   * Gets recent events
   */
  getRecentEvents(limit?: number) {
    return this.observability.getEvents(limit);
  }

  /**
   * Gets task manager
   */
  getTaskManager(): TaskManager {
    return this.taskManager;
  }

  /**
   * Gets observability system
   */
  getObservability(): ObservabilitySystem {
    return this.observability;
  }

  // Private methods
  private setupMessageHandlers(): void {
    this.messageBus.subscribe("orchestrator", async (message) => {
      await this.handleMessage(message);
    });
  }

  private async handleMessage(message: any): Promise<void> {
    this.observability.recordMetric("messages_received", 1);
    
    switch (message.type) {
      case A2AMessageType.TASK_RESULT:
        await this.handleTaskResult(message);
        break;
      case A2AMessageType.TASK_ERROR:
        await this.handleTaskError(message);
        break;
      case A2AMessageType.TASK_STATUS:
        await this.handleTaskStatus(message);
        break;
      case A2AMessageType.HEARTBEAT:
        await this.handleHeartbeat(message);
        break;
    }
  }

  private async handleTaskResult(message: any): Promise<void> {
    const { taskId, result } = message.payload;
    const task = this.taskManager.completeTask(taskId, result);
    
    if (task) {
      this.recordEvent({
        type: "task_completed",
        data: { taskId, result },
      });

      // Store task outcome
      this.contextGraph.storeTaskOutcome(task.assignedAgentId || "unknown", taskId, {
        result,
        status: "completed",
      });

      // Update agent status
      if (task.assignedAgentId) {
        const agent = this.agents.get(task.assignedAgentId);
        if (agent) {
          agent.status = "idle";
          agent.currentTaskId = undefined;
          agent.lastActive = Date.now();
        }
      }
    }
  }

  private async handleTaskError(message: any): Promise<void> {
    const { taskId, error } = message.payload;
    const task = this.taskManager.failTask(taskId, error);
    
    if (task) {
      this.recordEvent({
        type: "task_failed",
        data: { taskId, error },
      });

      // Update agent status
      if (task.assignedAgentId) {
        const agent = this.agents.get(task.assignedAgentId);
        if (agent) {
          agent.status = "idle";
          agent.currentTaskId = undefined;
          agent.lastActive = Date.now();
        }
      }
    }
  }

  private async handleTaskStatus(message: any): Promise<void> {
    const { taskId, status } = message.payload;
    if (status === "in_progress") {
      this.taskManager.startTask(taskId);
    }
  }

  private async handleHeartbeat(message: any): Promise<void> {
    const { agentInfo } = message.payload;
    const agent = this.agents.get(agentInfo.id);
    if (agent) {
      agent.lastActive = Date.now();
      agent.status = agentInfo.status === "busy" ? "busy" : "idle";
    }
  }

  private pollTasks(): void {
    if (!this.isRunning) return;

    const span = this.observability.startSpan("poll_tasks");
    
    try {
      // Get pending tasks by priority
      const pendingTasks = this.taskManager.getPendingTasksByPriority();
      
      // Get idle agents
      const idleAgents = Array.from(this.agents.values()).filter(a => a.status === "idle");

      for (const task of pendingTasks) {
        // Find suitable agent
        const suitableAgents = this.taskManager.findSuitableAgents(task, idleAgents);
        
        if (suitableAgents.length > 0) {
          const agent = suitableAgents[0];
          this.assignTaskToAgent(task, agent);
          
          // Remove agent from idle list
          const index = idleAgents.indexOf(agent);
          if (index > -1) {
            idleAgents.splice(index, 1);
          }
        }
      }
    } catch (error) {
      console.error("Error polling tasks:", error);
    }

    this.observability.endSpan(span.id);
  }

  private assignTaskToAgent(task: Task, agent: Agent): void {
    const span = this.observability.startSpan("assign_task", {
      attributes: { taskId: task.id, agentId: agent.id },
    });

    // Update task
    this.taskManager.assignTask(task.id, agent.id);
    this.taskManager.startTask(task.id);

    // Update agent
    agent.status = "busy";
    agent.currentTaskId = task.id;
    agent.lastActive = Date.now();

    // Send task via message bus
    this.messageBus.createAndSendMessage(
      "orchestrator",
      agent.id,
      A2AMessageType.TASK_DELEGATION,
      {
        taskId: task.id,
        taskType: task.type,
        input: task.input,
      }
    );

    // Record event
    this.recordEvent({
      type: "task_assigned",
      data: { taskId: task.id, agentId: agent.id },
    });

    this.observability.endSpan(span.id);
  }

  private recordEvent(data: Omit<OrchestratorEvent, "id" | "timestamp">): void {
    const event: OrchestratorEvent = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      ...data,
    };
    this.observability.recordEvent(event);
  }
}

export * from "./types";
export * from "./task-manager";
export * from "./observability";
