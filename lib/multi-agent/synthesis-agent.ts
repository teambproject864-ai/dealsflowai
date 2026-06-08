import { BaseAgent } from "./base-agent";
import { AgentRole, AgentTask, SynthesisInput, SynthesisOutput } from "./types";

export class SynthesisAgent extends BaseAgent {
  constructor(id: string, messageQueue: any, kimiClient: any) {
    super(id, AgentRole.SYNTHESIS, messageQueue, kimiClient);
  }

  protected async executeTask(task: AgentTask): Promise<SynthesisOutput> {
    const input = task.input as SynthesisInput;

    const response = await this.kimiClient.chatCompletion({
      model: "moonshot-v1-8k",
      messages: [
        {
          role: "system",
          content: "You are a synthesis agent. Combine research, analysis, and fact-checking into a final report.",
        },
        {
          role: "user",
          content: `Research: ${JSON.stringify(input.research)}\nAnalysis: ${JSON.stringify(input.analysis)}\nFact Check: ${JSON.stringify(input.factCheck)}`,
        },
      ],
    });

    return {
      finalReport: response.choices[0].message.content,
      keyTakeaways: ["Key takeaway 1"],
      recommendations: ["Recommendation 1"],
    };
  }
}
