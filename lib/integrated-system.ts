import { A2AMessageBus } from "./a2a";
import { GraphRAGSystem } from "./graph-rag";
import { ContextGraphLayer } from "./context-graph";
import { UnifiedOrchestrator } from "./unified-orchestrator";
import { KimiClient } from "./kimi/client";

// Singleton instances
let messageBus: A2AMessageBus | undefined;
let graphRAG: GraphRAGSystem | undefined;
let contextGraph: ContextGraphLayer | undefined;
let orchestrator: UnifiedOrchestrator | undefined;

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
} {
  if (messageBus && graphRAG && contextGraph && orchestrator) {
    return { messageBus, graphRAG, contextGraph, orchestrator };
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

  // Start orchestrator
  orchestrator.start();

  console.log("Integrated system initialized successfully");

  return { messageBus, graphRAG, contextGraph, orchestrator };
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
