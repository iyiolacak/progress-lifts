import { addRxPlugin, createRxDatabase, RxCollection } from "rxdb/plugins/core";
import { RxDBLeaderElectionPlugin } from "rxdb/plugins/leader-election";
import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { RxDBMigrationSchemaPlugin } from "rxdb/plugins/migration-schema";

import { EntryDocType, entrySchemaLiteral } from "@/localdb/schema/entry";
import { jobSchemaLiteral } from "@/localdb/schema/jobs";
import { logSchemaLiteralV1, logsMigrationStrategies } from "@/localdb/schema/log";
import { createLogger } from "./logger";
import { DATABASE_NAME, DEFAULT_CONTEXT_ENTRIES } from "./dbConstants";
import { jobMethods, jobStatics } from "./job/jobApi";
import { entryMethods, entryStatics } from "./entry/entriesApi";
import { AppDatabase, Collections } from "./types/types";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";

addRxPlugin(RxDBMigrationSchemaPlugin);
addRxPlugin(RxDBLeaderElectionPlugin);
addRxPlugin(RxDBQueryBuilderPlugin);

if (process.env.NODE_ENV === 'development') {
  addRxPlugin(RxDBDevModePlugin);
}

//
// Architecture:
// - UI writes Entries (truth).
// - Entries enqueue Jobs (commands).
// - A Worker (runtime) claims jobs, calls Handlers (business steps), which use Ports (LLM adapter)
//   and write results back. Logs tell the story.
// - React only observes.
//

// ---- module-scope singleton (HMR/StrictMode safe) ----
let _dbPromise: Promise<AppDatabase> | null = null;
let _disposeInterval: number | null = null;

export async function getDB(): Promise<AppDatabase> {
  if (_dbPromise) return _dbPromise;
  _dbPromise = createDatabase();
  console.log("Database initializing...");
  return _dbPromise;
}

export async function resetDBForTests(): Promise<void> {
  if (_dbPromise) {
    const db = await _dbPromise;
    const removeDb = await db.remove();
    console.log("Database removed:", removeDb);
    _dbPromise = null;
    if (_disposeInterval) {
      clearInterval(_disposeInterval);
      _disposeInterval = null;
    }
  }
}

// ---- factory ----
async function createDatabase(): Promise<AppDatabase> {
  await enableDevMode();

  const storage = wrappedValidateAjvStorage({ storage: getRxStorageDexie() });

  let db: AppDatabase;
  try {
    db = await createRxDatabase<Collections>({ name: DATABASE_NAME, storage, ignoreDuplicate: true });
    await db.addCollections({
      entries: {
        schema: entrySchemaLiteral,
        statics: entryStatics(),
        methods: entryMethods(),
      },
      jobs: {
        schema: jobSchemaLiteral,
        statics: jobStatics(),
        methods: jobMethods(),
      },
      logs: {
        schema: logSchemaLiteralV1,
      },
    });
  } catch (e) {
    console.error("createRxDatabase failed:", e);
    throw e;
  }

  // logger + hooks (post-save logging)
  const logger = createLogger(db.collections.logs);
  setupHooks(db, logger);

  return db;
}

export const destroyDb = async (db: AppDatabase) => {
  try {
    const removeDb = await db.remove();
    console.log("Database disposed:", removeDb);
  } catch (e) {
    console.warn("Error during database dispose:", e);
  }
};

// ---- dev-mode (tree-shake safe) ----
async function enableDevMode() {
  if (process.env.NODE_ENV !== "production") {
    try {
      const { RxDBDevModePlugin } = await import("rxdb/plugins/dev-mode");
      addRxPlugin(RxDBDevModePlugin);
    } catch {
      /* ignore missing dev plugin in prod bundles */
    }
  }
}

// ---- logging hooks (post-save) ----
function setupHooks(db: AppDatabase, logger: ReturnType<typeof createLogger>) {
  // keep context fresh
  const entriesCollection = db.collections.entries as typeof db.collections.entries & ReturnType<typeof entryStatics>;

  db.collections.entries.preInsert(async (plain) => {
    if (typeof plain.createdAt !== "number") plain.createdAt = Date.now();
    plain.givenContext = await entriesCollection.getLastEntryIds(
      plain.createdAt,
      DEFAULT_CONTEXT_ENTRIES
    );
  }, false);

  db.collections.entries.postInsert(async (docData: any) => {
    await logger.write({
      entity: { type: "entry", id: docData.id },
      correlationId: docData.id,
      level: "info",
      event: "entry.inserted",
      message: "Entry created",
      data: {
        createdAt: docData.createdAt,
        hasText: !!docData?.content?.phaseA?.entryText,
        givenContextLen: (docData?.givenContext ?? []).length,
      },
      source: { app: "web", module: "entries" },
      ttlMs: 1000 * 60 * 60 * 24 * 30,
    });
  }, false);

  db.collections.entries.postSave(async (docData: any) => {
    await logger.write({
      entity: { type: "entry", id: docData.id },
      correlationId: docData.id,
      level: "info",
      event: "entry.saved",
      message: "Entry updated",
      data: { enrichmentStatus: docData?.asyncControl?.enrichmentStatus },
      source: { app: "web", module: "entries" },
    });
  }, false);

  db.collections.jobs.postInsert(async (docData: any) => {
    await logger.write({
      entity: { type: "job", id: docData.id },
      correlationId: docData.id,
      level: "info",
      event: "job.enqueued",
      message: `Job enqueued (priority=${docData.priority ?? 3})`,
      data: {
        type: docData.type,
        entryId: docData.entryId,
        attempts: docData.attempts,
        maxAttempts: docData.maxAttempts,
      },
      source: { app: "web", module: "jobs" },
    });
  }, false);

  db.collections.jobs.postSave(async (docData: any) => {
    const status: string = docData.status;
    await logger.write({
      entity: { type: "job", id: docData.id },
      correlationId: docData.id,
      level: status === "failed" ? "error" : status === "running" ? "debug" : "info",
      event: `job.${status}`,
      message: `Job ${status}`,
      data: { attempts: docData.attempts, error: docData.error, updatedAt: docData.updatedAt },
      source: { app: "web", module: "jobs" },
    });
  }, false);
}
