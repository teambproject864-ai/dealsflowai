import { MCPServer } from "../mcp/server";
import { KimiClient } from "../kimi";
import { Orchestrator } from "../multi-agent";

export function createResearchMCPServer(kimiClient: KimiClient, orchestrator: Orchestrator): MCPServer {
  const server = new MCPServer("DealFlow Research MCP", "1.0.0");

  // Register research tool
  server.registerTool(
    {
      name: "run_research",
      description: "Run a research workflow using the multi-agent system",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string" },
          data: { type: "array" },
        },
        required: ["query"],
      },
    },
    async (args) => {
      const result = await orchestrator.runResearchWorkflow(args.query, args.data);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // Register Kimi chat tool
  server.registerTool(
    {
      name: "kimi_chat",
      description: "Send a chat request to Kimi LLM",
      inputSchema: {
        type: "object",
        properties: {
          messages: {
            type: "array",
            items: {
              type: "object",
              properties: {
                role: { type: "string" },
                content: { type: "string" },
              },
            },
          },
          model: { type: "string" },
        },
        required: ["messages"],
      },
    },
    async (args) => {
      const response = await kimiClient.chatCompletion({
        model: args.model || "moonshot-v1-8k",
        messages: args.messages,
      });
      return {
        content: [
          {
            type: "text",
            text: response.choices[0].message.content,
          },
        ],
      };
    }
  );

  return server;
}
