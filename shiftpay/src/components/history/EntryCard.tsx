"use client";

import { ChevronRight } from "lucide-react";
import { formatCardDate, formatCurrency, formatHours } from "@/lib/calculations";
import type { ShiftEntry } from "@/lib/types";

export function EntryCard({ entry, onOpen }: { entry: ShiftEntry; onOpen: () => void }) {
  const deductions = entry.fines + entry.otherExpenses;
  return (
    <button type="button" onClick={onOpen} className="card flex w-full items-center gap-3 p-4 text-left">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{formatCardDate(entry.date)}</p>
        <div className="mt-2 flex gap-3 text-xs text-muted">
          <span className="numeric">{formatHours(entry.hoursWorked)}</span>
          <span className="numeric">{formatCurrency(entry.hourlyRate)}/h</span>
          {deductions > 0 && <span className="numeric text-loss">−{formatCurrency(deductions)}</span>}
        </div>
      </div>
      <p className={`numeric text-lg font-bold ${entry.netEarnings < 0 ? "text-loss" : "text-earn"}`}>{formatCurrency(entry.netEarnings)}</p>
      <ChevronRight size={18} className="text-slate-300" />
    </button>
  );
}
