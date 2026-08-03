// @vitest-environment node

import { describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken } from "@/lib/auth/session";

describe("passcode sessions", () => {
  it("accepts a token only with the passcode that created it", async () => {
    const token = await createSessionToken("correct-horse-battery-staple");
    await expect(verifySessionToken(token, "correct-horse-battery-staple")).resolves.toBe(true);
    await expect(verifySessionToken(token, "different-passcode")).resolves.toBe(false);
  });
});
