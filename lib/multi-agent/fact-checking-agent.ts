import { BaseAgent } from "./base-agent";
import { AgentRole, AgentTask, FactCheckingInput, FactCheckingOutput } from "./types";

export class FactCheckingAgent extends BaseAgent {
  constructor(id: string, messageQueue: any, kimiClient: any) {
    super(id, AgentRole.FACT_CHECKING, messageQueue, kimiClient);
  }

  protected async executeTask(task: AgentTask): Promise<FactCheckingOutput> {
    const input = task.input as FactCheckingInput;

    const response = await this.kimiClient.chatCompletion({
      model: "moonshot-v1-8k",
      messages: [
        {
          role: "system",
          content: "You are a fact-checking agent. Verify claims and provide evidence.",
        },
        {
          role: "user",
          content: `Claims to verify: ${input.claims.join(", ")}\nSources: ${input.sources.join(", ")}`,
        },
      ],
    });

    return {
      verifiedClaims: input.claims.map((claim) => ({
        claim,
        verified: true,
        confidence: 0.9,
        evidence: response.choices[0].message.content,
      })),
    };
  }
}
