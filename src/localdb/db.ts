import { entrySchemaLiteral } from "@/localdb/schema/entry";
import {
  addRxPlugin,
  createRxDatabase,
  RxCollection,
  RxCollectionBase,
  RxDatabase,
  RxDocument,
} from "rxdb/plugins/core";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";
import { EntryDocType } from "./schema/entry";
import {
  createEntryJobParams,
  EntryJob,
  JobDocType,
  jobSchemaLiteral,
} from "./schema/jobs";
import { RxDBLeaderElectionPlugin } from "rxdb/plugins/leader-election";
addRxPlugin(RxDBLeaderElectionPlugin);

// Types
export type Collections = {
  entries: RxCollection<EntryDocType>;
  jobs: RxCollection<JobDocType>;
};

export type DB = RxDatabase<Collections>;

const DATABASE_NAME = "local-do-rush-rxdb";

async function enableDevMode() {
  if (process.env.NODE_ENV !== "production") {
    const { RxDBDevModePlugin, disableWarnings } = await import(
      "rxdb/plugins/dev-mode"
    );
    addRxPlugin(RxDBDevModePlugin);
    disableWarnings();
  }
}

const storage = wrappedValidateAjvStorage({
  storage: getRxStorageDexie(),
});

// Create / ensure DB + collections
export function getDB(): Promise<DB> {
  let dbPromise: Promise<DB> | null = null;
  console.log("DatabaseService: creating database..");
  if (!dbPromise) {
    dbPromise = (async () => {
      await enableDevMode();

      const db = await createRxDatabase({
        name: DATABASE_NAME,
        storage,
        // multiInstance: false,
        // eventReduce: true,
      });
      console.log("DatabaseService: Database created");

      // Create collections
      console.log("DatabaseService: create collections");
      await db.addCollections({
        entries: {
          schema: entrySchemaLiteral,
          statics: {
            async addEntry(
              this: RxCollection<EntryDocType>,
              entry: Omit<
                EntryDocType,
                "id" | "createdAt" | "givenContext" | "asyncControl"
              >
            ) {
              const createdAt = Date.now();
              const id = crypto.randomUUID();
              const givenContext = await this.statics.getLastFiveIds(createdAt);
              // Phase A

              const initialAsyncControl = {
                enrichmentStatus: "idle",
                enrichedAt: undefined,
                error: undefined,
              } as EntryDocType["asyncControl"];

              // insert
              const doc = await this.insert({
                ...entry,
                id,
                createdAt,
                givenContext,
                asyncControl: initialAsyncControl,
              });

              await db.collections.jobs.statics.createJob(id);

              return doc;
            },
            async listRecent(limit = 20): Promise<EntryDocType[]> {
              const docs: RxDocument<EntryDocType>[] = await this.find({
                sort: [{ createdAt: "desc" }, { id: "desc" }],
                limit,
              }).exec();

              return docs.map((d: RxDocument<EntryDocType>) =>
                JSON.parse(JSON.stringify(d.toJSON()))
              );
            },
            async getLastFiveIds(
              this: RxCollection<EntryDocType>,
              beforeTs: number
            ): Promise<string[]> {
              const docs = await this.find({
                selector: { createdAt: { $lte: beforeTs } },
                sort: [{ createdAt: "desc" }, { id: "desc" }],
                limit: 5,
              }).exec();
              return docs.map((d) => d.get("id"));
            },
            // Last five IDs to text to consume.
            async convertIdsToText(
              this: RxCollection<EntryDocType>,
              ids: string[]
            ): Promise<string[]> {
              // Get the 5 entries by their IDs, sorted by createdAt desc
              const docs = await this.find({
                selector: { id: { $in: ids } },
                sort: [{ createdAt: "desc" }, { id: "desc" }],
              }).exec();

              // Checks
              if (docs.length === 0) {
                return [];
              }
              if (docs.length !== ids.length) {
                console.warn(
                  `convertIdsToText: some IDs not found. Requested ${ids.length}, found ${docs.length}`
                );
              }

              // Extract their text content and return that.
              return docs.map((d) => {
                const text = d.content?.phaseA?.entryText?.trim();
                if (!text) {
                  console.warn(
                    `convertIdsToText: entry ${d.get(
                      "id"
                    )} has no text content. Returning empty string.`
                  );
                }
                const exceptionStatus =
                  d.asyncControl?.audioConvertingToEntryText;
                if (exceptionStatus === "error") {
                  throw new Error(
                    "Audio to text conversion was failed. There are no entry text and this entry has a slightly rooted problem"
                  );
                }
                if (exceptionStatus === "processing") {
                  throw new Error("Audio to text is still processing");
                }

                if (!text) {
                  throw new Error(`There are no text for entry ${d.id}`);
                }

                // Return the entry text if it exists, otherwise an empty string (or null as needed)
                return text ?? "";
              });
            },
          },
          methods: {},
          attachments: {},
          options: {},
        },
        jobs: {
          schema: jobSchemaLiteral,
          methods: {
            startJob: async function (
              this: RxCollection<JobDocType>,
              jobId: string
            ) {
              const job = await this.findOne(jobId).exec();
              if (!job) throw new Error("Job not found");
              if (job.get("status") !== "pending")
                throw new Error("Job is not pending");

              await job.incrementalModify((doc) => ({
                ...doc,
                status: "running",
                attempts: doc.attempts + 1,
                updatedAt: Date.now(),
                // Optionally, you can add startedAt if your schema supports it
              }));

              return job;
            },
          },
          statics: {
            createJob: async function (
              this: RxCollection<JobDocType>,
              entryId: string,
              priority = 3,
              maxAttempts = 5
            ) {
              // Issue a new job to process the given entry
              // (if you call this multiple times for the same entry, you'll get multiple jobs)
              // Priority is 1 (highest) to 5 (lowest); default is 3
              // maxAttempts is how many times we try before giving up; default is 5
              // Returns the created job document
              if (priority < 1 || priority > 5)
                throw new Error("Priority must be between 1 and 5");
              if (maxAttempts < 1)
                throw new Error("maxAttempts must be at least 1");

              return this.insert(
                createEntryJobParams(entryId, priority, maxAttempts)
              );
            },
          },
        },
      });
      console.log("DatabaseService: collections created");

      // Set up hooks
      // Whenever we add a new entry, we set its givenContext to the last 5 entries
      db.collections.entries.preInsert(async function (plain: EntryDocType) {
        if (typeof plain.createdAt !== "number") plain.createdAt = Date.now();
        const ids = await db.collections.entries.statics.getLastFiveIds(
          plain.createdAt
        );
        plain.givenContext = ids; // already capped to 5 by the query
      }, false);

      return db as unknown as DB;
    })();
  }
  return dbPromise;
}
