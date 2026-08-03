import { describe, expect, it } from "vitest";
import {
  buildSevenDayData,
  calculateEntryValues,
  calculateNetEarnings,
  getUtcMonthRange,
  getUtcWeekRange,
  roundMoney,
} from "@/lib/calculations";
import type { EntryInput, ShiftEntry } from "@/lib/types";

const input: EntryInput = {
  date: "2026-08-03",
  hoursWorked: 7.5,
  deliveryEarnings: 98.5,
  tips: 14,
  fines: 0,
  otherExpenses: 5.5,
  notes: "",
};

describe("earnings calculations", () => {
  it("calculates net earnings and hourly rate", () => {
    expect(calculateNetEarnings(input)).toBe(107);
    expect(calculateEntryValues(input)).toEqual({ netEarnings: 107, hourlyRate: 14.27 });
  });

  it("returns a zero hourly rate for zero hours", () => {
    expect(calculateEntryValues({ ...input, hoursWorked: 0 }).hourlyRate).toBe(0);
  });

  it("supports negative net earnings and cent-safe rounding", () => {
    expect(calculateNetEarnings({ ...input, deliveryEarnings: 0.1, tips: 0.2, fines: 1, otherExpenses: 0 })).toBe(-0.7);
    expect(roundMoney(1.005)).toBe(1.01);
  });
});

describe("UTC periods", () => {
  it("uses Monday through Sunday for weeks", () => {
    expect(getUtcWeekRange(new Date("2026-08-09T23:59:00Z"))).toEqual({ start: "2026-08-03", end: "2026-08-09" });
  });

  it("handles leap-year month boundaries", () => {
    expect(getUtcMonthRange(new Date("2024-02-15T00:00:00Z"))).toEqual({ start: "2024-02-01", end: "2024-02-29" });
  });

  it("fills missing days in the seven-day chart", () => {
    const entry: ShiftEntry = {
      ...input,
      id: "9f45e00d-2de3-4c25-ae9a-308462f99bd2",
      date: "2026-08-03",
      netEarnings: 107,
      hourlyRate: 14.27,
      createdAt: "2026-08-03T20:00:00.000Z",
      updatedAt: "2026-08-03T20:00:00.000Z",
    };
    const data = buildSevenDayData([entry], new Date("2026-08-03T22:00:00Z"));
    expect(data).toHaveLength(7);
    expect(data.at(-1)).toMatchObject({ date: "2026-08-03", netEarnings: 107 });
    expect(data.slice(0, -1).every((point) => point.netEarnings === 0)).toBe(true);
  });
});
