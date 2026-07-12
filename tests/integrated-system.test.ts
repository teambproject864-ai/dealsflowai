import {
  A2AMessageBus,
  A2AMessageType,
  A2AValidator,
  generateA2ANonce,
  signA2AMessage,
} from "../lib/a2a";
import { GraphRAGSystem } from "../lib/graph-rag";
import { ContextGraphLayer, MemoryType } from "../lib/context-graph";
import { UnifiedOrchestrator } from "../lib/unified-orchestrator";
import { TaskStatus } from "../lib/unified-orchestrator/types";
import assert from "assert";

async function testA2AProtocolValidateMessages() {
  const timestamp = Date.now();
  const nonce = generateA2ANonce();
  const payload = { taskId: "123" };
  const signature = signA2AMessage("agent1", payload, timestamp, nonce);

  const validMessage = {
    id: crypto.randomUUID(),
    from: "agent1",
    to: "agent2",
    type: A2AMessageType.TASK_DELEGATION,
    payload,
    timestamp,
    version: "1.0.0",
    auth: {
      agentId: "agent1",
      timestamp,
      signature,
      nonce,
    },
  };

  const result = A2AValidator.validateMessage(validMessage);
  assert.ok(result.valid);
}

async function testA2AProtocolSendReceiveMessages() {
  const bus = new A2AMessageBus();
  let receivedMessage: any = null;

  bus.subscribe("agent2", (msg) => {
    receivedMessage = msg;
  });

  await bus.createAndSendMessage(
    "agent1",
    "agent2",
    A2AMessageType.HEARTBEAT,
    { data: "test" }
  );

  // Give it a moment
  await new Promise(resolve => setTimeout(resolve, 100));
  
  assert.ok(receivedMessage !== null);
  assert.strictEqual(receivedMessage.type, A2AMessageType.HEARTBEAT);
}

async function testGraphRAGStoreEntities() {
  const graphRAG = new GraphRAGSystem();
  const store = graphRAG.getGraphStore();

  store.addEntity({
    id: "entity1",
    name: "Test Entity",
    type: "company",
    description: "A test company",
    metadata: {},
  });

  const retrieved = store.getEntity("entity1");
  assert.ok(retrieved !== undefined);
  assert.strictEqual(retrieved?.name, "Test Entity");
}

async function testGraphRAGTraverseRelations() {
  const graphRAG = new GraphRAGSystem();
  const store = graphRAG.getGraphStore();

  store.addEntity({
    id: "company1",
    name: "Company A",
    type: "company",
    metadata: {},
  });

  store.addEntity({
    id: "person1",
    name: "John Doe",
    type: "person",
    metadata: {},
  });

  store.addRelation({
    id: "rel1",
    from: "person1",
    to: "company1",
    type: "works_at",
    metadata: {},
  });

  const subgraph = store.traverseGraph("person1", 2);
  assert.strictEqual(subgraph.entities.length, 2);
  assert.strictEqual(subgraph.relations.length, 1);
}

async function testContextGraphStoreMemories() {
  const contextGraph = new ContextGraphLayer();
  const store = contextGraph.getStore();

  const memory = contextGraph.storeInteraction(
    "agent1",
    { message: "Hello world" },
    { tags: ["test"] }
  );

  const retrieved = store.getMemory(memory.id);
  assert.ok(retrieved !== undefined);
  assert.strictEqual(retrieved?.type, MemoryType.INTERACTION);
}

async function testContextGraphAccessControls() {
  const contextGraph = new ContextGraphLayer();
  const accessController = contextGraph.getAccessController();

  const privateMemory = contextGraph.storeAgentState(
    "agent1",
    { secret: "data" }
  );

  // Owner should have access
  assert.strictEqual(accessController.hasAccess("agent1", privateMemory), true);
  
  // Other agent should not have access
  assert.strictEqual(accessController.hasAccess("agent2", privateMemory), false);
}

async function testOrchestratorRegisterAgents() {
  const messageBus = new A2AMessageBus();
  const graphRAG = new GraphRAGSystem();
  const contextGraph = new ContextGraphLayer();
  const orchestrator = new UnifiedOrchestrator({ messageBus, graphRAG, contextGraph });

  orchestrator.registerAgent({
    id: "agent1",
    name: "Test Agent",
    type: "worker",
    capabilities: ["analysis", "research"],
    metadata: {},
  });

  const agents = orchestrator.getAllAgents();
  assert.strictEqual(agents.length, 1);
  assert.strictEqual(agents[0].id, "agent1");
}

async function testOrchestratorCreateTasks() {
  const messageBus = new A2AMessageBus();
  const graphRAG = new GraphRAGSystem();
  const contextGraph = new ContextGraphLayer();
  const orchestrator = new UnifiedOrchestrator({ messageBus, graphRAG, contextGraph });

  const task = orchestrator.createTask({
    type: "analysis",
    input: { data: "test" },
    priority: "medium",
    tags: ["analysis"],
    metadata: {},
  });

  assert.strictEqual(task.status, TaskStatus.PENDING);
  
  const retrieved = orchestrator.getTask(task.id);
  assert.ok(retrieved !== undefined);
}

async function testOrchestratorCollectStatistics() {
  const messageBus = new A2AMessageBus();
  const graphRAG = new GraphRAGSystem();
  const contextGraph = new ContextGraphLayer();
  const orchestrator = new UnifiedOrchestrator({ messageBus, graphRAG, contextGraph });

  orchestrator.registerAgent({
    id: "agent1",
    name: "Test Agent",
    type: "worker",
    capabilities: ["analysis"],
    metadata: {},
  });

  orchestrator.createTask({
    type: "analysis",
    input: {},
    priority: "medium",
    tags: ["analysis"],
    metadata: {},
  });

  const stats = orchestrator.getStatistics();
  assert.strictEqual(stats.totalAgents, 1);
  assert.strictEqual(stats.totalTasks, 1);
}

async function testEndToEndWorkflow() {
  const messageBus = new A2AMessageBus();
  const graphRAG = new GraphRAGSystem();
  const contextGraph = new ContextGraphLayer();
  const orchestrator = new UnifiedOrchestrator({ messageBus, graphRAG, contextGraph });

  // Register agent
  orchestrator.registerAgent({
    id: "worker1",
    name: "Worker 1",
    type: "worker",
    capabilities: ["data_processing"],
    metadata: {},
  });

  // Set up message handler for agent
  let taskReceived = false;
  messageBus.subscribe("worker1", async (msg) => {
    if (msg.type === A2AMessageType.TASK_DELEGATION) {
      taskReceived = true;
      
      // Send response
      await messageBus.createAndSendMessage(
        "worker1",
        "orchestrator",
        A2AMessageType.TASK_RESULT,
        {
          taskId: msg.payload.taskId,
          result: { processed: true },
        }
      );
    }
  });

  // Create task
  orchestrator.createTask({
    type: "data_processing",
    input: { data: "test" },
    priority: "high",
    tags: ["data_processing"],
    metadata: {},
  });

  // Start orchestrator
  orchestrator.start();

  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  assert.ok(taskReceived);

  orchestrator.stop();
}

export async function runIntegratedSystemTests() {
  const tests = [
    testA2AProtocolValidateMessages,
    testA2AProtocolSendReceiveMessages,
    testGraphRAGStoreEntities,
    testGraphRAGTraverseRelations,
    testContextGraphStoreMemories,
    testContextGraphAccessControls,
    testOrchestratorRegisterAgents,
    testOrchestratorCreateTasks,
    testOrchestratorCollectStatistics,
    testEndToEndWorkflow,
  ];

  for (const t of tests) {
    await t();
    process.stdout.write(`ok ${t.name}\n`);
  }
}
