import { A2AMessageBus } from "./a2a";
import { GraphRAGSystem } from "./graph-rag";
import { ContextGraphLayer } from "./context-graph";
import { UnifiedOrchestrator } from "./unified-orchestrator";
import { KimiClient } from "./kimi/client";
import { initializeHermesAgent } from "./agents/hermes-agent";
import { initializeOpenSpecAgent } from "./agents/openspec-agent";
import { initializeVexaAgent } from "./agents/vexa-agent";
import { MicrosoftAgentFramework } from "./microsoft-agent-framework";

// Singleton instances
let messageBus: A2AMessageBus | undefined;
let graphRAG: GraphRAGSystem | undefined;
let contextGraph: ContextGraphLayer | undefined;
let orchestrator: UnifiedOrchestrator | undefined;
let microsoftAgentFramework: MicrosoftAgentFramework | undefined;

/**
 * Initializes the integrated system
 */
export function initializeIntegratedSystem(options?: {
  kimiClient?: KimiClient;
}): {
  messageBus: A2AMessageBus;
  graphRAG: GraphRAGSystem;
  contextGraph: ContextGraphLayer;
  orchestrator: UnifiedOrchestrator;
  microsoftAgentFramework?: MicrosoftAgentFramework;
} {
  if (messageBus && graphRAG && contextGraph && orchestrator && microsoftAgentFramework) {
    return { messageBus, graphRAG, contextGraph, orchestrator, microsoftAgentFramework };
  }

  // Initialize components
  messageBus = new A2AMessageBus();
  graphRAG = new GraphRAGSystem({
    kimiClient: options?.kimiClient,
  });
  contextGraph = new ContextGraphLayer();
  orchestrator = new UnifiedOrchestrator({
    messageBus,
    graphRAG,
    contextGraph,
  });
  microsoftAgentFramework = MicrosoftAgentFramework.getInstance();

  // Register agents in the ecosystem
  orchestrator.registerAgent({
    id: "hermes-agent",
    name: "Hermes Memory Agent",
    type: "memory",
    capabilities: ["store_memory", "search_memories", "get_memory_metrics"],
    metadata: {},
  });

  orchestrator.registerAgent({
    id: "openspec-agent",
    name: "OpenSpec Validation Agent",
    type: "validation",
    capabilities: ["validate_gtm_spec", "validate_playbook_spec"],
    metadata: {},
  });

  orchestrator.registerAgent({
    id: "vexa-agent",
    name: "Vexa Reasoning Agent",
    type: "reasoning",
    capabilities: ["process_intake_form"],
    metadata: {},
  });

  // Initialize agent event loop handlers on the message bus
  initializeHermesAgent(messageBus);
  initializeOpenSpecAgent(messageBus);
  initializeVexaAgent(messageBus);

  // Start orchestrator
  orchestrator.start();

  console.log("Integrated system initialized successfully with Hermes, Vexa, and OpenSpec agents");

  return { messageBus, graphRAG, contextGraph, orchestrator, microsoftAgentFramework };
}

/**
 * Gets the initialized message bus
 */
export function getMessageBus(): A2AMessageBus {
  if (!messageBus) {
    throw new Error("Integrated system not initialized. Call initializeIntegratedSystem first.");
  }
  return messageBus;
}

/**
 * Gets the initialized Graph RAG system
 */
export function getGraphRAG(): GraphRAGSystem {
  if (!graphRAG) {
    throw new Error("Integrated system not initialized. Call initializeIntegratedSystem first.");
  }
  return graphRAG;
}

/**
 * Gets the initialized Context Graph layer
 */
export function getContextGraph(): ContextGraphLayer {
  if (!contextGraph) {
    throw new Error("Integrated system not initialized. Call initializeIntegratedSystem first.");
  }
  return contextGraph;
}

/**
 * Gets the initialized orchestrator
 */
export function getOrchestrator(): UnifiedOrchestrator {
  if (!orchestrator) {
    throw new Error("Integrated system not initialized. Call initializeIntegratedSystem first.");
  }
  return orchestrator;
}

/**
 * Gets the initialized Microsoft Agent Framework instance
 */
export function getMicrosoftAgentFramework(): MicrosoftAgentFramework {
  if (!microsoftAgentFramework) {
    throw new Error("Integrated system not initialized. Call initializeIntegratedSystem first.");
  }
  return microsoftAgentFramework;
}
