import { db } from "@/lib/firebase-admin";
import { hfInferJSON } from "@/lib/huggingface";
import { v4 as uuidv4 } from "uuid";
import type { OKFNode, OKFNodeType } from "./types";

export class OKFSystem {
  private static COLLECTION = "okf_knowledge";

  /**
   * Extracts structured knowledge nodes from document text and saves them to Firestore.
   */
  static async ingestIntoOKF(args: {
    docId: string;
    docName: string;
    text: string;
  }): Promise<OKFNode[]> {
    if (!db) throw new Error("firestore_unavailable");

    console.log(`[OKFSystem] Ingesting document ${args.docId} into OKF...`);
    
    // Truncate text if it's too large for LLM context
    const maxChars = 8000;
    const truncatedText = args.text.slice(0, maxChars);

    const systemPrompt = `You are an expert knowledge extraction agent. Analyze the provided text and extract a JSON array of key structured facts, entities, business rules, workflows, or concepts.
Each extracted node must match this TypeScript interface:
interface OKFNode {
  type: "entity" | "fact" | "rule" | "workflow" | "concept";
  name: string;
  content: string;
  keywords: string[];
  attributes: Record<string, string>;
}
IMPORTANT: Return ONLY a valid JSON array of objects. Do not include markdown code fences, backticks, or other text outside the JSON.`;

    const userPrompt = `Extract structured knowledge from this text:
---
${truncatedText}
---`;

    try {
      let rawNodes: any[] = [];
      try {
        rawNodes = await hfInferJSON(userPrompt, systemPrompt);
      } catch (err) {
        console.warn("[OKFSystem] hfInferJSON failed, falling back to empty list:", err);
      }

      if (!Array.isArray(rawNodes)) {
        console.warn("[OKFSystem] LLM did not return a JSON array, got:", rawNodes);
        rawNodes = [];
      }

      const nowIso = new Date().toISOString();
      const nowMs = Date.now();

      const nodes: OKFNode[] = rawNodes.map((item: any, idx: number) => {
        const type: OKFNodeType = ["entity", "fact", "rule", "workflow", "concept"].includes(item.type)
          ? item.type
          : "fact";

        return {
          id: uuidv4(),
          docId: args.docId,
          type,
          name: String(item.name || `Fact ${idx + 1}`),
          content: String(item.content || ""),
          keywords: Array.isArray(item.keywords) ? item.keywords.map(String) : [],
          attributes: typeof item.attributes === "object" && item.attributes !== null ? item.attributes : {},
          createdAt: nowIso,
          createdAtMs: nowMs,
        };
      });

      if (nodes.length > 0) {
        const batch = db.batch();
        for (const node of nodes) {
          const ref = db.collection(this.COLLECTION).doc(node.id);
          batch.set(ref, node);
        }
        await batch.commit();
        console.log(`[OKFSystem] Successfully saved ${nodes.length} OKF nodes in Firestore.`);
      }

      return nodes;
    } catch (error) {
      console.error("[OKFSystem] Ingestion error:", error);
      throw error;
    }
  }

  /**
   * Searches the OKF collection using query keywords over name, content, and keywords fields.
   */
  static async searchOKF(args: {
    query: string;
    limit?: number;
    docIds?: string[];
  }): Promise<OKFNode[]> {
    if (!db) return [];

    const limitVal = args.limit || 5;
    const keywords = args.query
      .toLowerCase()
      .split(/\s+/)
      .filter((k) => k.length > 2);

    let queryRef: any = db.collection(this.COLLECTION);

    if (args.docIds && args.docIds.length > 0) {
      queryRef = queryRef.where("docId", "in", args.docIds);
    }

    const snap = await queryRef.get();
    const allNodes: OKFNode[] = [];
    snap.forEach((doc: any) => {
      allNodes.push({ id: doc.id, ...doc.data() } as OKFNode);
    });

    if (keywords.length === 0) {
      return allNodes.slice(0, limitVal);
    }

    // Score and rank nodes based on keyword matches
    const scored = allNodes.map((node) => {
      let score = 0;
      const nodeName = node.name.toLowerCase();
      const nodeContent = node.content.toLowerCase();
      const nodeKeywords = (node.keywords || []).map((k) => k.toLowerCase());

      for (const kw of keywords) {
        if (nodeName.includes(kw)) score += 10;
        if (nodeContent.includes(kw)) score += 3;
        if (nodeKeywords.some((k) => k.includes(kw))) score += 5;
      }

      return { node, score };
    });

    return scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limitVal)
      .map((item) => item.node);
  }
}
