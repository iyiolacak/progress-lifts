import { AudioStatus, entrySchemaLiteral } from "@/localdb/schema/entry";
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
import { formatAbsoluteDate, formatTimeAgo } from "@/lib/utils";
addRxPlugin(RxDBLeaderElectionPlugin);

// Types
export type Collections = {
  entries: RxCollection<EntryDocType>;
  jobs: RxCollection<JobDocType>;
};

export type DB = RxDatabase<Collections>;

type Options = {
  relativeDate?: boolean;
  locale?: string;
  preserveInputOrder?: boolean; // if true, output follows `ids` order
};

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
let dbPromise: Promise<DB> | null = null;

export function getDB(): Promise<DB> {
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
            /**
             * Convert entry IDs to [[text, dateStr], ...]
             */
            async convertIdsToContent(
              this: RxCollection<EntryDocType>,
              ids: readonly string[],
              {
                relativeDate = true,
                locale = "en",
                preserveInputOrder = false,
              }: Options = {}
            ): Promise<string[][]> {
              if (!ids?.length) return [];

              const docs = await this.find({
                selector: { id: { $in: ids as string[] } },
                sort: [{ createdAt: "desc" }, { id: "desc" }],
              }).exec();

              if (docs.length === 0) return [];

              if (docs.length !== ids.length) {
                console.warn(
                  `convertIdsToContent: some IDs not found. requested=${ids.length} found=${docs.length}`
                );
              }

              const toDateStr = (createdAt: EntryDocType["createdAt"]) =>
                relativeDate
                  ? formatTimeAgo(createdAt, locale)
                  : formatAbsoluteDate(createdAt, locale);

              // Build result rows
              const rows = docs.map((d) => {
                const status = d.asyncControl
                  ?.audioConvertingToEntryText as AudioStatus;
                if (status === "error") {
                  throw new Error(
                    "Audio→text failed: entry has no usable text."
                  );
                }
                if (status === "processing") {
                  throw new Error("Audio→text is still processing.");
                }

                const text = d.content?.phaseA?.entryText?.trim();
                if (!text) {
                  throw new Error(`No text for entry ${d.id ?? d.get?.("id")}`);
                }

                return [text, toDateStr(d.createdAt)] as [string, string];
              });

              if (!preserveInputOrder) return rows;

              // Stable reorder to match input `ids` when requested
              const byId = new Map<string, [string, string]>();
              for (let i = 0; i < docs.length; i++) {
                // ts-ignore rxdb doc typings: prefer doc.id if available
                const docId = (docs[i].id ?? docs[i].get?.("id")) as string;
                byId.set(docId, rows[i]);
              }

              const ordered: string[][] = [];
              for (const id of ids) {
                const row = byId.get(id);
                if (row) ordered.push(row);
              }
              return ordered;
            },
          },
          methods: {},
          attachments: {},
          options: {},
        },
        jobs: {
          schema: jobSchemaLiteral,
          methods: {
            sendToLLM: async function (
              this: RxDocument<JobDocType>,
              prompt: string,
              apiKey: string,
              model: string
            ): Promise<string> {
              // Send the given prompt to the LLM specified in this job's entry
              // Returns the LLM response text
              // Throws on error
              const entryId = this.get("entryId");
              const entry = await db.collections.entries
                .findOne(entryId)
                .exec();
              if (!entry) throw new Error("Entry not found");

              // Call the API
              const response = await fetch(
                "https://api.openai.com/v1/chat/completions",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                  },
                  body: JSON.stringify({
                    model,
                    messages: [{ role: "user", content: prompt }],
                  }),
                }
              );

              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                  `LLM API error: ${response.status} ${response.statusText} - ${errorText}`
                );
              }

              const data = await response.json();
              const text = data.choices?.[0]?.message?.content;
              if (!text) throw new Error("No response from LLM");

              return text;
            },
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
