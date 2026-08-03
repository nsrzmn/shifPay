"use client";

import { FormEvent, useMemo, useState } from "react";
import { calculateEntryValues, formatCurrency, getUtcToday } from "@/lib/calculations";
import { ApiRequestError } from "@/lib/api-client";
import { useEntriesStore } from "@/lib/store";
import type { EntryInput, ShiftEntry } from "@/lib/types";
import { entryInputSchema } from "@/lib/validation";
import { BottomSheet } from "@/components/modals/BottomSheet";

type FormValues = Record<"date" | "hoursWorked" | "deliveryEarnings" | "tips" | "fines" | "otherExpenses" | "notes", string>;

function initialValues(entry: ShiftEntry | null): FormValues {
  return {
    date: entry?.date ?? getUtcToday(),
    hoursWorked: String(entry?.hoursWorked ?? 0),
    deliveryEarnings: String(entry?.deliveryEarnings ?? 0),
    tips: String(entry?.tips ?? 0),
    fines: String(entry?.fines ?? 0),
    otherExpenses: String(entry?.otherExpenses ?? 0),
    notes: entry?.notes ?? "",
  };
}

const numericFields = ["hoursWorked", "deliveryEarnings", "tips", "fines", "otherExpenses"] as const;

export function EntryForm({ mode, entry }: { mode: "create" | "edit"; entry: ShiftEntry | null }) {
  const closeModal = useEntriesStore((state) => state.closeModal);
  const createEntry = useEntriesStore((state) => state.createEntry);
  const updateEntry = useEntriesStore((state) => state.updateEntry);
  const openDetail = useEntriesStore((state) => state.openDetail);
  const entries = useEntriesStore((state) => state.entries);
  const status = useEntriesStore((state) => state.status);
  const [values, setValues] = useState<FormValues>(() => initialValues(entry));
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const input = useMemo<EntryInput>(
    () => ({
      date: values.date,
      hoursWorked: Number(values.hoursWorked),
      deliveryEarnings: Number(values.deliveryEarnings),
      tips: Number(values.tips),
      fines: Number(values.fines),
      otherExpenses: Number(values.otherExpenses),
      notes: values.notes,
    }),
    [values],
  );
  const preview = calculateEntryValues(input);

  function updateField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: [] }));
    setFormError(null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    const blankNumber = numericFields.find((field) => values[field].trim() === "");
    if (blankNumber) {
      setErrors({ [blankNumber]: ["Enter a number"] });
      return;
    }
    const parsed = entryInputSchema.safeParse(input);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    try {
      if (mode === "edit" && entry) {
        await updateEntry(entry.id, { ...parsed.data, updatedAt: entry.updatedAt });
      } else {
        await createEntry(parsed.data);
      }
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setErrors(error.fieldErrors ?? {});
        setFormError(error.message);
      } else {
        setFormError("Could not save this entry.");
      }
    }
  }

  const duplicate = entries.find((candidate) => candidate.date === values.date && candidate.id !== entry?.id);
  const saving = status === "saving";

  return (
    <BottomSheet open title={mode === "edit" ? "Edit Entry" : "Today’s Entry"} onClose={closeModal}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FormField label="Date" error={errors.date?.[0]}>
          <input type="date" className="field numeric" value={values.date} onChange={(event) => updateField("date", event.target.value)} required />
        </FormField>

        <FormField label="Hours worked" error={errors.hoursWorked?.[0]}>
          <input type="number" min="0" step="any" inputMode="decimal" className="field numeric" value={values.hoursWorked} onChange={(event) => updateField("hoursWorked", event.target.value)} />
        </FormField>

        <fieldset className="space-y-3 rounded-2xl border border-green-200 bg-earn-light p-3.5">
          <legend className="px-1 text-xs font-bold text-earn">Earnings</legend>
          <MoneyField label="Delivery earnings" field="deliveryEarnings" value={values.deliveryEarnings} error={errors.deliveryEarnings?.[0]} onChange={updateField} />
          <MoneyField label="Tips" field="tips" value={values.tips} error={errors.tips?.[0]} onChange={updateField} />
        </fieldset>

        <fieldset className="space-y-3 rounded-2xl border border-red-200 bg-loss-light p-3.5">
          <legend className="px-1 text-xs font-bold text-loss">Deductions</legend>
          <MoneyField label="Fines" field="fines" value={values.fines} error={errors.fines?.[0]} onChange={updateField} />
          <MoneyField label="Other expenses" field="otherExpenses" value={values.otherExpenses} error={errors.otherExpenses?.[0]} onChange={updateField} />
        </fieldset>

        <FormField label="Notes (optional)" error={errors.notes?.[0]}>
          <textarea className="field min-h-24 resize-none" maxLength={2000} placeholder="e.g. Weekend bonus active" value={values.notes} onChange={(event) => updateField("notes", event.target.value)} />
        </FormField>

        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-surface p-4">
          <div>
            <p className="text-xs text-muted">Net earnings</p>
            <p className={`numeric mt-1 text-lg font-bold ${preview.netEarnings < 0 ? "text-loss" : "text-earn"}`}>{formatCurrency(preview.netEarnings)}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Per hour</p>
            <p className={`numeric mt-1 text-lg font-bold ${preview.hourlyRate < 0 ? "text-loss" : "text-earn"}`}>{formatCurrency(preview.hourlyRate)}</p>
          </div>
        </div>

        {formError && (
          <div role="alert" className="rounded-xl bg-loss-light px-3 py-2 text-sm text-loss">
            <p>{formError}</p>
            {duplicate && (
              <button type="button" onClick={() => openDetail(duplicate.id)} className="mt-2 font-bold underline">
                View the existing entry
              </button>
            )}
          </div>
        )}

        <button type="submit" disabled={saving} className="w-full rounded-2xl bg-earn px-4 py-3.5 font-bold text-white shadow-lg shadow-green-800/15 disabled:opacity-60">
          {saving ? "Saving…" : mode === "edit" ? "Save Changes" : "Add Entry"}
        </button>
      </form>
    </BottomSheet>
  );
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-loss">{error}</span>}
    </label>
  );
}

function MoneyField({
  label,
  field,
  value,
  error,
  onChange,
}: {
  label: string;
  field: keyof FormValues;
  value: string;
  error?: string;
  onChange: (field: keyof FormValues, value: string) => void;
}) {
  return (
    <FormField label={`${label} (€)`} error={error}>
      <input type="number" min="0" step="0.01" inputMode="decimal" className="field numeric bg-white/80" value={value} onChange={(event) => onChange(field, event.target.value)} />
    </FormField>
  );
}
