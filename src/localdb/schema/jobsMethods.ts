import { RxDocument } from "rxdb";

type JobCollectionMethods = {
    createJob: (
        this: RxDocument,
        entryId: string,
        priority?: number,
        maxAttempts?: number
    ) => Promise<RxDocument>;
    startAJob: (this: RxDocument, jobId: string) => Promise<RxDocument>;
};
} 
const jobMethods: RxDocument<JobCollectionMethods = {

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

        const entryJobParams = {
          id: crypto.randomUUID(),
          type: "processEntry",
          entryId,
          status: "pending",
          priority,
          attempts: 0,
          maxAttempts,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        return this.insert(entryJobParams);

        // TODO: Parse context content from ID to provide to the API(LLM service).
      },
      startAJob: async function (jobId: string) {
        const job = await this.findOne(jobId).exec();
        if (!job) throw new Error("Job not found");
        if (job.get("status") !== "pending")
          throw new Error("Job is not pending");

        job.set({
          status: "in-progress",
          attempts: job.get("attempts") + 1,
          updatedAt: Date.now(),
        });
        await job.save();
        return job;
      }
    }