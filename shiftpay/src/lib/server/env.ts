import { z } from "zod";
import { ConfigurationError } from "@/lib/server/errors";

const serviceAccountSchema = z.object({
  type: z.literal("service_account"),
  client_email: z.string().email(),
  private_key: z.string().min(1),
  project_id: z.string().optional(),
});

export interface ServerConfig {
  spreadsheetId: string;
  sheetUrl: string;
  passcode: string;
  serviceAccount: z.infer<typeof serviceAccountSchema>;
}

export function parseSpreadsheetId(urlValue: string): string {
  let url: URL;
  try {
    url = new URL(urlValue);
  } catch {
    throw new ConfigurationError("GOOGLE_SHEET_URL must be a valid Google Sheets URL.");
  }

  if (url.hostname !== "docs.google.com") {
    throw new ConfigurationError("GOOGLE_SHEET_URL must use docs.google.com.");
  }

  const match = /^\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/.exec(url.pathname);
  if (!match) {
    throw new ConfigurationError("GOOGLE_SHEET_URL does not contain a spreadsheet ID.");
  }
  return match[1];
}

export function getServerConfig(): ServerConfig {
  const sheetUrl = process.env.GOOGLE_SHEET_URL;
  const credentialJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const passcode = process.env.APP_PASSCODE;

  if (!sheetUrl || !credentialJson || !passcode) {
    throw new ConfigurationError("Required ShiftPay environment variables are missing.");
  }

  let rawCredentials: unknown;
  try {
    rawCredentials = JSON.parse(credentialJson);
  } catch {
    throw new ConfigurationError("GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON.");
  }

  const credentials = serviceAccountSchema.safeParse(rawCredentials);
  if (!credentials.success) {
    throw new ConfigurationError("GOOGLE_SERVICE_ACCOUNT_JSON is not a valid service-account credential.");
  }

  return {
    spreadsheetId: parseSpreadsheetId(sheetUrl),
    sheetUrl,
    passcode,
    serviceAccount: {
      ...credentials.data,
      private_key: credentials.data.private_key.replace(/\\n/g, "\n"),
    },
  };
}
