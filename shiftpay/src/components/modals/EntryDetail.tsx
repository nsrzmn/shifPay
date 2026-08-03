"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { ApiRequestError } from "@/lib/api-client";
import { formatCardDate, formatCurrency, formatHours } from "@/lib/calculations";
import { useEntriesStore } from "@/lib/store";
import type { ShiftEntry } from "@/lib/types";
import { BottomSheet } from "@/components/modals/BottomSheet";

export function EntryDetail({ entry }: { entry: ShiftEntry }) {
  const closeModal = useEntriesStore((state) => state.closeModal);
  const openEdit = useEntriesStore((state) => state.openEdit);
  const deleteEntry = useEntriesStore((state) => state.deleteEntry);
  const status = useEntriesStore((state) => state.status);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setError(null);
    try {
      await deleteEntry(entry.id, entry.updatedAt);
    } catch (deleteError) {
      setError(deleteError instanceof ApiRequestError ? deleteError.message : "Could not delete this entry.");
    }
  }

  return (
    <BottomSheet open title="Entry Details" description={formatCardDate(entry.date)} onClose={closeModal}>
      <div className="space-y-4">
        <div className={`rounded-2xl p-5 text-white ${entry.netEarnings < 0 ? "bg-loss" : "bg-earn"}`}>
          <p className="text-sm opacity-80">Net earnings</p>
          <p className="numeric mt-1 text-4xl font-bold">{formatCurrency(entry.netEarnings)}</p>
          <div className="mt-4 flex gap-6 text-sm">
            <span><span className="opacity-75">Hours </span><strong className="numeric">{formatHours(entry.hoursWorked)}</strong></span>
            <span><span className="opacity-75">Rate </span><strong className="numeric">{formatCurrency(entry.hourlyRate)}/h</strong></span>
          </div>
        </div>

        <div className="card divide-y divide-border px-4">
          <DetailRow label="Delivery earnings" value={entry.deliveryEarnings} />
          <DetailRow label="Tips" value={entry.tips} />
          <DetailRow label="Fines" value={-entry.fines} negative />
          <DetailRow label="Other expenses" value={-entry.otherExpenses} negative />
        </div>

        {entry.notes && <div className="rounded-2xl bg-surface p-4"><p className="text-xs font-semibold text-muted">Notes</p><p className="mt-2 whitespace-pre-wrap text-sm">{entry.notes}</p></div>}

        {error && <p role="alert" className="rounded-xl bg-loss-light px-3 py-2 text-sm text-loss">{error}</p>}

        {confirming ? (
          <div className="rounded-2xl border border-red-200 bg-loss-light p-4">
            <p className="font-semibold text-loss">Delete this entry permanently?</p>
            <p className="mt-1 text-sm text-slate-600">The row will be removed from Google Sheets.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setConfirming(false)} className="rounded-xl border border-border bg-white px-3 py-2.5 font-semibold">Cancel</button>
              <button type="button" onClick={remove} disabled={status === "saving"} className="rounded-xl bg-loss px-3 py-2.5 font-semibold text-white disabled:opacity-60">{status === "saving" ? "Deleting…" : "Delete"}</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <button type="button" onClick={() => openEdit(entry.id)} className="flex items-center justify-center gap-2 rounded-2xl bg-earn px-4 py-3.5 font-bold text-white"><Pencil size={18} /> Edit Entry</button>
            <button type="button" onClick={() => setConfirming(true)} className="rounded-2xl border border-red-200 px-4 text-loss" aria-label="Delete entry"><Trash2 size={20} /></button>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}

function DetailRow({ label, value, negative = false }: { label: string; value: number; negative?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 text-sm">
      <span className="text-muted">{label}</span>
      <span className={`numeric font-semibold ${negative ? "text-loss" : "text-ink"}`}>{formatCurrency(value)}</span>
    </div>
  );
}
