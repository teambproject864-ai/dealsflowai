import { KimiClient } from "./kimi/client";
import { Orchestrator } from "./multi-agent";

let kimiClient: KimiClient | null = null;
let orchestrator: Orchestrator | null = null;

export function getKimiClient(): KimiClient {
  if (!kimiClient) {
    const apiKey = process.env.KIMI_API_KEY || "";
    const baseUrl = process.env.KIMI_BASE_URL || "https://api.moonshot.cn/v1";
    kimiClient = new KimiClient(apiKey, baseUrl);
  }
  return kimiClient;
}

export function getOrchestrator(): Orchestrator {
  if (!orchestrator) {
    const kimiClient = getKimiClient();
    orchestrator = new Orchestrator(kimiClient);
  }
  return orchestrator;
}
