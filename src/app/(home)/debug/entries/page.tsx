"use client";
import React from 'react'
import { useEntriesObserver } from '../entriesObserver'
import EntryCard from '../entry-card';
import { entryMethods } from '@/localdb/entry/entriesApi';

const EntriesPage = () => {
    const entries = useEntriesObserver();
  return (
    <div>
        {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
        ))}
    </div>
  )
}

export default EntriesPage