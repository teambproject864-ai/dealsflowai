/**
 * Classifies an incoming query to determine the best information retrieval route.
 * Options are:
 * - "rag": semantic search over document chunks
 * - "okf": exact key, rule, or fact matching
 * - "both": hybrid context aggregation
 */
export function classifyQuery(query: string): "rag" | "okf" | "both" {
  const q = query.toLowerCase();

  const okfKeywords = [
    "rule",
    "policy",
    "definition",
    "constraint",
    "requirement",
    "regulation",
    "specification",
    "parameter",
    "exactly",
    "id",
    "configured",
  ];

  const ragKeywords = [
    "explain",
    "summarize",
    "how to",
    "abstract",
    "thought",
    "opinion",
    "strategy",
  ];

  const matchesOkf = okfKeywords.some((kw) => q.includes(kw));
  const matchesRag = ragKeywords.some((kw) => q.includes(kw));

  if (matchesOkf && !matchesRag) {
    return "both"; // Complementary routing is preferred for factual queries
  }

  if (matchesRag && !matchesOkf) {
    return "rag";
  }

  return "both";
}
