import { entrySchema } from "@/localdb/schema/entry";
import { addRxPlugin, createRxDatabase, RxCollection, RxCollectionBase } from "rxdb/plugins/core";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";
import { EntryDoc } from "./schema/entry";
import { JobDoc, jobSchema } from "./schema/jobs";

const DATABASE_NAME = "locally-loop-rxdb";

const db = await createRxDatabase({
  name: DATABASE_NAME,
  storage: getRxStorageDexie(),
});

export const entriesCollection = await db.addCollections({
  entries: {
    schema: entrySchema,
    statics: {
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
      async claimNextJob(this: RxCollection<JobDoc>) {
        const now = Date.now();

        const job = await this
        .findOne({
          selector: {
            status: "pending",
          },
        }
      }
    },
  }
})

db.collections.entries.preInsert(async function (plain: EntryDoc) {
  if (typeof plain.createdAt !== "number") plain.createdAt = Date.now();
  const ids = await db.collections.entries.statics.getLastFiveIds();
  plain.givenContext = ids; // already capped to 5 by the query
}, false);
