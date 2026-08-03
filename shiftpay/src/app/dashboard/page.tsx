"use client";

import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingCards } from "@/components/common/DataState";
import { HeroCard } from "@/components/dashboard/HeroCard";
import { SevenDayChart } from "@/components/dashboard/SevenDayChart";
import { TotalsRow } from "@/components/dashboard/TotalsRow";
import { useEntryData } from "@/hooks/useEntries";
import { formatHeadingDate } from "@/lib/calculations";
import { useEntriesStore } from "@/lib/store";

export default function DashboardPage() {
  const { today, todayEntry, weekTotal, monthTotal } = useEntryData();
  const entries = useEntriesStore((state) => state.entries);
  const loaded = useEntriesStore((state) => state.loaded);
  const status = useEntriesStore((state) => state.status);
  const error = useEntriesStore((state) => state.error);
  const loadEntries = useEntriesStore((state) => state.loadEntries);
  const openCreate = useEntriesStore((state) => state.openCreate);
  const openDetail = useEntriesStore((state) => state.openDetail);

  return (
    <AppShell>
      <p className="mb-4 text-sm font-semibold">{formatHeadingDate(today)}</p>
      {!loaded && status !== "error" ? (
        <LoadingCards />
      ) : status === "error" && !loaded ? (
        <ErrorState message={error ?? "Google Sheets is unavailable."} onRetry={() => void loadEntries()} />
      ) : (
        <div className="space-y-4">
          {status === "error" && error && <div className="rounded-xl bg-loss-light px-3 py-2 text-sm text-loss">{error} <button className="font-bold underline" onClick={() => void loadEntries(true)}>Retry</button></div>}
          <HeroCard entry={todayEntry} onOpen={() => todayEntry && openDetail(todayEntry.id)} />
          <TotalsRow weekTotal={weekTotal} monthTotal={monthTotal} />
          <SevenDayChart entries={entries} />
          <button
            type="button"
            onClick={() => todayEntry ? openDetail(todayEntry.id) : openCreate()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-earn px-4 py-3.5 font-bold text-white shadow-lg shadow-green-800/15 transition active:scale-[0.99]"
          >
            {!todayEntry && <Plus size={19} strokeWidth={3} />}
            {todayEntry ? "View Today’s Entry" : "Add Today’s Entry"}
          </button>
        </div>
      )}
    </AppShell>
  );
}
