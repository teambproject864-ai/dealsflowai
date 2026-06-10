import { z } from 'zod';
import { SecureAgentOrchestrator } from './secure-agent-framework';
import crypto from 'crypto';

// --- Interfaces ---
export interface PlaybookStep {
  id: string;
  name: string;
  action: string;
  parameters: Record<string, any>;
  requiresApproval: boolean;
  timeoutMs?: number;
  retryCount?: number;
  dependsOn?: string[];
}

export interface Playbook {
  id: string;
  version: string;
  name: string;
  description: string;
  steps: PlaybookStep[];
  createdAt: string;
  updatedAt: string;
}

export interface PlaybookExecutionState {
  executionId: string;
  playbookId: string;
  playbookVersion: string;
  userId: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  currentStepIndex: number;
  stepResults: Map<string, {
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    output?: any;
    error?: string;
    startedAt?: string;
    completedAt?: string;
  }>;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  callbacks?: ((state: PlaybookExecutionState) => void)[];
}

// --- Validation Schemas ---
const PlaybookStepSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  action: z.string().min(1),
  parameters: z.record(z.any()),
  requiresApproval: z.boolean(),
  timeoutMs: z.number().int().positive().optional(),
  retryCount: z.number().int().nonnegative().optional(),
  dependsOn: z.array(z.string().min(1)).optional(),
});

const PlaybookSchema = z.object({
  id: z.string().min(1),
  version: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  steps: z.array(PlaybookStepSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// --- Logging Utility ---
function log(message: string, level: 'info' | 'warn' | 'error' | 'debug' = 'info') {
  const timestamp = new Date().toISOString();
  console[level](`[${timestamp}] [PlaybookEngine] [${level.toUpperCase()}] ${message}`);
}

// --- Action Registry ---
type ActionHandler = (params: Record<string, any>) => Promise<any>;
const actionRegistry: Map<string, ActionHandler> = new Map();

/**
 * Registers a custom action handler
 */
export function registerAction(actionName: string, handler: ActionHandler) {
  actionRegistry.set(actionName, handler);
  log(`Registered action: ${actionName}`);
}

// --- Built-in Actions ---
registerAction('log', async (params) => {
  log(`Action log: ${params.message}`);
  return { success: true, message: params.message };
});

registerAction('wait', async (params) => {
  const durationMs = params.durationMs || 1000;
  return new Promise(resolve => setTimeout(() => resolve({ success: true, waitedMs: durationMs }), durationMs));
});

registerAction('echo', async (params) => {
  return { success: true, echoed: params.input };
});

/**
 * Execution Engine for AI Experimentation Playbooks
 */
export class PlaybookEngine {
  private orchestrator: SecureAgentOrchestrator;
  private playbooks: Map<string, Playbook> = new Map();
  private executions: Map<string, PlaybookExecutionState> = new Map();

  constructor(orchestrator: SecureAgentOrchestrator) {
    this.orchestrator = orchestrator;
  }

  /**
   * Creates a new playbook
   */
  createPlaybook(params: Omit<Playbook, 'id' | 'createdAt' | 'updatedAt'>): Playbook {
    const playbookId = `playbook-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const playbook: Playbook = {
      id: playbookId,
      createdAt: now,
      updatedAt: now,
      ...params,
    };

    const validated = PlaybookSchema.parse(playbook);
    this.playbooks.set(playbookId, validated);
    log(`Created playbook ${playbookId}: ${playbook.name}`);
    return validated;
  }

  /**
   * Retrieves a playbook by ID
   */
  getPlaybook(playbookId: string): Playbook | undefined {
    return this.playbooks.get(playbookId);
  }

  /**
   * Triggers a versioned playbook from the repository.
   */
  async executePlaybook(
    playbookId: string,
    userId: string,
    callbacks?: ((state: PlaybookExecutionState) => void)[]
  ): Promise<PlaybookExecutionState> {
    const playbook = this.playbooks.get(playbookId);
    if (!playbook) {
      throw new Error(`Playbook ${playbookId} not found`);
    }

    const executionId = `exec-${crypto.randomUUID()}`;
    const stepResults = new Map<string, any>();
    playbook.steps.forEach(step => {
      stepResults.set(step.id, { status: 'pending' });
    });

    const initialState: PlaybookExecutionState = {
      executionId,
      playbookId,
      playbookVersion: playbook.version,
      userId,
      status: 'pending',
      currentStepIndex: 0,
      stepResults,
      callbacks,
    };

    this.executions.set(executionId, initialState);
    log(`Starting execution ${executionId} of playbook ${playbookId} for user ${userId}`);

    // Start execution in background
    this.runExecution(initialState).catch(error => {
      log(`Execution ${executionId} failed: ${error.message}`, 'error');
      this.updateExecutionState(executionId, {
        status: 'failed',
        error: error.message,
      });
    });

    return initialState;
  }

  /**
   * Retrieves execution state by ID
   */
  getExecution(executionId: string): PlaybookExecutionState | undefined {
    return this.executions.get(executionId);
  }

  /**
   * Pauses a running execution
   */
  pauseExecution(executionId: string): void {
    const state = this.executions.get(executionId);
    if (!state) {
      throw new Error(`Execution ${executionId} not found`);
    }
    if (state.status !== 'running') {
      throw new Error(`Cannot pause execution with status ${state.status}`);
    }

    this.updateExecutionState(executionId, { status: 'paused' });
    log(`Paused execution ${executionId}`);
  }

  /**
   * Resumes a paused execution
   */
  resumeExecution(executionId: string): void {
    const state = this.executions.get(executionId);
    if (!state) {
      throw new Error(`Execution ${executionId} not found`);
    }
    if (state.status !== 'paused') {
      throw new Error(`Cannot resume execution with status ${state.status}`);
    }

    this.updateExecutionState(executionId, { status: 'running' });
    log(`Resumed execution ${executionId}`);
    this.runExecution(state).catch(error => {
      log(`Execution ${executionId} failed: ${error.message}`, 'error');
      this.updateExecutionState(executionId, {
        status: 'failed',
        error: error.message,
      });
    });
  }

  /**
   * Cancels an execution
   */
  cancelExecution(executionId: string): void {
    const state = this.executions.get(executionId);
    if (!state) {
      throw new Error(`Execution ${executionId} not found`);
    }

    this.updateExecutionState(executionId, {
      status: 'cancelled',
      completedAt: new Date().toISOString(),
    });
    log(`Cancelled execution ${executionId}`);
  }

  // --- Private Methods ---
  private updateExecutionState(
    executionId: string,
    updates: Partial<PlaybookExecutionState>
  ): PlaybookExecutionState {
    const state = this.executions.get(executionId);
    if (!state) {
      throw new Error(`Execution ${executionId} not found`);
    }

    const newState: PlaybookExecutionState = {
      ...state,
      ...updates,
    };
    this.executions.set(executionId, newState);

    // Call callbacks
    if (newState.callbacks) {
      newState.callbacks.forEach(callback => callback(newState));
    }

    return newState;
  }

  private async runExecution(state: PlaybookExecutionState): Promise<void> {
    const playbook = this.playbooks.get(state.playbookId);
    if (!playbook) {
      throw new Error(`Playbook ${state.playbookId} not found`);
    }

    // Mark as started
    state = this.updateExecutionState(state.executionId, {
      status: 'running',
      startedAt: new Date().toISOString(),
    });

    for (let i = state.currentStepIndex; i < playbook.steps.length; i++) {
      const step = playbook.steps[i];
      log(`Executing step ${i + 1}/${playbook.steps.length}: ${step.name} (${step.id})`);

      // Check for pause/cancel
      const currentState = this.executions.get(state.executionId);
      if (!currentState || currentState.status === 'paused' || currentState.status === 'cancelled') {
        return;
      }

      // Update step status
      const stepResults = new Map(state.stepResults);
      stepResults.set(step.id, { status: 'running', startedAt: new Date().toISOString() });
      state = this.updateExecutionState(state.executionId, {
        currentStepIndex: i,
        stepResults,
      });

      try {
        const output = await this.executeStep(step, state.userId);
        stepResults.set(step.id, {
          status: 'completed',
          output,
          startedAt: stepResults.get(step.id)?.startedAt,
          completedAt: new Date().toISOString(),
        });
        state = this.updateExecutionState(state.executionId, {
          stepResults,
        });
        log(`Step ${step.id} completed successfully`);
      } catch (error: any) {
        stepResults.set(step.id, {
          status: 'failed',
          error: error.message,
          startedAt: stepResults.get(step.id)?.startedAt,
          completedAt: new Date().toISOString(),
        });
        state = this.updateExecutionState(state.executionId, {
          stepResults,
          status: 'failed',
          error: error.message,
          completedAt: new Date().toISOString(),
        });
        throw error;
      }
    }

    // All steps completed
    this.updateExecutionState(state.executionId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
    log(`Playbook execution ${state.executionId} completed successfully`);
  }

  private async executeStep(step: PlaybookStep, userId: string): Promise<any> {
    log(`[Playbook] Executing step: ${step.action}`);

    // Log audit event
    await this.orchestrator.logAuditEvent({
      userId,
      action: 'playbook_step_executed',
      status: 'success',
      metadata: { stepId: step.id, action: step.action },
    });

    // Check if action exists in registry
    const handler = actionRegistry.get(step.action);
    if (!handler) {
      throw new Error(`Unknown action: ${step.action}`);
    }

    return await handler(step.parameters);
  }
}

export default PlaybookEngine;
