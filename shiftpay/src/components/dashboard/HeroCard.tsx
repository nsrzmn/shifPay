"use client";

import { ClipboardList } from "lucide-react";
import { formatCurrency, formatHours } from "@/lib/calculations";
import type { ShiftEntry } from "@/lib/types";

export function HeroCard({ entry, onOpen }: { entry?: ShiftEntry; onOpen: () => void }) {
  if (!entry) {
    return (
      <section className="card flex min-h-36 flex-col items-center justify-center px-5 py-7 text-center">
        <ClipboardList className="text-orange-400" size={30} aria-hidden="true" />
        <h1 className="mt-3 font-bold">No entry for today yet</h1>
        <p className="mt-1 text-sm text-muted">Record your shift when you’re done.</p>
      </section>
    );
  }

  const negative = entry.netEarnings < 0;
  return (
    <button type="button" onClick={onOpen} className={`w-full rounded-2xl p-5 text-left text-white shadow-card ${negative ? "bg-loss" : "bg-earn"}`}>
      <p className="text-sm font-medium text-white/75">Today’s net earnings</p>
      <p className="numeric mt-1 text-4xl font-bold tracking-tight">{formatCurrency(entry.netEarnings)}</p>
      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
        <div><p className="text-xs text-white/70">Hours worked</p><p className="numeric mt-1 font-semibold">{formatHours(entry.hoursWorked)}</p></div>
        <div><p className="text-xs text-white/70">Per hour</p><p className="numeric mt-1 font-semibold">{formatCurrency(entry.hourlyRate)}/h</p></div>
      </div>
    </button>
  );
}
