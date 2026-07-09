import { z } from "zod";

// Message Type Enum
export enum A2AMessageType {
  CAPABILITY_NEGOTIATION = "capability_negotiation",
  TASK_DELEGATION = "task_delegation",
  TASK_ACCEPTANCE = "task_acceptance",
  TASK_STATUS = "task_status",
  TASK_RESULT = "task_result",
  TASK_ERROR = "task_error",
  STATE_SYNC = "state_sync",
  HEARTBEAT = "heartbeat",
  ACKNOWLEDGMENT = "acknowledgment",
}

// Message Schema Definition using Zod
export const A2AMessageSchema = z.object({
  id: z.string().uuid(),
  from: z.string().min(1),
  to: z.union([z.string().min(1), z.literal("broadcast")]),
  type: z.nativeEnum(A2AMessageType),
  payload: z.record(z.any()),
  timestamp: z.number().int().positive(),
  version: z.string().default("1.0.0"),
  correlationId: z.string().uuid().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  ttl: z.number().int().positive().optional(),
});

// Type inferred from schema
export type A2AMessage = z.infer<typeof A2AMessageSchema>;

// Capability Schema
export const A2ACapabilitySchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  description: z.string().optional(),
  supportedOperations: z.array(z.string()).min(1),
  metadata: z.record(z.any()).optional(),
});

export type A2ACapability = z.infer<typeof A2ACapabilitySchema>;

// Agent Info Schema
export const A2AAgentInfoSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  capabilities: z.array(A2ACapabilitySchema),
  status: z.enum(["online", "offline", "busy", "idle"]),
  lastSeen: z.number().int().positive(),
  metadata: z.record(z.any()).optional(),
});

export type A2AAgentInfo = z.infer<typeof A2AAgentInfoSchema>;

// Task Delegation Payload
export const A2ATaskDelegationPayloadSchema = z.object({
  taskId: z.string().uuid(),
  taskType: z.string().min(1),
  description: z.string().optional(),
  input: z.record(z.any()),
  requiredCapabilities: z.array(A2ACapabilitySchema).optional(),
  deadline: z.number().int().positive().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
});

export type A2ATaskDelegationPayload = z.infer<typeof A2ATaskDelegationPayloadSchema>;

// Task Status Payload
export const A2ATaskStatusPayloadSchema = z.object({
  taskId: z.string().uuid(),
  status: z.enum(["pending", "in_progress", "completed", "failed", "cancelled"]),
  progress: z.number().min(0).max(100).optional(),
  message: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type A2ATaskStatusPayload = z.infer<typeof A2ATaskStatusPayloadSchema>;

// Task Result Payload
export const A2ATaskResultPayloadSchema = z.object({
  taskId: z.string().uuid(),
  output: z.record(z.any()),
  metadata: z.record(z.any()).optional(),
});

export type A2ATaskResultPayload = z.infer<typeof A2ATaskResultPayloadSchema>;

// Task Error Payload
export const A2ATaskErrorPayloadSchema = z.object({
  taskId: z.string().uuid(),
  error: z.string().min(1),
  errorCode: z.string().optional(),
  stackTrace: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type A2ATaskErrorPayload = z.infer<typeof A2ATaskErrorPayloadSchema>;

// State Sync Payload
export const A2AStateSyncPayloadSchema = z.object({
  stateType: z.string().min(1),
  stateData: z.record(z.any()),
  version: z.number().int().positive(),
  timestamp: z.number().int().positive(),
});

export type A2AStateSyncPayload = z.infer<typeof A2AStateSyncPayloadSchema>;

// Heartbeat Payload
export const A2AHeartbeatPayloadSchema = z.object({
  agentInfo: A2AAgentInfoSchema,
});

export type A2AHeartbeatPayload = z.infer<typeof A2AHeartbeatPayloadSchema>;
