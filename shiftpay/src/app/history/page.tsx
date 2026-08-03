"use client";

import { Inbox } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState } from "@/components/common/DataState";
import { EntryCard } from "@/components/history/EntryCard";
import { FilterPills } from "@/components/history/FilterPills";
import { useEntryData } from "@/hooks/useEntries";
import { useEntriesStore } from "@/lib/store";

export default function HistoryPage() {
  const { filteredEntries } = useEntryData();
  const loaded = useEntriesStore((state) => state.loaded);
  const status = useEntriesStore((state) => state.status);
  const error = useEntriesStore((state) => state.error);
  const loadEntries = useEntriesStore((state) => state.loadEntries);
  const openDetail = useEntriesStore((state) => state.openDetail);

  return (
    <AppShell>
      <h1 className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-slate-600">History</h1>
      <FilterPills />
      <div className="mt-4 space-y-3">
        {loaded && status === "error" && error && (
          <div className="rounded-xl bg-loss-light px-3 py-2 text-sm text-loss">
            {error} <button className="font-bold underline" onClick={() => void loadEntries(true)}>Retry</button>
          </div>
        )}
        {!loaded && status !== "error" ? (
          Array.from({ length: 4 }, (_, index) => <div key={index} className="h-24 animate-pulse rounded-2xl bg-white/75" />)
        ) : status === "error" && !loaded ? (
          <ErrorState message={error ?? "Google Sheets is unavailable."} onRetry={() => void loadEntries()} />
        ) : filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center text-slate-400">
            <Inbox size={34} className="text-blue-500" />
            <p className="mt-3 text-sm font-medium">No entries for this period</p>
          </div>
        ) : (
          filteredEntries.map((entry) => <EntryCard key={entry.id} entry={entry} onOpen={() => openDetail(entry.id)} />)
        )}
      </div>
    </AppShell>
  );
}
