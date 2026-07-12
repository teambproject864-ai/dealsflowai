
import { A2AMessageBus, A2AMessageType } from "./message-bus";
import { A2ALogger } from "./logger";
import { A2AAgentInfo, A2ACapability } from "./types";
import { initializeHermesAgent } from "../agents/hermes-agent";
import { initializeVexaAgent } from "../agents/vexa-agent";
import { initializeOpenSpecAgent } from "../agents/openspec-agent";
import { logger } from "../logger";

// Unified Ecosystem System IDs
export enum EcosystemSystemId {
  HERMES = "hermes-system",
  VEXA = "vexa-system",
  OPENSPEC = "openspec-system",
}

// Ecosystem Capabilities
export const HERMES_CAPABILITIES: A2ACapability[] = [
  {
    name: "memory_store",
    version: "1.0.0",
    description: "Stores and retrieves memories across tiers",
    supportedOperations: ["store_memory", "retrieve_memory", "search_memories", "get_metrics"],
  },
  {
    name: "memory_sync",
    version: "1.0.0",
    description: "Synchronizes memory state across systems",
    supportedOperations: ["sync_state", "get_version"],
  },
];

export const VEXA_CAPABILITIES: A2ACapability[] = [
  {
    name: "gtm_analysis",
    version: "1.0.0",
    description: "Generates and optimizes GTM strategies",
    supportedOperations: ["generate_gtm", "optimize_gtm", "crawl_website"],
  },
  {
    name: "playbook_generation",
    version: "1.0.0",
    description: "Creates strategic outreach playbooks",
    supportedOperations: ["generate_playbook", "update_playbook"],
  },
];

export const OPENSPEC_CAPABILITIES: A2ACapability[] = [
  {
    name: "gtm_validation",
    version: "1.0.0",
    description: "Validates GTM analysis against OpenSpec",
    supportedOperations: ["validate_gtm", "get_constraints"],
  },
  {
    name: "playbook_validation",
    version: "1.0.0",
    description: "Validates outreach playbooks against OpenSpec",
    supportedOperations: ["validate_playbook", "get_playbook_constraints"],
  },
];

export class UnifiedEcosystemIntegration {
  private static instance: UnifiedEcosystemIntegration;
  private messageBus: A2AMessageBus;
  private logger: A2ALogger;
  private initialized: boolean = false;
  private systemStates: Map<string, any> = new Map();
  private stateVersions: Map<string, number> = new Map();

  private constructor() {
    this.logger = new A2ALogger();
    this.messageBus = new A2AMessageBus({ logger: this.logger });
  }

  public static getInstance(): UnifiedEcosystemIntegration {
    if (!UnifiedEcosystemIntegration.instance) {
      UnifiedEcosystemIntegration.instance = new UnifiedEcosystemIntegration();
    }
    return UnifiedEcosystemIntegration.instance;
  }

  /**
   * Initializes the entire ecosystem
   */
  async initializeEcosystem(): Promise<void> {
    if (this.initialized) {
      logger.info("[UnifiedEcosystem] Ecosystem already initialized");
      return;
    }

    logger.info("[UnifiedEcosystem] Starting ecosystem initialization...");

    // 1. Register all systems
    this.registerSystem(EcosystemSystemId.HERMES, HERMES_CAPABILITIES);
    this.registerSystem(EcosystemSystemId.VEXA, VEXA_CAPABILITIES);
    this.registerSystem(EcosystemSystemId.OPENSPEC, OPENSPEC_CAPABILITIES);

    // 2. Initialize all agents on the message bus
    initializeHermesAgent(this.messageBus);
    initializeVexaAgent(this.messageBus);
    initializeOpenSpecAgent(this.messageBus);

    // 3. Subscribe to state sync broadcasts
    this.messageBus.subscribeBroadcast(async (message) => {
      if (message.type === A2AMessageType.STATE_SYNC) {
        await this.handleStateSync(message);
      }
    });

    // 4. Start heartbeats
    this.startHeartbeats();

    this.initialized = true;
    logger.info("[UnifiedEcosystem] Ecosystem initialization complete!");
  }

  /**
   * Registers a system with the ecosystem
   */
  private registerSystem(systemId: string, capabilities: A2ACapability[]): void {
    const agentInfo: A2AAgentInfo = {
      id: systemId,
      name: systemId,
      type: "system",
      capabilities,
      status: "online",
      lastSeen: Date.now(),
      metadata: { initialized: true },
    };

    this.messageBus.registerAgent(agentInfo);
    this.systemStates.set(systemId, { initialized: true, lastHeartbeat: Date.now() });
    this.stateVersions.set(systemId, 1);
    logger.info(`[UnifiedEcosystem] Registered system: ${systemId}`);
  }

  /**
   * Handles state sync messages
   */
  private async handleStateSync(message: any): Promise<void> {
    const stateData = message.payload;
    const systemId = message.from;
    
    this.systemStates.set(systemId, {
      ...this.systemStates.get(systemId),
      ...stateData.stateData,
    });
    this.stateVersions.set(systemId, stateData.version);
    
    logger.debug(`[UnifiedEcosystem] Synced state from ${systemId} at version ${stateData.version}`);
  }

  /**
   * Sends a state sync broadcast
   */
  async sendStateSync(systemId: string, stateType: string, stateData: any): Promise<void> {
    const currentVersion = this.stateVersions.get(systemId) || 0;
    const newVersion = currentVersion + 1;
    this.stateVersions.set(systemId, newVersion);

    await this.messageBus.createAndSendMessage(
      systemId,
      "broadcast",
      A2AMessageType.STATE_SYNC,
      {
        stateType,
        stateData,
        version: newVersion,
        timestamp: Date.now(),
      }
    );
  }

  /**
   * Starts periodic heartbeats
   */
  private startHeartbeats(): void {
    setInterval(async () => {
      for (const systemId of Object.values(EcosystemSystemId)) {
        const currentState = this.systemStates.get(systemId);
        this.messageBus.createAndSendMessage(
          systemId,
          "broadcast",
          A2AMessageType.HEARTBEAT,
          {
            agentInfo: {
              id: systemId,
              name: systemId,
              type: "system",
              capabilities: [],
              status: "online",
              lastSeen: Date.now(),
              metadata: currentState,
            },
          }
        );
      }
    }, 10000); // Every 10 seconds
  }

  /**
   * Gets the unified message bus instance
   */
  getMessageBus(): A2AMessageBus {
    return this.messageBus;
  }

  /**
   * Gets system state
   */
  getSystemState(systemId: string): any {
    return this.systemStates.get(systemId);
  }

  /**
   * Gets all system states
   */
  getAllSystemStates(): Map<string, any> {
    return this.systemStates;
  }

  /**
   * Shuts down the entire ecosystem
   */
  shutdown(): void {
    this.messageBus.shutdown();
    this.initialized = false;
    logger.info("[UnifiedEcosystem] Ecosystem shutdown complete");
  }
}

export const getEcosystem = () => UnifiedEcosystemIntegration.getInstance();
