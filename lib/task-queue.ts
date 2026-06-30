import { logger } from './logger';

// Interface for a task in our queue
interface QueuedTask {
  id: string;
  name: string;
  handler: () => Promise<void>;
  priority: number;
  createdAt: number;
}

class AsyncTaskQueue {
  private queue: QueuedTask[];
  private isProcessing: boolean;
  private maxConcurrent: number;

  constructor(maxConcurrent = 2) {
    this.queue = [];
    this.isProcessing = false;
    this.maxConcurrent = maxConcurrent;
  }

  // Add a task to the queue with optional priority
  addTask(name: string, handler: () => Promise<void>, priority = 0) {
    const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const task: QueuedTask = {
      id,
      name,
      handler,
      priority,
      createdAt: Date.now(),
    };

    // Insert task into queue based on priority (higher = processed first)
    const index = this.queue.findIndex((t) => t.priority < priority);
    if (index === -1) {
      this.queue.push(task);
    } else {
      this.queue.splice(index, 0, task);
    }

    logger.info(`[TaskQueue] Added task: ${name} (ID: ${id})`);
    this.processQueue();
    return id;
  }

  // Process the queue
  private async processQueue() {
    if (this.isProcessing) return;
    if (this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      // Take the first task from queue
      const task = this.queue.shift();
      if (!task) continue;

      try {
        logger.info(`[TaskQueue] Processing task: ${task.name} (ID: ${task.id})`);
        await task.handler();
        logger.info(`[TaskQueue] Completed task: ${task.name} (ID: ${task.id})`);
      } catch (error) {
        logger.error(
          `[TaskQueue] Failed task: ${task.name} (ID: ${task.id})`,
          error
        );
      }
    }

    this.isProcessing = false;
  }

  // Get current queue size
  getQueueSize() {
    return this.queue.length;
  }
}

// Create singleton instance
export const taskQueue = new AsyncTaskQueue();
