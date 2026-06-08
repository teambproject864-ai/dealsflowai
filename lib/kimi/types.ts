export interface KimiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface KimiChatCompletionRequest {
  model: string;
  messages: KimiMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface KimiChatCompletionChoice {
  index: number;
  message: KimiMessage;
  finish_reason: string;
}

export interface KimiChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: KimiChatCompletionChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface KimiApiCallLog {
  id: string;
  timestamp: number;
  request: KimiChatCompletionRequest;
  response?: KimiChatCompletionResponse;
  error?: string;
  latency: number;
  success: boolean;
}
