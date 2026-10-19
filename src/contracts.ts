import { z } from "zod";

export const ActorTypeSchema = z.enum(["human", "agent", "service", "organization", "system"]);
export const ConsentStatusSchema = z.enum(["granted", "denied", "revoked", "expired"]);
export const AuthorizationDecisionValueSchema = z.enum(["allow", "deny", "require_human"]);

export const ConsentReceiptSchema = z.object({
  id: z.string().min(1),
  subject_id: z.string().min(1),
  actor_id: z.string().min(1),
  purpose: z.string().min(1),
  scopes: z.array(z.string().min(1)),
  status: ConsentStatusSchema,
  policy_version: z.string().min(1),
  granted_at: z.string().datetime().optional(),
  expires_at: z.string().datetime().optional(),
  revoked_at: z.string().datetime().optional(),
  evidence_reference: z.string().min(1).optional(),
}).strict();

export const AuthorizationDecisionSchema = z.object({
  id: z.string().min(1),
  actor_id: z.string().min(1),
  actor_type: ActorTypeSchema,
  action: z.string().min(1),
  resource: z.string().min(1),
  decision: AuthorizationDecisionValueSchema,
  reason: z.string().min(1),
  policy_version: z.string().min(1),
  correlation_id: z.string().min(1),
  decided_at: z.string().datetime(),
}).strict();

export const ProvenanceRecordSchema = z.object({
  id: z.string().min(1),
  artifact_id: z.string().min(1),
  source_type: z.string().min(1),
  source_reference: z.string().min(1),
  transformations: z.array(z.string()),
  evidence_class: z.string().min(1),
  confidence: z.number().min(0).max(1).optional(),
  integrity_hash: z.string().min(1).optional(),
  created_at: z.string().datetime(),
  created_by: z.string().min(1),
}).strict();

export const MemoryRecordSchema = z.object({
  id: z.string().min(1),
  subject_id: z.string().min(1),
  owner_id: z.string().min(1),
  source_product: z.string().min(1),
  purpose: z.string().min(1),
  sensitivity: z.string().min(1),
  retention_policy: z.string().min(1),
  consent_receipt_id: z.string().min(1).optional(),
  content_reference: z.string().min(1),
  created_at: z.string().datetime(),
  expires_at: z.string().datetime().optional(),
  revoked_at: z.string().datetime().optional(),
}).strict();

export const AuditEventSchema = z.object({
  id: z.string().min(1),
  event_type: z.string().min(1),
  actor_id: z.string().min(1),
  actor_type: ActorTypeSchema,
  product_id: z.string().min(1),
  action: z.string().min(1),
  resource_type: z.string().min(1),
  resource_id: z.string().min(1).optional(),
  outcome: z.string().min(1),
  correlation_id: z.string().min(1),
  occurred_at: z.string().datetime(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const ServiceManifestSchema = z.object({
  service_id: z.string().min(1),
  name: z.string().min(1),
  repo: z.string().regex(/^[^/]+\/[^/]+$/),
  protocol_version: z.string().min(1),
  environment: z.enum(["development", "preview", "production", "multi"]),
  capabilities: z.array(z.string().min(1)),
  data_classes: z.array(z.string().min(1)),
  dependencies: z.array(z.string().min(1)),
  public_endpoints: z.array(z.string().url()),
  owner: z.string().min(1),
  health_reference: z.string().url().optional(),
}).strict();

export const RegistryServiceSchema = z.object({
  id: z.string().min(1),
  repo: z.string().regex(/^[^/]+\/[^/]+$/),
  role: z.enum([
    "registry-governance",
    "trust-control-plane",
    "builder-tooling",
    "product",
    "protected-sanctuary",
  ]),
  exposure: z.string().min(1).optional(),
}).strict();

export const RegistryServicesSchema = z.array(RegistryServiceSchema);

export type ConsentReceipt = z.infer<typeof ConsentReceiptSchema>;
export type AuthorizationDecision = z.infer<typeof AuthorizationDecisionSchema>;
export type ProvenanceRecord = z.infer<typeof ProvenanceRecordSchema>;
export type MemoryRecord = z.infer<typeof MemoryRecordSchema>;
export type AuditEvent = z.infer<typeof AuditEventSchema>;
export type ServiceManifest = z.infer<typeof ServiceManifestSchema>;
