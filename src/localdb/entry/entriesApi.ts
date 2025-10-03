import { RxCollection, RxDocument } from "rxdb";
import { DEFAULT_CONTEXT_ENTRIES, DEFAULT_JOB_PRIORITY, DEFAULT_MAX_ATTEMPTS, DEFAULT_RECENT_LIMIT } from "../dbConstants";
import { AudioStatus, EntryDocType } from "../schema/entry";
import { formatAbsoluteDate, formatTimeAgo } from "@/lib/utils";
import { DatabaseError } from "../errors";

function entryStatics() {
  return {
    async addEntry(this: RxCollection<EntryDocType>, params: {
      content: Omit<EntryDocType["content"], "phaseA" | "phaseB">;
      audioConvertingToEntryText?: AudioStatus; // use "done" by default
    }) {
      const createdAt = Date.now();
      const id = crypto.randomUUID();
      const givenContext = await this.statics.getLastEntryIds(createdAt, DEFAULT_CONTEXT_ENTRIES);

      const asyncControl: EntryDocType["asyncControl"] = {
        enrichmentStatus: "idle",
        enrichedAt: undefined,
        error: undefined,
        audioConvertingToEntryText: params.audioConvertingToEntryText ?? ("done" as AudioStatus),
      };

      const doc = await this.insert({
        id, createdAt, givenContext, asyncControl,
        content: { ...(params.content ?? {}), phaseA: { entryText: "" }, phaseB: {} },
      } as EntryDocType);

      // best-effort job creation
      (this.database.collections.jobs.statics) // Todo: add "as JobsCollectionStatics"
        .createJob(id, DEFAULT_JOB_PRIORITY, DEFAULT_MAX_ATTEMPTS)
        .catch((e: unknown) => console.warn("createJob failed for entry", id, e));

      return doc;
    },

    async listRecent(this: RxCollection<EntryDocType>, limit = DEFAULT_RECENT_LIMIT) {
      const docs = await this.find({ sort: [{ createdAt: "desc" }, { id: "desc" }], limit }).exec();
      return docs.map((d) => d.toJSON());
    },

    async getLastEntryIds(this: RxCollection<EntryDocType>, beforeTs: number, limit = DEFAULT_CONTEXT_ENTRIES) {
      const docs = await this.find({
        selector: { createdAt: { $lte: beforeTs } },
        sort: [{ createdAt: "desc" }, { id: "desc" }],
        limit,
      }).exec();
      // RxDoc typing: prefer field access, fallback to get()
      return docs.map((d: RxDocument<EntryDocType>) => d.id ?? d.get?.("id"));
    },

    async convertIdsToContent(
      this: RxCollection<EntryDocType>,
      ids: readonly string[],
      { relativeDate = true, locale = "en", preserveInputOrder = false }: {
        relativeDate?: boolean; locale?: string; preserveInputOrder?: boolean;
      } = {}
    ): Promise<[string, string][]> {
      if (!ids?.length) return [];
      const docs = await this.find({
        selector: { id: { $in: ids as string[] } },
        sort: preserveInputOrder ? undefined : [{ createdAt: "desc" }, { id: "desc" }],
      }).exec();
      if (!docs.length) return [];

      const toDateStr = (ts: number) => relativeDate ? formatTimeAgo(ts, locale) : formatAbsoluteDate(ts, locale);

      const rows: [string, string][] = [];
      for (const d of docs as any[]) {
        const status = d.asyncControl?.audioConvertingToEntryText as AudioStatus;
        if (status === "error") throw new DatabaseError(`Audio→text failed for ${d.id}`, "convertIdsToContent");
        if (status === "processing") throw new DatabaseError(`Audio→text still processing for ${d.id}`, "convertIdsToContent");
        const text = d.content?.phaseA?.entryText?.trim?.();
        if (!text) throw new DatabaseError(`No text for entry ${d.id}`, "convertIdsToContent");
        rows.push([text, toDateStr(d.createdAt)]);
      }

      if (!preserveInputOrder) return rows;
      const map = new Map(rows.map((r, i) => [ (docs[i] as any).id, r ]));
      return ids.map((id) => map.get(id)).filter(Boolean) as [string, string][];
    },
  };
}

function entryMethods() {
  return {
    async updateAudioStatus(this: RxDocument<EntryDocType>, status: AudioStatus) {
      return this.incrementalPatch({ asyncControl: { audioConvertingToEntryText: status }});
    },
    async markAsEnriched(this: RxDocument<EntryDocType>) {
      // NOTE: your schema expects ISO string for enrichedAt; convert if needed.
      return this.incrementalPatch({ asyncControl: { enrichmentStatus: "done", enrichedAt: new Date().toISOString() } });
    },
  }
}
export default { entryStatics, entryMethods };