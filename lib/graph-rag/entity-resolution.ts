import { GraphEntity, EntityResolutionCandidate } from "./types";

export class EntityResolver {
  private stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "is", "was", "are", "were", "been",
    "be", "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "must", "can", "shall",
  ]);

  /**
   * Resolves an entity name against existing entities
   */
  resolveEntity(
    name: string,
    entities: GraphEntity[],
    options?: {
      threshold?: number;
      maxCandidates?: number;
    }
  ): EntityResolutionCandidate[] {
    const threshold = options?.threshold || 0.7;
    const maxCandidates = options?.maxCandidates || 5;
    
    const candidates: EntityResolutionCandidate[] = [];
    const normalizedName = this.normalizeName(name);

    for (const entity of entities) {
      const normalizedEntityName = this.normalizeName(entity.name);
      
      // Calculate similarity scores
      const exactMatchScore = normalizedName === normalizedEntityName ? 1.0 : 0.0;
      const jaccardScore = this.jaccardSimilarity(normalizedName, normalizedEntityName);
      const levenshteinScore = this.levenshteinSimilarity(normalizedName, normalizedEntityName);
      
      // Combine scores (weighted average)
      const combinedScore = (
        exactMatchScore * 0.5 +
        jaccardScore * 0.3 +
        levenshteinScore * 0.2
      );

      if (combinedScore >= threshold) {
        candidates.push({
          entity,
          similarityScore: combinedScore,
          confidence: combinedScore,
        });
      }
    }

    // Sort by score descending and limit
    return candidates
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, maxCandidates);
  }

  /**
   * Normalizes a name for comparison
   */
  private normalizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(word => !this.stopWords.has(word) && word.length > 0)
      .sort()
      .join(" ");
  }

  /**
   * Calculates Jaccard similarity between two strings
   */
  private jaccardSimilarity(s1: string, s2: string): number {
    const set1 = new Set(s1.split(" "));
    const set2 = new Set(s2.split(" "));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  /**
   * Calculates Levenshtein similarity between two strings
   */
  private levenshteinSimilarity(s1: string, s2: string): number {
    const distance = this.levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    return maxLength === 0 ? 1 : 1 - distance / maxLength;
  }

  /**
   * Calculates Levenshtein distance between two strings
   */
  private levenshteinDistance(s1: string, s2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= s2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= s1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= s2.length; i++) {
      for (let j = 1; j <= s1.length; j++) {
        if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[s2.length][s1.length];
  }
}
