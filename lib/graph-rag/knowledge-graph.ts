import { GraphEntity, GraphRelation, KnowledgeGraph } from "./types";

export class KnowledgeGraphStore {
  private graph: KnowledgeGraph = {
    entities: new Map(),
    relations: new Map(),
  };
  private entityNameIndex: Map<string, string[]> = new Map(); // name -> entity ids
  private entityTypeIndex: Map<string, string[]> = new Map(); // type -> entity ids
  private relationTypeIndex: Map<string, string[]> = new Map(); // type -> relation ids
  private entityRelations: Map<string, Set<string>> = new Map(); // entity id -> relation ids

  /**
   * Adds or updates an entity
   */
  addEntity(entity: Omit<GraphEntity, "createdAt" | "updatedAt">): GraphEntity {
    const existingEntity = this.graph.entities.get(entity.id);
    const now = Date.now();
    
    const newEntity: GraphEntity = {
      ...entity,
      createdAt: existingEntity?.createdAt || now,
      updatedAt: now,
    };

    this.graph.entities.set(entity.id, newEntity);
    
    // Update indexes
    this.updateEntityNameIndex(newEntity, existingEntity);
    this.updateEntityTypeIndex(newEntity, existingEntity);

    return newEntity;
  }

  /**
   * Gets an entity by ID
   */
  getEntity(id: string): GraphEntity | undefined {
    return this.graph.entities.get(id);
  }

  /**
   * Deletes an entity
   */
  deleteEntity(id: string): boolean {
    const entity = this.graph.entities.get(id);
    if (!entity) return false;

    // Delete relations involving this entity
    const relationIds = this.entityRelations.get(id);
    if (relationIds) {
      for (const relationId of relationIds) {
        this.deleteRelation(relationId);
      }
    }

    // Remove from indexes
    this.removeFromEntityNameIndex(entity);
    this.removeFromEntityTypeIndex(entity);

    this.graph.entities.delete(id);
    return true;
  }

  /**
   * Adds or updates a relation
   */
  addRelation(relation: Omit<GraphRelation, "createdAt" | "updatedAt">): GraphRelation {
    const existingRelation = this.graph.relations.get(relation.id);
    const now = Date.now();
    
    const newRelation: GraphRelation = {
      ...relation,
      createdAt: existingRelation?.createdAt || now,
      updatedAt: now,
    };

    this.graph.relations.set(relation.id, newRelation);
    
    // Update relation type index
    this.updateRelationTypeIndex(newRelation, existingRelation);
    
    // Update entity relations
    this.addEntityRelation(relation.from, relation.id);
    this.addEntityRelation(relation.to, relation.id);

    return newRelation;
  }

  /**
   * Gets a relation by ID
   */
  getRelation(id: string): GraphRelation | undefined {
    return this.graph.relations.get(id);
  }

  /**
   * Deletes a relation
   */
  deleteRelation(id: string): boolean {
    const relation = this.graph.relations.get(id);
    if (!relation) return false;

    // Remove from entity relations
    this.removeEntityRelation(relation.from, id);
    this.removeEntityRelation(relation.to, id);

    // Remove from type index
    this.removeFromRelationTypeIndex(relation);

    this.graph.relations.delete(id);
    return true;
  }

  /**
   * Gets all relations for an entity
   */
  getEntityRelations(entityId: string): GraphRelation[] {
    const relationIds = this.entityRelations.get(entityId);
    if (!relationIds) return [];
    
    return Array.from(relationIds)
      .map(id => this.graph.relations.get(id))
      .filter((r): r is GraphRelation => r !== undefined);
  }

  /**
   * Gets entities by type
   */
  getEntitiesByType(type: string): GraphEntity[] {
    const entityIds = this.entityTypeIndex.get(type);
    if (!entityIds) return [];
    
    return entityIds
      .map(id => this.graph.entities.get(id))
      .filter((e): e is GraphEntity => e !== undefined);
  }

  /**
   * Gets relations by type
   */
  getRelationsByType(type: string): GraphRelation[] {
    const relationIds = this.relationTypeIndex.get(type);
    if (!relationIds) return [];
    
    return relationIds
      .map(id => this.graph.relations.get(id))
      .filter((r): r is GraphRelation => r !== undefined);
  }

  /**
   * Gets all entities
   */
  getAllEntities(): GraphEntity[] {
    return Array.from(this.graph.entities.values());
  }

  /**
   * Gets all relations
   */
  getAllRelations(): GraphRelation[] {
    return Array.from(this.graph.relations.values());
  }

  /**
   * Traverses the graph from a starting entity
   */
  traverseGraph(startEntityId: string, depth: number = 2): {
    entities: GraphEntity[];
    relations: GraphRelation[];
  } {
    const visitedEntities = new Set<string>();
    const visitedRelations = new Set<string>();
    const entities: GraphEntity[] = [];
    const relations: GraphRelation[] = [];

    const traverse = (entityId: string, currentDepth: number) => {
      if (currentDepth > depth || visitedEntities.has(entityId)) return;
      
      visitedEntities.add(entityId);
      const entity = this.graph.entities.get(entityId);
      if (entity) {
        entities.push(entity);
      }

      const entityRelations = this.getEntityRelations(entityId);
      for (const relation of entityRelations) {
        if (!visitedRelations.has(relation.id)) {
          visitedRelations.add(relation.id);
          relations.push(relation);
          
          const nextEntityId = relation.from === entityId ? relation.to : relation.from;
          traverse(nextEntityId, currentDepth + 1);
        }
      }
    };

    traverse(startEntityId, 0);
    return { entities, relations };
  }

  /**
   * Clears the graph
   */
  clear(): void {
    this.graph.entities.clear();
    this.graph.relations.clear();
    this.entityNameIndex.clear();
    this.entityTypeIndex.clear();
    this.relationTypeIndex.clear();
    this.entityRelations.clear();
  }

  // Index management
  private updateEntityNameIndex(entity: GraphEntity, oldEntity?: GraphEntity): void {
    if (oldEntity && oldEntity.name !== entity.name) {
      this.removeFromEntityNameIndex(oldEntity);
    }
    
    const normalizedName = entity.name.toLowerCase();
    if (!this.entityNameIndex.has(normalizedName)) {
      this.entityNameIndex.set(normalizedName, []);
    }
    const ids = this.entityNameIndex.get(normalizedName)!;
    if (!ids.includes(entity.id)) {
      ids.push(entity.id);
    }
  }

  private removeFromEntityNameIndex(entity: GraphEntity): void {
    const normalizedName = entity.name.toLowerCase();
    const ids = this.entityNameIndex.get(normalizedName);
    if (ids) {
      const index = ids.indexOf(entity.id);
      if (index > -1) {
        ids.splice(index, 1);
        if (ids.length === 0) {
          this.entityNameIndex.delete(normalizedName);
        }
      }
    }
  }

  private updateEntityTypeIndex(entity: GraphEntity, oldEntity?: GraphEntity): void {
    if (oldEntity && oldEntity.type !== entity.type) {
      this.removeFromEntityTypeIndex(oldEntity);
    }
    
    if (!this.entityTypeIndex.has(entity.type)) {
      this.entityTypeIndex.set(entity.type, []);
    }
    const ids = this.entityTypeIndex.get(entity.type)!;
    if (!ids.includes(entity.id)) {
      ids.push(entity.id);
    }
  }

  private removeFromEntityTypeIndex(entity: GraphEntity): void {
    const ids = this.entityTypeIndex.get(entity.type);
    if (ids) {
      const index = ids.indexOf(entity.id);
      if (index > -1) {
        ids.splice(index, 1);
        if (ids.length === 0) {
          this.entityTypeIndex.delete(entity.type);
        }
      }
    }
  }

  private updateRelationTypeIndex(relation: GraphRelation, oldRelation?: GraphRelation): void {
    if (oldRelation && oldRelation.type !== relation.type) {
      this.removeFromRelationTypeIndex(oldRelation);
    }
    
    if (!this.relationTypeIndex.has(relation.type)) {
      this.relationTypeIndex.set(relation.type, []);
    }
    const ids = this.relationTypeIndex.get(relation.type)!;
    if (!ids.includes(relation.id)) {
      ids.push(relation.id);
    }
  }

  private removeFromRelationTypeIndex(relation: GraphRelation): void {
    const ids = this.relationTypeIndex.get(relation.type);
    if (ids) {
      const index = ids.indexOf(relation.id);
      if (index > -1) {
        ids.splice(index, 1);
        if (ids.length === 0) {
          this.relationTypeIndex.delete(relation.type);
        }
      }
    }
  }

  private addEntityRelation(entityId: string, relationId: string): void {
    if (!this.entityRelations.has(entityId)) {
      this.entityRelations.set(entityId, new Set());
    }
    this.entityRelations.get(entityId)!.add(relationId);
  }

  private removeEntityRelation(entityId: string, relationId: string): void {
    const relations = this.entityRelations.get(entityId);
    if (relations) {
      relations.delete(relationId);
      if (relations.size === 0) {
        this.entityRelations.delete(entityId);
      }
    }
  }
}
