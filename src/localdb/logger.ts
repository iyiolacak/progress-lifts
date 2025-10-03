// lib/logger.ts
import type { RxCollection } from "rxdb";
import type { LogDocType } from "@/localdb/schema/log";

export type LogsCollection = RxCollection<LogDocType>;

export type LogInput = {
  entity: { type: string; id?: string };
  level?: "debug" | "info" | "warn" | "error";
  event: string;
  message?: string;
  data?: Record<string, unknown>;
  correlationId?: string;
  spanId?: string;
  parentSpanId?: string;
  source?: { app?: string; module?: string };
  ttlMs?: number; // retention hint from now
};

export function createLogger(col: LogsCollection) {
  const now = () => Date.now();
  const uuid = () => crypto.randomUUID();

  async function write(log: LogInput) {
    const createdAt = now();
    const ttlAfter = log.ttlMs ? createdAt + Math.max(0, log.ttlMs) : undefined;
    return col.insert({
      id: uuid(),
      createdAt,
      entity: log.entity,
      level: log.level ?? "info",
      event: log.event,
      message: log.message ?? "",
      data: log.data,
      correlationId: log.correlationId,
      spanId: log.spanId,
      parentSpanId: log.parentSpanId,
      source: log.source,
      ttlAfter,
    } as LogDocType);
  }

  /** Start a span (returns spanId and a closure to end it). */
  async function startSpan(init: Omit<LogInput, "spanId"> & { spanId?: string }) {
    const spanId = init.spanId ?? uuid();
    await write({
      ...init,
      spanId,
      event: init.event || "span.started",
      message: init.message ?? "Started",
      level: init.level ?? "info",
    });
    const startedAt = Date.now();
    return {
      spanId,
      async end(final?: {
        event?: string;
        message?: string;
        level?: "debug" | "info" | "warn" | "error";
        data?: Record<string, unknown>;
      }) {
        const durationMs = Date.now() - startedAt;
        await col.insert({
          id: uuid(),
          createdAt: Date.now(),
          entity: init.entity,
          level: final?.level ?? "info",
          event: final?.event ?? "span.ended",
          message: final?.message ?? "Completed",
          data: final?.data,
          correlationId: init.correlationId,
          spanId,
          parentSpanId: init.parentSpanId,
          source: init.source,
          durationMs,
        } as LogDocType);
      },
      async error(err: unknown, extra?: Partial<LogInput>) {
        const durationMs = Date.now() - startedAt;
        const payload = stringifyError(err);
        await col.insert({
          id: uuid(),
          createdAt: Date.now(),
          entity: init.entity,
          level: "error",
          event: "span.error",
          message: payload.message,
          data: { ...payload.data, ...extra?.data },
          correlationId: init.correlationId,
          spanId,
          parentSpanId: init.parentSpanId,
          source: init.source,
          durationMs,
        } as LogDocType);
      },
    };
  }

  return { write, startSpan };
}

function stringifyError(err: unknown): { message: string; data: Record<string, unknown> } {
  if (err instanceof Error) {
    return {
      message: err.message,
      data: { name: err.name, stack: err.stack },
    };
  }
  return { message: String(err), data: {} };
}

/** Simple pruning (call from a periodic task / leader tab). */
export async function pruneExpired(col: LogsCollection) {
  const now = Date.now();
  const docs = await col
    .find({ selector: { ttlAfter: { $lte: now } }, limit: 500 })
    .exec();
  for (const d of docs) {
    await d.remove();
  }
}
