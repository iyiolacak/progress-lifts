"use client";

import { useEffect, useState } from "react";
import type { Subscription } from "rxjs";

import { getDB } from "@/localdb/db";
import type { EntryDocType } from "@/localdb/schema/entry";

/**
 * Hook that streams entries from the local RxDB instance.
 * Components can call this and focus purely on rendering.
 */
export function useEntriesObserver() {
  const [entries, setEntries] = useState<EntryDocType[]>([]);

  useEffect(() => {
    let subscription: Subscription | undefined;
    let cancelled = false;

    getDB()
      .then((db) => {
        if (cancelled) return;
        const query = db.collections.entries.find();
        subscription = query.$.subscribe((docs) => {
          if (!docs) return;
          setEntries(docs.map((doc) => doc.toMutableJSON()));
        });
      })
      .catch((err) => {
        console.error("Entries observer failed:", err);
      });

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, []);

  return entries;
}

export async function solveContextEntries(entry: EntryDocType) {
  const contextIds = entry.givenContext || [];

  if (!contextIds.length) return [];

  const db = await getDB();
  const entriesCollection = db.collections.entries;
  const contextEntries = await Promise.all(
    contextIds.map((id) => entriesCollection.findOne(id).exec())
  );
  return contextEntries.filter(Boolean).map((doc) => doc!.toMutableJSON());
}
