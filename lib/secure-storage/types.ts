import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

export type CredentialType = "api_key" | "username_password" | "oauth_token";

export const CredentialSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: z.enum(["api_key", "username_password", "oauth_token"]),
  encryptedData: z.object({
    iv: z.string(),
    ciphertext: z.string(),
    authTag: z.string(),
  }),
  metadata: z.object({
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    createdBy: z.string().optional(),
    lastUsedAt: z.string().datetime().optional(),
    tags: z.array(z.string()).optional(),
  }),
  accessRoles: z.array(z.string()), // Roles allowed to access this credential
});

export type Credential = z.infer<typeof CredentialSchema>;

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  credentialId?: string;
  action: "create" | "read" | "update" | "delete" | "rotate";
  actor: string;
  success: boolean;
  ip?: string;
  userAgent?: string;
  details?: string;
}
