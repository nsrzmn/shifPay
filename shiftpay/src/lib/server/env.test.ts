import { afterEach, describe, expect, it } from "vitest";
import { getServerConfig, parseSpreadsheetId } from "@/lib/server/env";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("server environment", () => {
  it("extracts a spreadsheet ID from a Google Sheets URL", () => {
    expect(parseSpreadsheetId("https://docs.google.com/spreadsheets/d/abc_DEF-123/edit#gid=0")).toBe("abc_DEF-123");
  });

  it("rejects non-Google URLs", () => {
    expect(() => parseSpreadsheetId("https://example.com/spreadsheets/d/abc/edit")).toThrow();
  });

  it("parses the three required environment variables", () => {
    process.env.GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/abc123/edit";
    process.env.APP_PASSCODE = "a-long-random-passcode";
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON = JSON.stringify({
      type: "service_account",
      client_email: "shiftpay@example-project.iam.gserviceaccount.com",
      private_key: "key\\nvalue",
    });
    const config = getServerConfig();
    expect(config.spreadsheetId).toBe("abc123");
    expect(config.serviceAccount.private_key).toBe("key\nvalue");
  });

  it("fails safely when configuration is missing", () => {
    delete process.env.GOOGLE_SHEET_URL;
    delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    delete process.env.APP_PASSCODE;
    expect(() => getServerConfig()).toThrow("environment variables are missing");
  });
});
