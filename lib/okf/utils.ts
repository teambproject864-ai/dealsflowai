import { v4 as uuidv4 } from "uuid";
import {
  OkfDocumentSchema,
  OkfDocument,
  OkfMetadata,
  OkfEntity,
  OkfRelationship,
} from "./types";

/**
 * OKF Validator
 */
export function validateOkfDocument(doc: unknown): {
  valid: boolean;
  data?: OkfDocument;
  errors?: string[];
} {
  const result = OkfDocumentSchema.safeParse(doc);
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
    };
  }
  return { valid: true, data: result.data };
}

/**
 * OKF Serializer
 */
export function serializeOkfDocument(doc: OkfDocument): string {
  return JSON.stringify(doc, null, 2);
}

/**
 * OKF Parser
 */
export function parseOkfDocument(jsonString: string): {
  valid: boolean;
  data?: OkfDocument;
  errors?: string[];
} {
  try {
    const parsed = JSON.parse(jsonString);
    return validateOkfDocument(parsed);
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : "Invalid JSON string"],
    };
  }
}

/**
 * Create a new OKF document
 */
export function createOkfDocument(options: {
  title: string;
  description?: string;
  author?: string;
  domain: string;
  tags?: string[];
  license?: string;
}): OkfDocument {
  const now = new Date().toISOString();
  return {
    metadata: {
      id: uuidv4(),
      title: options.title,
      description: options.description,
      version: "1.0.0",
      author: options.author,
      createdAt: now,
      updatedAt: now,
      domain: options.domain,
      tags: options.tags,
      license: options.license,
    },
    entities: [],
    relationships: [],
  };
}

/**
 * Add entity to OKF document
 */
export function addOkfEntity(
  doc: OkfDocument,
  entity: Omit<OkfEntity, "id">
): OkfDocument {
  return {
    ...doc,
    metadata: {
      ...doc.metadata,
      updatedAt: new Date().toISOString(),
    },
    entities: [
      ...doc.entities,
      {
        ...entity,
        id: uuidv4(),
      },
    ],
  };
}

/**
 * Add relationship to OKF document
 */
export function addOkfRelationship(
  doc: OkfDocument,
  relationship: Omit<OkfRelationship, "id">
): OkfDocument {
  return {
    ...doc,
    metadata: {
      ...doc.metadata,
      updatedAt: new Date().toISOString(),
    },
    relationships: [
      ...(doc.relationships || []),
      {
        ...relationship,
        id: uuidv4(),
      },
    ],
  };
}

/**
 * Convert OKF document to JSON-LD
 */
export function okfToJsonLd(doc: OkfDocument): object {
  return {
    "@context": "https://schema.org",
    "@id": doc.metadata.id,
    name: doc.metadata.title,
    description: doc.metadata.description,
    author: doc.metadata.author,
    dateCreated: doc.metadata.createdAt,
    dateModified: doc.metadata.updatedAt,
    keywords: doc.metadata.tags?.join(", "),
    about: doc.entities.map((entity) => ({
      "@type": entity.type,
      "@id": entity.id,
      ...entity.properties,
    })),
  };
}

/**
 * Convert OKF document to CSV (entities only for simplicity)
 */
export function okfToCsv(doc: OkfDocument): string {
  if (doc.entities.length === 0) {
    return "id,type\n";
  }
  // Get all unique property keys from entities
  const allKeys = new Set<string>();
  doc.entities.forEach((entity) => {
    Object.keys(entity.properties).forEach((key) => allKeys.add(key));
  });
  const headers = ["id", "type", ...Array.from(allKeys)];
  const rows = doc.entities.map((entity) => {
    const values = headers.map((header) => {
      if (header === "id") return entity.id;
      if (header === "type") return entity.type;
      const value = entity.properties[header];
      return value != null ? `"${String(value).replace(/"/g, '""')}"` : "";
    });
    return values.join(",");
  });
  return [headers.join(","), ...rows].join("\n");
}
