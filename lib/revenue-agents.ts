import { db } from "@/lib/firebase-admin";
import { PERSONAS } from "@/prompts/personas";
import type { CallRecord, AGENT_FULL_NAMES as TYPE_AGENT_FULL_NAMES, AGENT_EXPERTISE as TYPE_AGENT_EXPERTISE, RevenueAgentProfile } from "@/lib/types";
import { assignFairRandomAgent } from "./agent-assignment";

// Use the new agent names from lib/types.ts
import { AGENT_FULL_NAMES, AGENT_EXPERTISE } from "./types";

export function getRevenueAgentCatalog(): Omit<RevenueAgentProfile, "activeSessions" | "available">[] {
  return Object.entries(AGENT_FULL_NAMES).map(([key, name]) => ({
    key: key as keyof typeof AGENT_FULL_NAMES,
    name,
    fullName: name,
    role: "AI Revenue Agent",
    expertise: AGENT_EXPERTISE[key as keyof typeof AGENT_EXPERTISE] || ["gtm"],
  }));
}

async function countActiveSessionsByPersona(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const key of Object.keys(AGENT_FULL_NAMES)) {
    counts[key] = 0;
  }

  try {
    const snapshot = await db
      .collection("calls")
      .where("status", "==", "in-progress")
      .limit(50)
      .get();

    const now = Date.now();
    const recentThresholdMs = now - 2 * 60 * 1000;

    snapshot.docs.forEach((doc) => {
      const data = doc.data() as CallRecord;
      const persona = data.agentPersona || "ashok";
      const lastSeenMs = data.updatedAtMs || 0;
      if (lastSeenMs && lastSeenMs < recentThresholdMs) return;
      counts[persona] = (counts[persona] || 0) + 1;
    });
  } catch {
    // Firestore may be unavailable in dev — return zero counts
  }

  return counts;
}

export async function listRevenueAgentsWithAvailability(): Promise<RevenueAgentProfile[]> {
  const activeCounts = await countActiveSessionsByPersona();
  const maxPerAgent = Number(process.env.MAX_SESSIONS_PER_AGENT) || 2;

  return getRevenueAgentCatalog().map((agent) => {
    const activeSessions = activeCounts[agent.key] || 0;
    return {
      ...agent,
      activeSessions,
      available: activeSessions < maxPerAgent,
    };
  });
}

/**
 * Picks a fair random available agent (or random if all are busy) with variance control (<=15%)
 */
export async function assignRandomAgent(): Promise<{ agentKey: string; reason: string }> {
  const agents = await listRevenueAgentsWithAvailability();
  return await assignFairRandomAgent(agents);
}

/**
 * Backward-compatible function for assigning agents.
 */
export async function assignOptimalAgent(
  preferredKeys: string[] = [],
  challengeTags: string[] = []
): Promise<{ agentKey: string; reason: string }> {
  // If automatic assignment is requested, use fair assignment
  if (preferredKeys.length === 0 || preferredKeys.includes("automatic")) {
    return await assignRandomAgent();
  }
  
  // Otherwise, try to pick the optimal agent from preferred keys
  const agents = await listRevenueAgentsWithAvailability();
  const normalizedTags = challengeTags.map((t) => t.toLowerCase());

  const scoreAgent = (agent: RevenueAgentProfile): number => {
    let score = 0;
    if (agent.available) score += 100;
    score -= agent.activeSessions * 25;
    if (preferredKeys.includes(agent.key)) score += 15;
    const overlap = agent.expertise.filter((e) =>
      normalizedTags.some((tag) => tag.includes(e) || e.includes(tag))
    ).length;
    score += overlap * 10;
    return score;
  };

  const ranked = [...agents].sort((a, b) => scoreAgent(b) - scoreAgent(a));
  const best = ranked[0] || agents[0];

  return {
    agentKey: best?.key || "ashok",
    reason: best?.available
      ? "lowest_workload_expertise_match"
      : "fallback_busy_pool",
  };
}
