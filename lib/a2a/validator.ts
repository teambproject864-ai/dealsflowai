import {
  A2AMessageSchema,
  A2ACapabilitySchema,
  A2AAgentInfoSchema,
  A2ATaskDelegationPayloadSchema,
  A2ATaskStatusPayloadSchema,
  A2ATaskResultPayloadSchema,
  A2ATaskErrorPayloadSchema,
  A2AStateSyncPayloadSchema,
  A2AHeartbeatPayloadSchema,
  A2AMessage,
} from "./types";
import { validateA2AAuth } from "./auth";

export class A2AValidator {
  /**
   * Validates an A2A message
   */
  static validateMessage(message: unknown): { valid: true; message: A2AMessage } | { valid: false; error: string } {
    try {
      const validated = A2AMessageSchema.parse(message);
      
      // Check TTL if present
      if (validated.ttl) {
        const age = Date.now() - validated.timestamp;
        if (age > validated.ttl) {
          return { valid: false, error: "Message has expired (TTL exceeded)" };
        }
      }
      
      // Validate authentication
      const authResult = validateA2AAuth(validated.auth, validated.payload);
      if (!authResult.valid) {
        return authResult;
      }
      
      return { valid: true, message: validated };
    } catch (error) {
      return { valid: false, error: error instanceof Error ? error.message : "Invalid message format" };
    }
  }

  /**
   * Validates a capability
   */
  static validateCapability(capability: unknown) {
    return A2ACapabilitySchema.safeParse(capability);
  }

  /**
   * Validates agent info
   */
  static validateAgentInfo(agentInfo: unknown) {
    return A2AAgentInfoSchema.safeParse(agentInfo);
  }

  /**
   * Validates task delegation payload
   */
  static validateTaskDelegationPayload(payload: unknown) {
    return A2ATaskDelegationPayloadSchema.safeParse(payload);
  }

  /**
   * Validates task status payload
   */
  static validateTaskStatusPayload(payload: unknown) {
    return A2ATaskStatusPayloadSchema.safeParse(payload);
  }

  /**
   * Validates task result payload
   */
  static validateTaskResultPayload(payload: unknown) {
    return A2ATaskResultPayloadSchema.safeParse(payload);
  }

  /**
   * Validates task error payload
   */
  static validateTaskErrorPayload(payload: unknown) {
    return A2ATaskErrorPayloadSchema.safeParse(payload);
  }

  /**
   * Validates state sync payload
   */
  static validateStateSyncPayload(payload: unknown) {
    return A2AStateSyncPayloadSchema.safeParse(payload);
  }

  /**
   * Validates heartbeat payload
   */
  static validateHeartbeatPayload(payload: unknown) {
    return A2AHeartbeatPayloadSchema.safeParse(payload);
  }
}
