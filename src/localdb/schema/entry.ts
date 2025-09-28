import {
  ExtractDocumentTypeFromTypedRxJsonSchema,
  RxJsonSchema,
  toTypedRxJsonSchema,
} from "rxdb";

// export type EntryDoc = {
//   id: string;                       // primary
//   kind: "text" | "audio";
//   createdAt: number;                // epoch ms (canonical)
//   content: {
//     phaseA?: {
//       entryText?: string;
//       // Prefer RxDB attachments for binary audio; keep pointer only if needed.
//       audioAttachmentId?: string;
//     };
//     phaseB?: {
//       gainedXp?: number;
//       est_minutes_for_the_task?: number;
//       complexity?: number;
//       tags?: string[];
//       possibleMoodRegardingContext?: number; // 0..100
//       meta?: {                              // was metadata
//         raw?: string;                       // was metadata.metadata
//       };
//     };
//   };
//   givenContext: string[];           // last-5 IDs at insert time (frozen)
//   asyncControl?: {
//     enrichmentStatus?: "idle" | "queued" | "running" | "done" | "error";
//     enrichedAt?: string;            // ISO 8601
//     error?: string;
//   };
//   // Optional denormalization for tag search; consider a separate TagIndex collection instead.
//   tagsFlat?: string[];
// };

export const entrySchemaLiteral = {
  title: "Entry",
  version: 0,
  primaryKey: "id",
  type: "object",
  additionalProperties: false,
  properties: {
    id: { type: "string", maxLength: 128 },
    kind: { type: "string", enum: ["text", "audio"] },
    createdAt: { type: "number", minimum: 0 },

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
            gainedXp: { type: "number" },
            est_minutes_for_the_task: { type: "number" },
            complexity: { type: "number" },
            tags: {
              type: "array",
              items: { type: "string" },
            },
            possibleMoodRegardingContext: {
              type: "number",
              minimum: 0,
              maximum: 100,
            },
            meta: {
              type: "object",
              additionalProperties: false,
              properties: {
                raw: { type: "string" },
              },
            },
          },
        },
      },
      required: [],
    },

    givenContext: {
      type: "array",
      items: { type: "string", maxLength: 128 },
      maxItems: 5,
      // Set final only if you actually enable AJV validation with wrappedValidateAjvStorage
      // final: true,
    },

    asyncControl: {
      type: "object",
      additionalProperties: false,
      properties: {
        audioConvertingToEntryText: {
          type: "string",
          enum: ["processing", "done", "error"], // If entry is not an audio, this field is "done" by default.
        },
        enrichmentStatus: {
          type: "string",
          enum: ["idle", "queued", "running", "done", "error"],
        },
        enrichedAt: { type: "string", format: "date-time" },
        error: { type: "string" },
      },
    },

    tagsFlat: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["id", "kind", "createdAt", "givenContext"],
  indexes: [
    "createdAt",
    ["createdAt", "content.phaseB.tags"],
    ["createdAt", "content.phaseB.complexity"],
    ["createdAt", "id"],
  ],
} as const;

const entrySchemaTyped = toTypedRxJsonSchema(entrySchemaLiteral);

export type EntryDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof entrySchemaTyped
>;
export const entrySchema: RxJsonSchema<EntryDocType> = entrySchemaLiteral;

export type AudioStatus = "processing" | "done" | "error";