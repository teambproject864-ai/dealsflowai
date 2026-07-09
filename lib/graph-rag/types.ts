export interface GraphEntity {
  id: string;
  name: string;
  type: string;
  description?: string;
  metadata: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface GraphRelation {
  id: string;
  from: string;
  to: string;
  type: string;
  description?: string;
  metadata: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface KnowledgeGraph {
  entities: Map<string, GraphEntity>;
  relations: Map<string, GraphRelation>;
}

export interface EntityResolutionCandidate {
  entity: GraphEntity;
  similarityScore: number;
  confidence: number;
}

export interface HybridSearchResult {
  entityMatches: EntityResolutionCandidate[];
  relationMatches: Array<{
    relation: GraphRelation;
    score: number;
  }>;
  vectorMatches: Array<{
    id: string;
    text: string;
    score: number;
    metadata: Record<string, any>;
  }>;
  combinedResults: Array<{
    id: string;
    type: "entity" | "relation" | "vector";
    content: any;
    score: number;
    metadata: Record<string, any>;
  }>;
}

export interface GraphRAGQuery {
  text: string;
  filters?: {
    entityTypes?: string[];
    relationTypes?: string[];
    dateRange?: { start: number; end: number };
    metadata?: Record<string, any>;
  };
  limit?: number;
  includeVectorSearch?: boolean;
  includeGraphTraversal?: boolean;
}

export interface GraphRAGAnswer {
  answer: string;
  sources: Array<{
    id: string;
    type: "entity" | "relation" | "document";
    name?: string;
    description?: string;
    metadata: Record<string, any>;
  }>;
  contextGraph: {
    entities: GraphEntity[];
    relations: GraphRelation[];
  };
}
