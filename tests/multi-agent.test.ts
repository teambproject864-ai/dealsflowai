import { MessageQueue } from "../lib/multi-agent/message-queue";
import { AgentMessage } from "../lib/multi-agent/types";

describe("MessageQueue", () => {
  let queue: MessageQueue;

  beforeEach(() => {
    queue = new MessageQueue();
  });

  test("should send and receive messages", () => {
    const message: AgentMessage = {
      id: "test-msg",
      from: "agent-1",
      to: "agent-2",
      type: "task",
      content: {},
      timestamp: Date.now(),
    };

    queue.send(message);
    const received = queue.receive("agent-2");

    expect(received).toEqual(message);
  });

  test("should notify subscribers", () => {
    const callback = jest.fn();
    queue.subscribe("agent-2", callback);

    const message: AgentMessage = {
      id: "test-msg",
      from: "agent-1",
      to: "agent-2",
      type: "task",
      content: {},
      timestamp: Date.now(),
    };

    queue.send(message);
    expect(callback).toHaveBeenCalledWith(message);
  });
});
