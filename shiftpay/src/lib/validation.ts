import { z } from "zod";

function isRealDateOnly(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

const nonNegativeFinite = z.number({ invalid_type_error: "Enter a valid number" }).finite().nonnegative();

export const entryInputSchema = z
  .object({
    date: z.string().refine(isRealDateOnly, "Enter a valid date"),
    hoursWorked: nonNegativeFinite,
    deliveryEarnings: nonNegativeFinite,
    tips: nonNegativeFinite,
    fines: nonNegativeFinite,
    otherExpenses: nonNegativeFinite,
    notes: z.string().trim().max(2000, "Notes must be 2,000 characters or fewer").default(""),
  })
  .strict();

export const entryUpdateSchema = entryInputSchema.extend({
  updatedAt: z.string().datetime(),
});

export const shiftEntrySchema = entryInputSchema.extend({
  id: z.string().uuid(),
  netEarnings: z.number().finite(),
  hourlyRate: z.number().finite(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type EntryInputValues = z.infer<typeof entryInputSchema>;
