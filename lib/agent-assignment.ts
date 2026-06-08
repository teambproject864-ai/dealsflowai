import { AGENT_FULL_NAMES, getRevenueAgentCatalog } from "./types";

// Function to get a random available agent
export function getRandomAvailableAgent(): string {
  const agents = getRevenueAgentCatalog();
  const availableAgents = agents.filter(agent => agent.available);
  
  // If no available agents, fallback to random from all agents
  const agentPool = availableAgents.length > 0 ? availableAgents : agents;
  
  const randomIndex = Math.floor(Math.random() * agentPool.length);
  return agentPool[randomIndex].key;
}

// Function to get an agent by key
export function getAgentByKey(key: string) {
  const agents = getRevenueAgentCatalog();
  return agents.find(agent => agent.key === key);
}
