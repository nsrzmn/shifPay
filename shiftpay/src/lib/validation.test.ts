import { describe, expect, it } from "vitest";
import { entryInputSchema } from "@/lib/validation";

const valid = {
  date: "2026-08-03",
  hoursWorked: 0,
  deliveryEarnings: 0,
  tips: 0,
  fines: 0,
  otherExpenses: 0,
  notes: "",
};

describe("entryInputSchema", () => {
  it("accepts zero hours and a future date", () => {
    expect(entryInputSchema.safeParse(valid).success).toBe(true);
    expect(entryInputSchema.safeParse({ ...valid, date: "2099-12-31" }).success).toBe(true);
  });

  it("rejects invalid calendar dates and negative money", () => {
    expect(entryInputSchema.safeParse({ ...valid, date: "2026-02-30" }).success).toBe(false);
    expect(entryInputSchema.safeParse({ ...valid, fines: -1 }).success).toBe(false);
  });

  it("trims notes and limits their length", () => {
    expect(entryInputSchema.parse({ ...valid, notes: "  busy shift  " }).notes).toBe("busy shift");
    expect(entryInputSchema.safeParse({ ...valid, notes: "x".repeat(2001) }).success).toBe(false);
  });
});
