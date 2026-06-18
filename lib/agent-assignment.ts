import { AGENT_FULL_NAMES, getRevenueAgentCatalog, RevenueAgentProfile } from "./types";
import { db } from "./firebase-admin";
import { logger } from "./logger";

// --- Assignment tracking interface
interface AgentAssignmentLog {
  leadId: string;
  agentKey: string;
  assignedAt: string;
  reason: string;
  previousAgentKey?: string; // for reassignment
}

// In-memory assignment counts for quick access (backup to Firestore)
let inMemoryAssignmentCounts: Record<string, number> = {};
let inMemoryAssignmentHistory: AgentAssignmentLog[] = [];

// Initialize from Firestore on first use
async function initAssignmentCounts() {
  if (!db) {
    // Fallback to in-memory only
    const agents = getRevenueAgentCatalog();
    agents.forEach(agent => {
      inMemoryAssignmentCounts[agent.key] = 0;
    });
    return;
  }

  try {
    // Load counts from Firestore
    const snapshot = await db
      .collection("agent_assignments")
      .where("status", "in", ["pending", "active"])
      .get();

    const agents = getRevenueAgentCatalog();
    agents.forEach(agent => {
      inMemoryAssignmentCounts[agent.key] = 0;
    });

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.agentKey) {
        inMemoryAssignmentCounts[data.agentKey] = (inMemoryAssignmentCounts[data.agentKey] || 0) + 1;
      }
    });
    logger.info("[AgentAssignment] Initialized assignment counts from Firestore", inMemoryAssignmentCounts);
  } catch (err) {
    logger.warn("[AgentAssignment] Failed to load assignment counts from Firestore, using defaults", err);
  }
}

// Ensure counts are initialized
let initPromise: Promise<void> | null = null;
function ensureInit() {
  if (!initPromise) {
    initPromise = initAssignmentCounts();
  }
  return initPromise;
}

// --- Helper to calculate variance between most and least assigned agents
function calculateAssignmentVariance(agents: RevenueAgentProfile[]): number {
  const counts = agents.map(a => inMemoryAssignmentCounts[a.key] || 0);
  const max = Math.max(...counts);
  const min = Math.min(...counts);
  if (min === 0) return max === 0 ? 0 : 100;
  return ((max - min) / min) * 100;
}

// --- Fair random agent assignment with variance control (<=15%
export async function assignFairRandomAgent(
  agents: RevenueAgentProfile[],
  excludeAgentKey?: string
): Promise<{ agentKey: string; reason: string }> {
  await ensureInit();
  const availableAgents = agents.filter(agent => agent.available && agent.key !== excludeAgentKey);
  let agentPool = availableAgents.length > 0 ? availableAgents : agents.filter(agent => agent.key !== excludeAgentKey);
  
  if (agentPool.length === 0) {
    agentPool = agents;
  }

  // First, try to pick agents with lower counts first to keep variance <=15%
  // Sort agents by count ascending
  const sortedAgents = [...agentPool].sort((a, b) => {
    const countA = inMemoryAssignmentCounts[a.key] || 0;
    const countB = inMemoryAssignmentCounts[b.key] || 0;
    return countA - countB;
  };

  // Select from the first 50% of sorted agents (or all if small pool) to keep it random but fair
  const fairPoolSize = Math.max(1, Math.floor(sortedAgents.length / 2));
  const fairPool = sortedAgents.slice(0, fairPoolSize);
  
  // Now random from fair pool
  const randomIndex = Math.floor(Math.random() * fairPool.length);
  const selectedAgent = fairPool[randomIndex];
  
  // Update counts
  inMemoryAssignmentCounts[selectedAgent.key] = (inMemoryAssignmentCounts[selectedAgent.key] || 0) + 1;
  
  // Calculate variance for logging
  const variance = calculateAssignmentVariance(agents);
  
  const reason = 
    availableAgents.length > 0 
      ? `fair_random_available_agent (variance: ${variance.toFixed(2)}%)` 
      : `fair_random_fallback_agent (variance: ${variance.toFixed(2)}%)`;
  
  logger.info(`[AgentAssignment] Assigned agent: ${selectedAgent.key}`, { reason, variance, excludeAgentKey ? `excluded previous: ${excludeAgentKey}` : "" });
  
  return { agentKey: selectedAgent.key, reason };
}

// --- Customer reassignment (avoids previous agent
export async function reassignAgent(
  leadId: string,
  previousAgentKey: string,
  agents: RevenueAgentProfile[]
): Promise<{ agentKey: string; reason: string }> {
  await ensureInit();
  
  const result = await assignFairRandomAgent(agents, previousAgentKey);
  
  // Log reassignment
  const logEntry: AgentAssignmentLog = {
    leadId,
    agentKey: result.agentKey,
    assignedAt: new Date().toISOString(),
    reason: result.reason,
    previousAgentKey
  };
  inMemoryAssignmentHistory.push(logEntry);
  
  // Decrement previous agent's count
  if (inMemoryAssignmentCounts[previousAgentKey] > 0) {
    inMemoryAssignmentCounts[previousAgentKey]--;
  }
  
  logger.info(`[AgentAssignment] Reassigned lead: ${leadId} from ${previousAgentKey} to ${result.agentKey}`);
  
  return result;
}

// --- Legacy compatibility
export function getRandomAvailableAgent(): string {
  const agents = getRevenueAgentCatalog();
  const availableAgents = agents.filter(agent => agent.available);
  
  const agentPool = availableAgents.length > 0 ? availableAgents : agents;
  const randomIndex = Math.floor(Math.random() * agentPool.length);
  return agentPool[randomIndex].key;
}

// --- Get agent by key
export function getAgentByKey(key: string) {
  const agents = getRevenueAgentCatalog();
  return agents.find(agent => agent.key === key);
}
