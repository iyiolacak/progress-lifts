import { RxCollection, RxDocument } from "rxdb";
import { DatabaseError, EntryNotFoundError, InvalidJobStateError } from "../errors";
import { createEntryJobParams, JobDocType } from "../schema/jobs";
import { DEFAULT_JOB_PRIORITY, DEFAULT_MAX_ATTEMPTS } from "../dbConstants";

function jobStatics() {
  return {
    async createJob(this: RxCollection<JobDocType>, entryId: string, priority = DEFAULT_JOB_PRIORITY, maxAttempts = DEFAULT_MAX_ATTEMPTS) {
      if (priority < 1 || priority > 5) throw new DatabaseError("Priority must be between 1 and 5", "createJob");
      if (maxAttempts < 1) throw new DatabaseError("maxAttempts must be ≥ 1", "createJob");
      const entry = await this.database.collections.entries.findOne(entryId).exec();
      if (!entry) throw new EntryNotFoundError(entryId);
      const data = createEntryJobParams(entryId, priority, maxAttempts);
      return this.insert(data);
    },
    async fetchNextJob(this: RxCollection<JobDocType>) {
      const docs = await this.find({
        selector: { status: "pending", attempts: { $lt: { $max: "maxAttempts" } }, scheduledAt: { $lte: Date.now() } },
        sort: [{ priority: "asc" }, { createdAt: "asc" }, { id: "asc" }],
        limit: 1,
      }).exec();
      if (!docs.length) return null;
      return docs[0];
    },
  };
}

function jobMethods() {
  return {
    async startJob(this: RxDocument<JobDocType>) {
      if (this.status !== "pending") throw new InvalidJobStateError(this.id, this.status, "pending");
      return this.incrementalModify((doc: JobDocType) => ({
        ...doc, status: "running", attempts: doc.attempts + 1, updatedAt: Date.now(),
      }));
    },
    async completeJob(this: RxDocument<JobDocType>, result?: unknown) {
      // result not in schema; add to schema if you want it persisted
      return this.incrementalModify((doc: JobDocType) => ({ ...doc, status: "completed", updatedAt: Date.now() }));
    },
    async failJob(this: RxDocument<JobDocType>, error: string) {
      return this.incrementalModify((doc: JobDocType) => ({
        ...doc, status: doc.attempts >= doc.maxAttempts ? "failed" : "pending", error, updatedAt: Date.now(),
      }));
    },
  };
}

export { jobStatics, jobMethods };