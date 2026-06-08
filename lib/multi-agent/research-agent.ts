import { BaseAgent } from "./base-agent";
import { AgentRole, AgentTask, ResearchInput, ResearchOutput } from "./types";

export class ResearchAgent extends BaseAgent {
  constructor(id: string, messageQueue: any, kimiClient: any) {
    super(id, AgentRole.RESEARCH, messageQueue, kimiClient);
  }

  protected async executeTask(task: AgentTask): Promise<ResearchOutput> {
    const input = task.input as ResearchInput;

    const response = await this.kimiClient.chatCompletion({
      model: "moonshot-v1-8k",
      messages: [
        {
          role: "system",
          content: "You are a research agent. Your job is to gather information and summarize findings.",
        },
        {
          role: "user",
          content: `Research query: ${input.query}${input.context ? `\nContext: ${input.context}` : ""}`,
        },
      ],
    });

    return {
      findings: [response.choices[0].message.content],
      sources: ["Kimi LLM"],
      summary: response.choices[0].message.content,
    };
  }
}
