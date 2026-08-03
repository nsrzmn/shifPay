"use client";

import { useEntriesStore } from "@/lib/store";
import type { HistoryFilter } from "@/lib/types";

const filters: { value: HistoryFilter; label: string }[] = [
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "all", label: "All" },
];

export function FilterPills() {
  const active = useEntriesStore((state) => state.filter);
  const setFilter = useEntriesStore((state) => state.setFilter);
  return (
    <div className="grid grid-cols-3 gap-2" aria-label="Filter history">
      {filters.map((filter) => (
        <button
          key={filter.value}
          type="button"
          onClick={() => setFilter(filter.value)}
          aria-pressed={active === filter.value}
          className={`rounded-xl border px-2 py-2 text-sm font-semibold transition ${active === filter.value ? "border-earn bg-earn text-white" : "border-border bg-white text-slate-500"}`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
