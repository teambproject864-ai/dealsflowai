import { KnowledgeGraphStore } from "./knowledge-graph";
import { HybridSearchEngine } from "./hybrid-search";
import { GraphRAGQuery, GraphRAGAnswer } from "./types";
import { KimiClient } from "../kimi/client";

export class GraphRAGSystem {
  private graphStore: KnowledgeGraphStore;
  private searchEngine: HybridSearchEngine;
  private kimiClient?: KimiClient;

  constructor(options?: {
    kimiClient?: KimiClient;
  }) {
    this.graphStore = new KnowledgeGraphStore();
    this.searchEngine = new HybridSearchEngine(
      this.graphStore
    );
    this.kimiClient = options?.kimiClient;
  }

  /**
   * Gets the knowledge graph store
   */
  getGraphStore(): KnowledgeGraphStore {
    return this.graphStore;
  }

  /**
   * Gets the search engine
   */
  getSearchEngine(): HybridSearchEngine {
    return this.searchEngine;
  }

  /**
   * Performs a Graph RAG query
   */
  async query(query: GraphRAGQuery): Promise<GraphRAGAnswer> {
    // Perform hybrid search
    const searchResult = await this.searchEngine.search(query);

    // Get context graph if requested
    const contextGraph = query.includeGraphTraversal
      ? this.searchEngine.getContextGraph(searchResult.entityMatches, 2)
      : { entities: [], relations: [] };

    // Generate answer using LLM if available
    let answer = "No answer generated - LLM not configured";
    if (this.kimiClient) {
      answer = await this.generateAnswer(query.text, searchResult, contextGraph);
    }

    // Compile sources
    const sources = [
      ...searchResult.entityMatches.map(m => ({
        id: m.entity.id,
        type: "entity" as const,
        name: m.entity.name,
        description: m.entity.description,
        metadata: m.entity.metadata,
      })),
      ...searchResult.vectorMatches.map(m => ({
        id: m.id,
        type: "document" as const,
        name: m.metadata.docName || "Unknown Document",
        metadata: m.metadata,
      })),
    ];

    return {
      answer,
      sources,
      contextGraph,
    };
  }

  /**
   * Generates an answer using the LLM
   */
  private async generateAnswer(
    question: string,
    searchResult: any,
    contextGraph: any
  ): Promise<string> {
    if (!this.kimiClient) {
      return "LLM not configured";
    }

    const context = this.buildContext(searchResult, contextGraph);
    
    const prompt = `
You are a helpful assistant that answers questions based on the provided context.

Context:
${context}

Question: ${question}

Please provide a comprehensive answer based only on the context provided.
`;

    try {
      const response = await this.kimiClient.chatCompletion({
        model: "moonshot-v1-8k",
        messages: [
          { role: "user", content: prompt },
        ],
      });
      return response.choices[0].message.content || "No answer generated";
    } catch (error) {
      console.error("LLM generation failed:", error);
      return "Failed to generate answer";
    }
  }

  /**
   * Builds context string from search results
   */
  private buildContext(searchResult: any, contextGraph: any): string {
    const parts: string[] = [];

    // Add entities
    if (contextGraph.entities.length > 0) {
      parts.push("Entities:");
      for (const entity of contextGraph.entities) {
        parts.push(`- ${entity.name} (${entity.type}): ${entity.description || "No description"}`);
      }
    }

    // Add relations
    if (contextGraph.relations.length > 0) {
      parts.push("\nRelations:");
      for (const relation of contextGraph.relations) {
        const fromEntity = contextGraph.entities.find((e: any) => e.id === relation.from);
        const toEntity = contextGraph.entities.find((e: any) => e.id === relation.to);
        parts.push(`- ${fromEntity?.name || relation.from} ${relation.type} ${toEntity?.name || relation.to}`);
      }
    }

    // Add vector search results
    if (searchResult.vectorMatches.length > 0) {
      parts.push("\nDocuments:");
      for (const match of searchResult.vectorMatches.slice(0, 5)) {
        parts.push(`- ${match.text?.substring(0, 200) || "No text"}...`);
      }
    }

    return parts.join("\n") || "No context available";
  }
}

export * from "./types";
export * from "./knowledge-graph";
export * from "./entity-resolution";
export * from "./hybrid-search";
