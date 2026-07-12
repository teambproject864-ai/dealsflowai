import { A2AMessageBus, A2AMessageType } from "../a2a";
import { getHermes } from "../hermes/hermes";

export function initializeHermesAgent(messageBus: A2AMessageBus) {
  const agentId = "hermes-agent";
  const hermes = getHermes();

  console.log(`[HermesAgent] Subscribing to A2A topic: ${agentId}`);

  // Subscribe to A2A messages
  messageBus.subscribe(agentId, async (message) => {
    if (message.type !== A2AMessageType.TASK_DELEGATION) {
      return;
    }

    const { taskId, taskType, input } = message.payload;
    console.log(`[HermesAgent] Received task: ${taskId} (${taskType})`);

    try {
      let result: any;

      switch (taskType) {
        case "store_memory": {
          const entry = await hermes.storeMemory({
            content: input.content,
            category: input.category || "general",
            tier: input.tier || "short-term",
            leadId: input.leadId,
            sessionId: input.sessionId,
            agentId: input.agentId,
            keywords: input.keywords || [],
            importance: input.importance || 5,
            metadata: input.metadata || {},
          });
          // Remove embedding from results to avoid heavy payload on message bus
          const { embedding, ...safeEntry } = entry as any;
          result = { success: true, memory: safeEntry };
          break;
        }

        case "search_memories": {
          const entries = await hermes.searchMemories({
            query: input.query,
            leadId: input.leadId,
            sessionId: input.sessionId,
            agentId: input.agentId,
            tier: input.tier,
            limit: input.limit || 5,
          });
          const safeEntries = entries.map(({ embedding, ...rest }: any) => rest);
          result = { success: true, memories: safeEntries };
          break;
        }

        case "get_memory_metrics": {
          const metrics = hermes.getMetrics();
          result = { success: true, metrics };
          break;
        }

        default:
          throw new Error(`Unsupported task type: ${taskType}`);
      }

      // Send TASK_RESULT back to the requester (message.from)
      await messageBus.createAndSendMessage(
        agentId,
        message.from,
        A2AMessageType.TASK_RESULT,
        {
          taskId,
          result,
        },
        { correlationId: message.correlationId }
      );
      console.log(`[HermesAgent] Successfully completed task: ${taskId}`);
    } catch (error) {
      console.error(`[HermesAgent] Failed task ${taskId}:`, error);
      await messageBus.createAndSendMessage(
        agentId,
        message.from,
        A2AMessageType.TASK_ERROR,
        {
          taskId,
          error: error instanceof Error ? error.message : String(error),
        },
        { correlationId: message.correlationId }
      );
    }
  });
}
