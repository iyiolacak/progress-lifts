"use client"

import type { EntryDocType } from "@/localdb/schema/entry"
import { solveContextEntries } from "./entriesObserver";
type Opts = {
    timeFormat: "formatAbsoluteDate" | "formatTimeAgo";

}
type EntryCardProps = {
  entry: EntryDocType
  solvedContext: EntryDocType[];
  opts: Opts
}

const EntryCard = ({ entry, solvedContext, opts }: EntryCardProps) => {
  const text = entry.content?.phaseA?.entryText ?? "(no text)"
  const context = entry.givenContext ?? []
  const status = entry.asyncControl?.enrichmentStatus ?? "unknown"
  const solvedContextEntries = solveContextEntries(entry)

  return (
    <div className="flex w-full flex-col gap-2 rounded-md bg-product-gray p-4 text-white">
      <div className="text-xs uppercase tracking-wide text-slate-300">Entry</div>
      <div className="text-sm font-medium">{text}</div>
      <div className="text-xs opacity-80">id: {entry.id}</div>
      {context.length ? (
        <div className="text-xs opacity-80">context: {context.join(", ")}</div>
      ) : null}
      {solvedContextEntries.map((entry) => {})}
      <div className="text-xs opacity-80">status: {status}</div>
    </div>
  )
}

export default EntryCard
