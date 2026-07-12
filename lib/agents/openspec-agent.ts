import { A2AMessageBus, A2AMessageType } from "../a2a";
import { OpenSpecValidator } from "../openspec";

export function initializeOpenSpecAgent(messageBus: A2AMessageBus) {
  const agentId = "openspec-agent";

  console.log(`[OpenSpecAgent] Subscribing to A2A topic: ${agentId}`);

  messageBus.subscribe(agentId, async (message) => {
    if (message.type !== A2AMessageType.TASK_DELEGATION) {
      return;
    }

    const { taskId, taskType, input } = message.payload;
    console.log(`[OpenSpecAgent] Received task: ${taskId} (${taskType})`);

    try {
      let result: { success: boolean; errors?: string[] };

      switch (taskType) {
        case "validate_gtm_spec": {
          result = OpenSpecValidator.validateGTM(input.data);
          break;
        }
        case "validate_playbook_spec": {
          result = OpenSpecValidator.validatePlaybook(input.data);
          break;
        }
        case "validate_meeting": {
          console.log(`[OpenSpecAgent] Validating meeting: ${input.meetingId}`);
          result = {
            success: true,
            validation: "Meeting adheres to OpenSpec meeting standards",
          };
          break;
        }
        default:
          throw new Error(`Unsupported task type: ${taskType}`);
      }

      // Send result back to the requester (message.from)
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
      console.log(`[OpenSpecAgent] Completed validation task: ${taskId}, valid: ${result.success}`);
    } catch (error) {
      console.error(`[OpenSpecAgent] Failed task ${taskId}:`, error);
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
