import { BaseAgent } from "./base-agent";
import { AgentRole, AgentTask, DataAnalysisInput, DataAnalysisOutput } from "./types";

export class DataAnalysisAgent extends BaseAgent {
  constructor(id: string, messageQueue: any, kimiClient: any) {
    super(id, AgentRole.DATA_ANALYSIS, messageQueue, kimiClient);
  }

  protected async executeTask(task: AgentTask): Promise<DataAnalysisOutput> {
    const input = task.input as DataAnalysisInput;

    const response = await this.kimiClient.chatCompletion({
      model: "moonshot-v1-8k",
      messages: [
        {
          role: "system",
          content: "You are a data analysis agent. Analyze the provided data and provide insights.",
        },
        {
          role: "user",
          content: `Analyze this data: ${JSON.stringify(input.data)}\nAnalysis type: ${input.analysisType}`,
        },
      ],
    });

    return {
      insights: [response.choices[0].message.content],
      statistics: { analyzed: true },
    };
  }
}
