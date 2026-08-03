import type { EntryInput, SevenDayPoint, ShiftEntry } from "@/lib/types";

const EUR_FORMATTER = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const DATE_HEADING_FORMATTER = new Intl.DateTimeFormat("en-IE", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

const DATE_CARD_FORMATTER = new Intl.DateTimeFormat("en-IE", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function toCents(value: number): number {
  return Math.round((value + Number.EPSILON) * 100);
}

export function fromCents(value: number): number {
  return Math.round(value) / 100;
}

export function roundMoney(value: number): number {
  return fromCents(toCents(value));
}

export function calculateNetEarnings(input: EntryInput): number {
  const cents =
    toCents(input.deliveryEarnings) +
    toCents(input.tips) -
    toCents(input.fines) -
    toCents(input.otherExpenses);
  return fromCents(cents);
}

export function calculateHourlyRate(netEarnings: number, hoursWorked: number): number {
  if (hoursWorked === 0) return 0;
  return roundMoney(netEarnings / hoursWorked);
}

export function calculateEntryValues(input: EntryInput) {
  const netEarnings = calculateNetEarnings(input);
  return {
    netEarnings,
    hourlyRate: calculateHourlyRate(netEarnings, input.hoursWorked),
  };
}

export function formatCurrency(value: number): string {
  return EUR_FORMATTER.format(value);
}

export function parseDateOnly(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

export function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getUtcToday(now = new Date()): string {
  return toDateOnly(now);
}

export function addUtcDays(date: string, amount: number): string {
  const value = parseDateOnly(date);
  value.setUTCDate(value.getUTCDate() + amount);
  return toDateOnly(value);
}

export function getUtcWeekRange(now = new Date()) {
  const today = getUtcToday(now);
  const day = parseDateOnly(today).getUTCDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const start = addUtcDays(today, mondayOffset);
  return { start, end: addUtcDays(start, 6) };
}

export function getUtcMonthRange(now = new Date()) {
  const start = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end: addUtcDays(toDateOnly(nextMonth), -1) };
}

export function isDateInRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

export function sumNetEarnings(entries: ShiftEntry[]): number {
  return fromCents(entries.reduce((total, entry) => total + toCents(entry.netEarnings), 0));
}

export function getPeriodTotal(entries: ShiftEntry[], range: { start: string; end: string }): number {
  return sumNetEarnings(entries.filter((entry) => isDateInRange(entry.date, range.start, range.end)));
}

export function buildSevenDayData(entries: ShiftEntry[], now = new Date()): SevenDayPoint[] {
  const today = getUtcToday(now);
  return Array.from({ length: 7 }, (_, index) => {
    const date = addUtcDays(today, index - 6);
    const dailyTotal = sumNetEarnings(entries.filter((entry) => entry.date === date));
    return {
      date,
      label: new Intl.DateTimeFormat("en-IE", { weekday: "narrow", timeZone: "UTC" }).format(parseDateOnly(date)),
      netEarnings: dailyTotal,
    };
  });
}

export function formatHeadingDate(date: string): string {
  return DATE_HEADING_FORMATTER.format(parseDateOnly(date));
}

export function formatCardDate(date: string): string {
  return DATE_CARD_FORMATTER.format(parseDateOnly(date));
}

export function formatHours(hours: number): string {
  return `${new Intl.NumberFormat("en-IE", { maximumFractionDigits: 2 }).format(hours)}h`;
}
