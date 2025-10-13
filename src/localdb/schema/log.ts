// schema/log.ts
import {
  ExtractDocumentTypeFromTypedRxJsonSchema,
  RxJsonSchema,
  toTypedRxJsonSchema,
} from "rxdb";

/**
 * Append-only, immutable log record.
 * Write small, structured facts that the UI can render immediately.
 */
export const logSchemaLiteralV1 = {
  title: "Logs",
  version: 0,
  primaryKey: "id",
  type: "object",
  additionalProperties: false,
  properties: {
    id: { type: "string", maxLength: 128 },        // uuid
  createdAt: { type: "integer", minimum: 0, maximum: 32503680000000, multipleOf: 1 },     // epoch ms
    // Where did this event happen?
    entity: {
      type: "object",
      additionalProperties: false,
      properties: {
        type: { type: "string", maxLength: 64 },                  // "entry" | "job" | "system" | ...
        id:   { type: "string", maxLength: 128 },
      },
      required: ["type"],
    },
    // Traceability across multiple logs
  correlationId: { type: "string", maxLength: 128 },             // tie related logs (e.g., jobId)
  spanId: { type: "string" },                    // a unit of work
  parentSpanId: { type: "string" },

    // What happened?
  level: { type: "string", enum: ["debug","info","warn","error"], maxLength: 16 },
    event: { type: "string" },                     // short action keyword, e.g., "job.started"
    message: { type: "string" },                   // UI-friendly 1-liner

    // Structured details (small; redact secrets)
    data: { type: "object", additionalProperties: true },

    // Optional: duration in ms when closing a span
    durationMs: { type: "number" },

    // Lightweight source attribution
    source: {
      type: "object",
      additionalProperties: false,
      properties: {
        app: { type: "string" },                   // e.g., "web"
        module: { type: "string" },                // e.g., "jobs", "entries"
      },
    },

    // Soft-delete/retention: mark prunable without touching historical integrity
    ttlAfter: { type: "number" },                  // epoch ms; eligible for pruning after this time
  },
  required: ["id", "createdAt", "entity", "level", "event"],
  // Indexes must only include required fields for Dexie storage.
  indexes: [
    ["entity.type", "createdAt"],
    ["level", "createdAt"],
    "createdAt",
  ],
} as const;

const logSchemaTyped = toTypedRxJsonSchema(logSchemaLiteralV1);
export type LogDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof logSchemaTyped>;
export const logSchema: RxJsonSchema<LogDocType> = logSchemaLiteralV1;

export const logsMigrationStrategies = {
  // migrate documents from version 0 -> 1
  0: (doc: any) => doc
} as const;