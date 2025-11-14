import {
  ExtractDocumentTypeFromTypedRxJsonSchema,
  RxJsonSchema,
  toTypedRxJsonSchema,
} from "rxdb";

export const entrySchemaLiteral = {
  title: "Entry",
  version: 0,
  primaryKey: "id",
  type: "object",
  additionalProperties: false,
  properties: {
    id: { type: "string", maxLength: 128 },
    kind: { type: "string", enum: ["text", "audio"] },
    createdAt: { type: "integer", minimum: 0, maximum: 32503680000000, multipleOf: 1 },
    updatedAt: { type: "integer", minimum: 0, maximum: 32503680000000, multipleOf: 1 },

    content: {
      type: "object",
      additionalProperties: false,
      properties: {
        phaseA: {
          type: "object",
          additionalProperties: false,
          properties: {
            entryText: { type: "string" },
            audioAttachmentId: { type: "string" },
          },
        },
        phaseB: {
          type: "object",
          additionalProperties: false,
          properties: {
            gainedXp: { type: "number", multipleOf: 1 },
            est_minutes_for_the_task: { type: "integer", minimum: 0, multipleOf: 1 },
            complexity: { type: "integer", minimum: 0, maximum: 100, multipleOf: 1 }, // <-- added
            tags: { type: "array", items: { type: "string" } },
            possibleMoodRegardingContext: { type: "number", minimum: 0, maximum: 100, multipleOf: 1 },
            meta: {
              type: "object",
              additionalProperties: false,
              properties: { raw: { type: "string" } },
            },
          },
        },
      },
      required: [],
    },

    givenContext: { type: "array", items: { type: "string", maxLength: 128 }, maxItems: 5 },

    asyncControl: {
      type: "object",
      additionalProperties: false,
      properties: {
        audioConvertingToEntryText: { type: "string", enum: ["idle", "processing", "done", "error"] },
        enrichmentStatus: { type: "string", enum: ["idle", "queued", "running", "done", "error"] },
        enrichedAt: { type: "string", format: "date-time" },
        error: { type: "string" },
      },
    },

    tagsFlat: { type: "array", items: { type: "string" } },
  },

  required: ["id", "kind", "createdAt", "updatedAt", "givenContext"],
  indexes: [
    "createdAt",
    ["createdAt", "content.phaseB.complexity"],
    ["createdAt", "id"],
  ],
} as const;

const entrySchemaTyped = toTypedRxJsonSchema(entrySchemaLiteral);
export type EntryDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof entrySchemaTyped>;
export const entrySchema: RxJsonSchema<EntryDocType> = entrySchemaLiteral;

// If you keep "idle" above, consider:
export type AudioStatus = "idle" | "processing" | "done" | "error";
// or, if you don't want "idle" at runtime, remove it from the schema enum instead.
