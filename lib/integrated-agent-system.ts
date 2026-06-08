import { getHermes, HermesMemoryOS } from './hermes';
import { getClawpatrol, ClawpatrolFirewall } from './clawpatrol';
import { AgentIdentity } from './clawpatrol/types';

export class IntegratedAgentSystem {
  private hermes: HermesMemoryOS;
  private clawpatrol: ClawpatrolFirewall;

  constructor() {
    this.hermes = getHermes();
    this.clawpatrol = getClawpatrol();
  }

  /**
   * Process an agent request with full pipeline
   */
  async processRequest({
    agentId,
    prompt,
    context,
  }: {
    agentId: string;
    prompt: string;
    context?: Record<string, any>;
  }): Promise<{
    allowed: boolean;
    blockedReason?: string;
    sanitizedResponse?: string;
  }> {
    // 1. Authenticate agent
    if (!this.clawpatrol.authenticateAgent(agentId, {})) {
      return {
        allowed: false,
        blockedReason: 'Agent authentication failed',
      };
    }

    // 2. Inspect inbound prompt
    const inboundCheck = this.clawpatrol.inspectInbound(agentId, prompt, context);
    if (!inboundCheck.allowed) {
      return {
        allowed: false,
        blockedReason: inboundCheck.blockedReason,
      };
    }

    // 3. Store request in Hermes
    await this.hermes.storeMemory({
      content: prompt,
      category: 'agent_request',
      tier: 'short-term',
      agentId,
      keywords: prompt.split(/\s+/).filter(w => w.length > 3),
      importance: 5,
      metadata: { ...context },
    });

    // 4. Retrieve relevant context from Hermes
    const relevantMemories = await this.hermes.searchMemories({
      query: prompt,
      agentId,
      limit: 5,
    });

    // 5. Simulate response generation (in real system, would call LLM)
    const response = `Processed request with ${relevantMemories.length} relevant memories`;

    // 6. Inspect outbound response
    const outboundCheck = this.clawpatrol.inspectOutbound(agentId, response, context);

    // 7. Store response in Hermes
    await this.hermes.storeMemory({
      content: outboundCheck.sanitizedResponse || response,
      category: 'agent_response',
      tier: 'short-term',
      agentId,
      keywords: response.split(/\s+/).filter(w => w.length > 3),
      importance: 5,
      metadata: { ...context },
    });

    return {
      allowed: outboundCheck.allowed,
      blockedReason: outboundCheck.blockedReason,
      sanitizedResponse: outboundCheck.sanitizedResponse,
    };
  }

  /**
   * Register a new agent
   */
  registerAgent(identity: AgentIdentity): void {
    this.clawpatrol.registerAgent(identity);
  }

  /**
   * Get system status
   */
  getSystemStatus(): {
    hermes: ReturnType<HermesMemoryOS['getMetrics']>;
    clawpatrol: {
      registeredAgents: number;
      recentEvents: number;
    };
  } {
    return {
      hermes: this.hermes.getMetrics(),
      clawpatrol: {
        registeredAgents: Array.from(getClawpatrol()['agentIdentities'].keys()).length,
        recentEvents: this.clawpatrol.getAuditLogs({ limit: 100 }).length,
      },
    };
  }
}

let integratedInstance: IntegratedAgentSystem | null = null;

export function getIntegratedSystem(): IntegratedAgentSystem {
  if (!integratedInstance) {
    integratedInstance = new IntegratedAgentSystem();
  }
  return integratedInstance;
}
