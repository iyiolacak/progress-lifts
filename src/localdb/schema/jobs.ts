import {
  ExtractDocumentTypeFromTypedRxJsonSchema,
  RxJsonSchema,
  toTypedRxJsonSchema,
} from "rxdb";

export const jobSchemaLiteral = {
  title: "Jobs",
  version: 0,
  primaryKey: "id",
  type: "object",
  additionalProperties: false,
  properties: {
    id: { type: "string", maxLength: 128 },
    type: { type: "string", enum: ["processEntry"] },
    entryId: { type: "string", maxLength: 128 },

    status: {
      type: "string",
      enum: ["pending", "running", "completed", "failed"],
      maxLength: 16
    },

  priority: { type: "integer", minimum: 1, maximum: 5, multipleOf: 1 },

  attempts: { type: "integer", minimum: 0, multipleOf: 1 },
  maxAttempts: { type: "integer", minimum: 1, multipleOf: 1 },

    createdAt: { type: "integer", minimum: 0, maximum: 32503680000000, multipleOf: 1 },
    updatedAt: { type: "integer", minimum: 0, maximum: 32503680000000, multipleOf: 1 },

    lockedUntil: { type: "integer", minimum: 0, maximum: 32503680000000, multipleOf: 1 },
    scheduledAt: { type: "integer", minimum: 0, maximum: 32503680000000, multipleOf: 1 },

    error: { type: "string" }
  },

  required: [
    "id",
    "type",
    "entryId",
    "status",
    "attempts",
    "maxAttempts",
    "createdAt",
    "updatedAt"
  ],

  // Composite index: only required fields (dexie storage disallows non-required fields in indexes)
  indexes: [
    ["status", "id"],
    "entryId",
    "createdAt",
  ]
} as const;

const jobSchemaTyped = toTypedRxJsonSchema(jobSchemaLiteral);
export type JobDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof jobSchemaTyped>;
export const jobSchema: RxJsonSchema<JobDocType> = jobSchemaLiteral;

// --- Types & helpers ---

export type EntryJob = {
  type: "processEntry";
  id: string;
  createdAt: number;
  entryId: string;
  status: "pending";
  attempts: number;
  maxAttempts: number;
  updatedAt: number;
  priority?: number;      // optional in docs, required by factory (can default)
  error?: string;
  scheduledAt?: number;
  lockedUntil?: number;
};

// Factory: clamps priority into 1..5 and ensures integer-like timestamps.
export const createEntryJobParams = (
  entryId: string,
  priority: number = 3,
  maxAttempts: number = 3
): EntryJob => {
  const now = Date.now();
  const p = Math.max(1, Math.min(5, Math.round(priority)));
  return {
    id: crypto.randomUUID(),
    type: "processEntry",
    entryId,
    status: "pending",
    priority: p,
    attempts: 0,
    maxAttempts: Math.max(1, Math.round(maxAttempts)),
    createdAt: now,
    updatedAt: now
  };
};
