import { RxJsonSchema } from "rxdb";

export type JobDoc = {
  id: string; // pk (uuid)
  type: "processEntry"; // narrow with a union as you add more
  entryId: string;

  status: "pending" | "running" | "completed" | "failed";
  priority?: number; // higher runs first (optional)
  attempts: number; // how many times we tried
  maxAttempts: number; // cap retries

  createdAt: number;
  updatedAt: number;

  // lock/visibility timeout to avoid double work
  lockedUntil?: number; // epoch ms; job is invisible while locked

  // backoff scheduling
  scheduledAt?: number; // earliest time this job can run

  error?: string; // last error message (optional)
};

export const jobSchema: RxJsonSchema<JobDoc> = {
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
    },
    priority: { type: "number" }, // 1 to 5

    attempts: { type: "number", minimum: 0 },
    maxAttempts: { type: "number", minimum: 1 },

    createdAt: { type: "number", minimum: 0 },
    updatedAt: { type: "number", minimum: 0 },

    lockedUntil: { type: "number" },
    scheduledAt: { type: "number" },

    error: { type: "string" },
  },
  required: [
    "id",
    "type",
    "entryId",
    "status",
    "attempts",
    "maxAttempts",
    "createdAt",
    "updatedAt",
  ],
  indexes: [
    // core claiming path: find eligible jobs
    ["status", "scheduledAt", "lockedUntil", "priority"],
    "entryId",
  ],
} as const;
