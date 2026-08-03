import { expect, test } from "@playwright/test";

test("login and complete the entry lifecycle", async ({ page }) => {
  const today = new Date().toISOString().slice(0, 10);
  let entries: Record<string, unknown>[] = [];

  await page.route("**/api/entries**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.method() === "GET") {
      await route.fulfill({ json: { data: entries } });
      return;
    }
    if (request.method() === "POST") {
      const input = request.postDataJSON();
      const entry = {
        ...input,
        id: "9f45e00d-2de3-4c25-ae9a-308462f99bd2",
        netEarnings: input.deliveryEarnings + input.tips - input.fines - input.otherExpenses,
        hourlyRate: 15,
        createdAt: "2026-08-03T20:00:00.000Z",
        updatedAt: "2026-08-03T20:00:00.000Z",
      };
      entries = [entry];
      await route.fulfill({ status: 201, json: { data: entry } });
      return;
    }
    const id = url.pathname.split("/").at(-1);
    if (request.method() === "PUT") {
      const input = request.postDataJSON();
      const entry = { ...entries[0], ...input, id, updatedAt: "2026-08-03T21:00:00.000Z" };
      entries = [entry];
      await route.fulfill({ json: { data: entry } });
      return;
    }
    entries = [];
    await route.fulfill({ json: { data: { deleted: true } } });
  });

  await page.goto("/login");
  await page.getByLabel("Passcode").fill("correct-horse-battery-staple");
  await page.getByRole("button", { name: "Unlock ShiftPay" }).click();
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByText("No entry for today yet")).toBeVisible();

  await page.getByRole("button", { name: "Add Today’s Entry" }).click();
  await page.getByLabel("Date").fill(today);
  await page.getByLabel("Hours worked").fill("4");
  await page.getByLabel("Delivery earnings (€)").fill("50");
  await page.getByLabel("Tips (€)").fill("10");
  await page.getByRole("button", { name: "Add Entry" }).click();
  await expect(page.getByText("Entry Details")).toBeVisible();

  await page.getByRole("button", { name: "Edit Entry" }).click();
  await page.getByLabel("Hours worked").fill("5");
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page.getByText("Entry Details")).toBeVisible();

  await page.getByRole("button", { name: "Delete entry" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByText("No entry for today yet")).toBeVisible();
});
