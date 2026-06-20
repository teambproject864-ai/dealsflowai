import { z } from "zod";

/**
 * OKF Metadata Schema
 */
export const OkfMetadataSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/), // Semantic versioning
  author: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  domain: z.string().min(1),
  tags: z.array(z.string()).optional(),
  license: z.string().optional(),
});

/**
 * OKF Entity Schema
 */
export const OkfEntitySchema = z.object({
  id: z.string().uuid(),
  type: z.string().min(1),
  properties: z.record(z.any()),
  metadata: z.object({
    createdBy: z.string().optional(),
    source: z.string().optional(),
    confidence: z.number().min(0).max(1).optional(),
  }).optional(),
});

/**
 * OKF Relationship Schema
 */
export const OkfRelationshipSchema = z.object({
  id: z.string().uuid(),
  from: z.string().uuid(),
  to: z.string().uuid(),
  type: z.string().min(1),
  properties: z.record(z.any()).optional(),
});

/**
 * Full OKF Document Schema
 */
export const OkfDocumentSchema = z.object({
  metadata: OkfMetadataSchema,
  entities: z.array(OkfEntitySchema),
  relationships: z.array(OkfRelationshipSchema).optional(),
});

export type OkfMetadata = z.infer<typeof OkfMetadataSchema>;
export type OkfEntity = z.infer<typeof OkfEntitySchema>;
export type OkfRelationship = z.infer<typeof OkfRelationshipSchema>;
export type OkfDocument = z.infer<typeof OkfDocumentSchema>;
