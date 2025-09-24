import { entrySchema } from "@/localdb/schema/entry";
import {
  addRxPlugin,
  createRxDatabase,
  RxCollection,
  RxCollectionBase,
} from "rxdb/plugins/core";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";
import { EntryDoc } from "./schema/entry";
import { JobDoc, jobSchema } from "./schema/jobs";

const DATABASE_NAME = "locally-loop-rxdb";

const db = await createRxDatabase({
  name: DATABASE_NAME,
  storage: getRxStorageDexie(),
  // multiInstance: false,
  // eventReduce: true,
});

export const entriesCollection = await db.addCollections({
  entries: {
    schema: entrySchema,
    statics: {
      async addEntry(
        this: RxCollection<EntryDoc>,
        entry: Omit<EntryDoc, "id" | "createdAt" | "givenContext">
      ) {
        const createdAt = Date.now();
        const id = crypto.randomUUID();
        const givenContext = await this.statics.getLastFiveIds(createdAt);
        // Phase A
        const doc = await this.insert({
          ...entry,
          id,
          createdAt,
          givenContext,
        });

        await db.collections.jobs.statics.createJob(id);
        
        return doc;
      },
      async getLastFiveIds(this: RxCollection<EntryDoc>): Promise<string[]> {
        const docs = await this.find({
          selector: {},
          sort: [{ createdAt: "desc" }, { id: "desc" }],
          limit: 5,
        }).exec();
        return docs.map((d) => d.get("id"));
      },
    },
    methods: {},
    attachments: {},
    options: {},
  },
});

export const jobsCollection = await db.addCollections({
  jobs: {
    schema: jobSchema,
    statics: {
      createJob: async function (
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
        if (maxAttempts < 1) throw new Error("maxAttempts must be at least 1");
        return this.insert({
          id: crypto.randomUUID(),
          type: "processEntry",
          entryId,
          status: "pending",
          priority,
          attempts: 0,
          maxAttempts,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      },
    },
  },
});

db.collections.entries.preInsert(async function (plain: EntryDoc) {
  if (typeof plain.createdAt !== "number") plain.createdAt = Date.now();
  const ids = await db.collections.entries.statics.getLastFiveIds();
  plain.givenContext = ids; // already capped to 5 by the query
}, false);
