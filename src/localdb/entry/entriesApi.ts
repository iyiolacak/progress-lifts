import { RxCollection, RxDocument } from "rxdb";
import {
  DEFAULT_CONTEXT_ENTRIES,
  DEFAULT_JOB_PRIORITY,
  DEFAULT_MAX_ATTEMPTS,
  DEFAULT_RECENT_LIMIT,
} from "../dbConstants";
import { AudioStatus, EntryDocType } from "../schema/entry";
import { JobDocType } from "../schema/jobs";
import { formatAbsoluteDate, formatTimeAgo } from "@/lib/utils";
import { DatabaseError } from "../errors";

type EntryCollectionWithHelpers = RxCollection<EntryDocType> & {
  getLastEntryIds(beforeTs: number, limit?: number): Promise<string[]>;
};

type JobCollectionWithHelpers = RxCollection<JobDocType> & {
  createJob(
    entryId: string,
    priority?: number,
    maxAttempts?: number
  ): Promise<RxDocument<JobDocType>>;
};

export function entryStatics() {
  return {

    addEntry: async function(
      this: RxCollection<EntryDocType>,
      params: {
        content: Omit<EntryDocType["content"], "phaseA" | "phaseB">;
        audioConvertingToEntryText?: AudioStatus;
      }
    ) {
      const createdAt = Date.now();
      const id = crypto.randomUUID();
      const givenContext = await (this as EntryCollectionWithHelpers).getLastEntryIds(
        createdAt,
        DEFAULT_CONTEXT_ENTRIES
      );

      const asyncControl: EntryDocType["asyncControl"] = {
        enrichmentStatus: "idle",
        enrichedAt: undefined,
        error: undefined,
        audioConvertingToEntryText:
          params.audioConvertingToEntryText ?? ("done" as AudioStatus),
      };

      const doc = await this.insert({
        id,
        createdAt,
        givenContext,
        asyncControl,
        content: {
          ...(params.content ?? {}),
          phaseA: { entryText: "" },
          phaseB: {},
        },
      } as EntryDocType);

      // job creation
      (this.database.collections.jobs as JobCollectionWithHelpers)
        .createJob(id, DEFAULT_JOB_PRIORITY, DEFAULT_MAX_ATTEMPTS)
        .catch((e: unknown) =>
          console.warn("createJob failed for entry", id, e)
        );

      return doc;
    },

    listRecent: async function(
      this: RxCollection<EntryDocType>,
      limit = DEFAULT_RECENT_LIMIT
    ) {
      const docs = await this.find({
        sort: [{ createdAt: "desc" }, { id: "desc" }],
        limit,
      }).exec();
      return docs.map((d) => d.toJSON());
    },

    getLastEntryIds: async function(
      this: RxCollection<EntryDocType>,
      beforeTs: number,
      limit = DEFAULT_CONTEXT_ENTRIES
    ) {
      const docs = await this.find({
        selector: { createdAt: { $lte: beforeTs } },
        sort: [{ createdAt: "desc" }, { id: "desc" }],
        limit,
      }).exec();

      return docs.map((d: RxDocument<EntryDocType>) => d.id ?? d.get?.("id"));
    },

    convertIdsToContent: async function(
      this: RxCollection<EntryDocType>,
      ids: readonly string[],
      {
        relativeDate = true,
        locale = "en",
        preserveInputOrder = false,
      }: {
        relativeDate?: boolean;
        locale?: string;
        preserveInputOrder?: boolean;
      } = {}
    ): Promise<[string, string][]> {
      if (!ids?.length) return [];
      const docs = await this.find({
        selector: { id: { $in: ids as string[] } },
        sort: preserveInputOrder
          ? undefined
          : [{ createdAt: "desc" }, { id: "desc" }],
      }).exec();
      if (!docs.length) return [];

      const toDateStr = (ts: number) =>
        relativeDate
          ? formatTimeAgo(ts, locale)
          : formatAbsoluteDate(ts, locale);

      const rows: [string, string][] = [];
      for (const d of docs as RxDocument<EntryDocType>[]) {
        const status = d.asyncControl
          ?.audioConvertingToEntryText as AudioStatus;
        if (status === "error")
          throw new DatabaseError(
            `Audio→text failed for ${d.id}`,
            "convertIdsToContent"
          );
        if (status === "processing")
          throw new DatabaseError(
            `Audio→text still processing for ${d.id}`,
            "convertIdsToContent"
          );
        const text = d.content?.phaseA?.entryText?.trim?.();
        if (!text)
          throw new DatabaseError(
            `No text for entry ${d.id}`,
            "convertIdsToContent"
          );
        rows.push([text, toDateStr(d.createdAt)]);
      }

      if (!preserveInputOrder) return rows;
      const byId = new Map(
        (docs as RxDocument<EntryDocType>[]).map((doc, i) => [doc.id, rows[i]])
      );
      return ids.map((id) => byId.get(id)).filter(Boolean) as [
        string,
        string
      ][];
    },
  };
}

export function entryMethods() {
  return {
    updateAudioStatus: async function(
      this: RxDocument<EntryDocType>,
      status: AudioStatus
    ) {
      return this.incrementalPatch({
        asyncControl: { audioConvertingToEntryText: status },
      });
    },

    markAsEnriched: async function(this: RxDocument<EntryDocType>) {
      return this.incrementalPatch({
        asyncControl: {
          enrichmentStatus: "done",
          enrichedAt: new Date().toISOString(),
        },
      });
    },
  };
}
