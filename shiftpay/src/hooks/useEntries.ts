"use client";

import { useEffect, useMemo } from "react";
import { getPeriodTotal, getUtcMonthRange, getUtcToday, getUtcWeekRange, isDateInRange } from "@/lib/calculations";
import { useEntriesStore } from "@/lib/store";

export function useEntryBootstrap() {
  const loadEntries = useEntriesStore((state) => state.loadEntries);

  useEffect(() => {
    void loadEntries();
    const refresh = () => void loadEntries(true);
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("online", refresh);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("online", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [loadEntries]);
}

export function useEntryData() {
  const entries = useEntriesStore((state) => state.entries);
  const filter = useEntriesStore((state) => state.filter);

  return useMemo(() => {
    const now = new Date();
    const today = getUtcToday(now);
    const week = getUtcWeekRange(now);
    const month = getUtcMonthRange(now);
    const filteredEntries = entries.filter((entry) => {
      if (filter === "all") return true;
      const range = filter === "week" ? week : month;
      return isDateInRange(entry.date, range.start, range.end);
    });

    return {
      today,
      todayEntry: entries.find((entry) => entry.date === today),
      weekTotal: getPeriodTotal(entries, week),
      monthTotal: getPeriodTotal(entries, month),
      filteredEntries,
    };
  }, [entries, filter]);
}

export function useSelectedEntry() {
  const entries = useEntriesStore((state) => state.entries);
  const selectedEntryId = useEntriesStore((state) => state.selectedEntryId);
  return entries.find((entry) => entry.id === selectedEntryId) ?? null;
}
