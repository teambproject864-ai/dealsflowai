import { Task, TaskStatus, Agent } from "./types";

export class TaskManager {
  private tasks: Map<string, Task> = new Map();
  private agentTasks: Map<string, Set<string>> = new Map(); // agentId -> taskIds
  private statusIndex: Map<TaskStatus, Set<string>> = new Map(); // status -> taskIds
  private typeIndex: Map<string, Set<string>> = new Map(); // type -> taskIds
  private tagIndex: Map<string, Set<string>> = new Map(); // tag -> taskIds

  /**
   * Creates a new task
   */
  createTask(
    task: Omit<Task, "id" | "status" | "createdAt" | "updatedAt">
  ): Task {
    const id = crypto.randomUUID();
    const now = Date.now();

    const newTask: Task = {
      ...task,
      id,
      status: TaskStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    };

    this.tasks.set(id, newTask);
    this.updateIndexes(newTask);

    return newTask;
  }

  /**
   * Gets a task by ID
   */
  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  /**
   * Updates a task
   */
  updateTask(id: string, updates: Partial<Task>): Task | undefined {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const oldStatus = task.status;
    const oldAssignedAgent = task.assignedAgentId;

    const updatedTask: Task = {
      ...task,
      ...updates,
      id,
      updatedAt: Date.now(),
    };

    // Update indexes
    if (updates.status && updates.status !== oldStatus) {
      this.removeFromStatusIndex(task);
    }
    if (updates.assignedAgentId && updates.assignedAgentId !== oldAssignedAgent) {
      if (oldAssignedAgent) {
        this.removeFromAgentIndex(task, oldAssignedAgent);
      }
    }
    if (updates.tags) {
      this.removeFromTagIndex(task);
    }

    this.tasks.set(id, updatedTask);
    this.updateIndexes(updatedTask);

    return updatedTask;
  }

  /**
   * Assigns a task to an agent
   */
  assignTask(taskId: string, agentId: string): Task | undefined {
    return this.updateTask(taskId, {
      assignedAgentId: agentId,
      status: TaskStatus.ASSIGNED,
    });
  }

  /**
   * Starts a task
   */
  startTask(taskId: string): Task | undefined {
    return this.updateTask(taskId, {
      status: TaskStatus.IN_PROGRESS,
      startedAt: Date.now(),
    });
  }

  /**
   * Completes a task
   */
  completeTask(taskId: string, result: Record<string, any>): Task | undefined {
    return this.updateTask(taskId, {
      status: TaskStatus.COMPLETED,
      result,
      completedAt: Date.now(),
    });
  }

  /**
   * Fails a task
   */
  failTask(taskId: string, error: string): Task | undefined {
    return this.updateTask(taskId, {
      status: TaskStatus.FAILED,
      error,
      completedAt: Date.now(),
    });
  }

  /**
   * Gets tasks by status
   */
  getTasksByStatus(status: TaskStatus): Task[] {
    const taskIds = this.statusIndex.get(status) || new Set();
    return Array.from(taskIds)
      .map(id => this.tasks.get(id))
      .filter((t): t is Task => t !== undefined);
  }

  /**
   * Gets tasks assigned to an agent
   */
  getAgentTasks(agentId: string): Task[] {
    const taskIds = this.agentTasks.get(agentId) || new Set();
    return Array.from(taskIds)
      .map(id => this.tasks.get(id))
      .filter((t): t is Task => t !== undefined);
  }

  /**
   * Gets pending tasks by priority
   */
  getPendingTasksByPriority(): Task[] {
    const priorityOrder: Record<string, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };

    return this.getTasksByStatus(TaskStatus.PENDING)
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  /**
   * Finds suitable agents for a task
   */
  findSuitableAgents(task: Task, agents: Agent[]): Agent[] {
    return agents.filter(agent => {
      // Agent must be idle
      if (agent.status !== "idle") return false;

      // Agent must have at least one matching capability
      const hasCapability = task.tags.some(tag => 
        agent.capabilities.includes(tag) || 
        agent.capabilities.includes(task.type)
      );

      return hasCapability;
    });
  }

  /**
   * Gets all tasks
   */
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  // Index management
  private updateIndexes(task: Task): void {
    this.addToStatusIndex(task);
    if (task.assignedAgentId) {
      this.addToAgentIndex(task, task.assignedAgentId);
    }
    this.addToTypeIndex(task);
    this.addToTagIndex(task);
  }

  private addToStatusIndex(task: Task): void {
    if (!this.statusIndex.has(task.status)) {
      this.statusIndex.set(task.status, new Set());
    }
    this.statusIndex.get(task.status)!.add(task.id);
  }

  private removeFromStatusIndex(task: Task): void {
    const ids = this.statusIndex.get(task.status);
    if (ids) {
      ids.delete(task.id);
      if (ids.size === 0) {
        this.statusIndex.delete(task.status);
      }
    }
  }

  private addToAgentIndex(task: Task, agentId: string): void {
    if (!this.agentTasks.has(agentId)) {
      this.agentTasks.set(agentId, new Set());
    }
    this.agentTasks.get(agentId)!.add(task.id);
  }

  private removeFromAgentIndex(task: Task, agentId: string): void {
    const ids = this.agentTasks.get(agentId);
    if (ids) {
      ids.delete(task.id);
      if (ids.size === 0) {
        this.agentTasks.delete(agentId);
      }
    }
  }

  private addToTypeIndex(task: Task): void {
    if (!this.typeIndex.has(task.type)) {
      this.typeIndex.set(task.type, new Set());
    }
    this.typeIndex.get(task.type)!.add(task.id);
  }

  private addToTagIndex(task: Task): void {
    for (const tag of task.tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(task.id);
    }
  }

  private removeFromTagIndex(task: Task): void {
    for (const tag of task.tags) {
      const ids = this.tagIndex.get(tag);
      if (ids) {
        ids.delete(task.id);
        if (ids.size === 0) {
          this.tagIndex.delete(tag);
        }
      }
    }
  }
}
