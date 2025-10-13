import { RxCollection, RxDatabase } from "rxdb";
import { LogDocType } from "../schema/log";
import { JobDocType } from "../schema/jobs";
import { EntryDocType } from "../schema/entry";

export type Collections = {
  // phaseA = input; phaseB = enrichment written later.
  // Immutable past, additive future.
  entries: RxCollection<EntryDocType>;
  // Job (command): “please do X to that entry.”
  // Lifecycle = pending → running → completed | failed.
  // Also has: priority, attempts, maxAttempts, scheduledAt, lockedUntil, error.
  jobs: RxCollection<JobDocType>;
  // Worker (runtime): a loop that claims one job at a time, runs a handler, updates job, logs facts. It’s not React.
  // You just start it from React (or anywhere).
  logs: RxCollection<LogDocType>;
};
export type AppDatabase = RxDatabase<Collections>;

export type ProcessEntryPayload = {
  entryId: string;
};

// Pull the document type out of RxCollection<Doc>.
// @example type EntryDoc = DocOf<Collections['entries']>;
export type DocOf<C> = C extends RxCollection<infer D> ? D : never;

// Pull phaseB type out of EntryDocType or any TDoc with content.phaseB.
// @example: type EntryPhaseB = PhaseBOf<EntryDocType>;
export type PhaseBOf<TDoc> =
  TDoc extends { content?: { phaseB?: infer P } } ? NonNullable<P>
  : never;

export type EntryPhaseB = PhaseBOf<EntryDocType>;
