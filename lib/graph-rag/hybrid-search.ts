import { GraphEntity, GraphRelation, HybridSearchResult, GraphRAGQuery } from "./types";
import { KnowledgeGraphStore } from "./knowledge-graph";
import { EntityResolver } from "./entity-resolution";

export class HybridSearchEngine {
  private graphStore: KnowledgeGraphStore;
  private entityResolver: EntityResolver;

  constructor(
    graphStore: KnowledgeGraphStore
  ) {
    this.graphStore = graphStore;
    this.entityResolver = new EntityResolver();
  }

  /**
   * Performs hybrid search combining graph and vector search
   */
  async search(query: GraphRAGQuery): Promise<HybridSearchResult> {
    const entityMatches = this.searchEntities(query);
    const relationMatches = this.searchRelations(query, entityMatches);
    const vectorMatches = query.includeVectorSearch 
      ? await this.searchVector(query) 
      : [];

    // Combine and rank all results
    const combinedResults = this.combineResults(
      entityMatches,
      relationMatches,
      vectorMatches
    );

    const limit = query.limit || 20;

    return {
      entityMatches: entityMatches.slice(0, limit),
      relationMatches: relationMatches.slice(0, limit),
      vectorMatches: vectorMatches.slice(0, limit),
      combinedResults: combinedResults.slice(0, limit),
    };
  }

  /**
   * Searches for entities using entity resolution
   */
  private searchEntities(query: GraphRAGQuery) {
    const allEntities = query.filters?.entityTypes 
      ? query.filters.entityTypes.flatMap(type => this.graphStore.getEntitiesByType(type))
      : this.graphStore.getAllEntities();

    // Filter by date range if specified
    let filteredEntities = allEntities;
    if (query.filters?.dateRange) {
      const { start, end } = query.filters.dateRange;
      filteredEntities = filteredEntities.filter(
        e => e.createdAt >= start && e.createdAt <= end
      );
    }

    // Resolve entities based on query text
    return this.entityResolver.resolveEntity(query.text, filteredEntities);
  }

  /**
   * Searches for relations related to matching entities
   */
  private searchRelations(
    query: GraphRAGQuery,
    entityMatches: Array<{ entity: GraphEntity; similarityScore: number; confidence: number }>
  ) {
    const relations: Array<{ relation: GraphRelation; score: number }> = [];

    // Get all relations for matching entities
    for (const { entity, similarityScore } of entityMatches) {
      const entityRelations = this.graphStore.getEntityRelations(entity.id);
      
      // Filter relations by type if specified
      let filteredRelations = entityRelations;
      if (query.filters?.relationTypes) {
        filteredRelations = filteredRelations.filter(
          r => query.filters!.relationTypes!.includes(r.type)
        );
      }

      for (const relation of filteredRelations) {
        relations.push({
          relation,
          score: similarityScore * 0.8, // Relations inherit slightly lower score
        });
      }
    }

    // Remove duplicates and sort
    const uniqueRelations = new Map<string, { relation: GraphRelation; score: number }>();
    for (const item of relations) {
      const existing = uniqueRelations.get(item.relation.id);
      if (!existing || item.score > existing.score) {
        uniqueRelations.set(item.relation.id, item);
      }
    }

    return Array.from(uniqueRelations.values())
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Searches vector store
   */
  private async searchVector(query: GraphRAGQuery) {
    // Vector search will be implemented later
    return [];
  }

  /**
   * Combines and ranks all search results
   */
  private combineResults(
    entityMatches: Array<{ entity: GraphEntity; similarityScore: number; confidence: number }>,
    relationMatches: Array<{ relation: GraphRelation; score: number }>,
    vectorMatches: Array<{ id: string; text: string; score: number; metadata: Record<string, any> }>
  ) {
    const combined = [
      ...entityMatches.map(m => ({
        id: m.entity.id,
        type: "entity" as const,
        content: m.entity,
        score: m.similarityScore,
        metadata: m.entity.metadata,
      })),
      ...relationMatches.map(m => ({
        id: m.relation.id,
        type: "relation" as const,
        content: m.relation,
        score: m.score,
        metadata: m.relation.metadata,
      })),
      ...vectorMatches.map(m => ({
        id: m.id,
        type: "vector" as const,
        content: m,
        score: m.score,
        metadata: m.metadata,
      })),
    ];

    return combined.sort((a, b) => b.score - a.score);
  }

  /**
   * Performs graph traversal from matching entities
   */
  getContextGraph(
    entityMatches: Array<{ entity: GraphEntity }>,
    depth: number = 2
  ) {
    const allEntities = new Map<string, GraphEntity>();
    const allRelations = new Map<string, GraphRelation>();

    for (const { entity } of entityMatches) {
      const subgraph = this.graphStore.traverseGraph(entity.id, depth);
      
      for (const e of subgraph.entities) {
        allEntities.set(e.id, e);
      }
      for (const r of subgraph.relations) {
        allRelations.set(r.id, r);
      }
    }

    return {
      entities: Array.from(allEntities.values()),
      relations: Array.from(allRelations.values()),
    };
  }
}
