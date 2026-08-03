import { randomUUID } from "node:crypto";
import { google, type sheets_v4 } from "googleapis";
import { calculateEntryValues, roundMoney } from "@/lib/calculations";
import { getServerConfig } from "@/lib/server/env";
import {
  AppError,
  ConfigurationError,
  DataIntegrityError,
  DuplicateDateError,
  EntryNotFoundError,
  StaleEntryError,
} from "@/lib/server/errors";
import type { EntryInput, EntryUpdate, ShiftEntry } from "@/lib/types";
import { shiftEntrySchema } from "@/lib/validation";

export const SHEET_NAME = "Entries";
export const SHEET_HEADERS = [
  "id",
  "date",
  "hoursWorked",
  "deliveryEarnings",
  "tips",
  "fines",
  "otherExpenses",
  "notes",
  "netEarnings",
  "hourlyRate",
  "createdAt",
  "updatedAt",
] as const;

interface SheetContext {
  api: sheets_v4.Sheets;
  spreadsheetId: string;
  sheetId: number;
  clientEmail: string;
}

interface EntryRow {
  entry: ShiftEntry;
  rowNumber: number;
}

let ensuredContext: Promise<SheetContext> | null = null;

function createApi() {
  const config = getServerConfig();
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: config.serviceAccount.client_email,
      private_key: config.serviceAccount.private_key,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return {
    api: google.sheets({ version: "v4", auth }),
    config,
  };
}

async function initializeSheet(): Promise<SheetContext> {
  try {
    const { api, config } = createApi();
    const metadata = await api.spreadsheets.get({
      spreadsheetId: config.spreadsheetId,
      fields: "sheets.properties(sheetId,title)",
    });

    let sheet = metadata.data.sheets?.find((item) => item.properties?.title === SHEET_NAME);
    if (!sheet?.properties?.sheetId && sheet?.properties?.sheetId !== 0) {
      const created = await api.spreadsheets.batchUpdate({
        spreadsheetId: config.spreadsheetId,
        requestBody: {
          requests: [{ addSheet: { properties: { title: SHEET_NAME } } }],
        },
      });
      const properties = created.data.replies?.[0]?.addSheet?.properties;
      if (!properties || properties.sheetId == null) {
        throw new ConfigurationError("The Entries worksheet could not be created.");
      }
      sheet = { properties };
    }

    const sheetId = sheet.properties!.sheetId!;
    const headerResponse = await api.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: `${SHEET_NAME}!A1:L1`,
    });
    const existingHeaders = (headerResponse.data.values?.[0] ?? []).map(String);
    const isEmpty = existingHeaders.length === 0 || existingHeaders.every((value) => value.trim() === "");

    if (isEmpty) {
      await api.spreadsheets.values.update({
        spreadsheetId: config.spreadsheetId,
        range: `${SHEET_NAME}!A1:L1`,
        valueInputOption: "RAW",
        requestBody: { values: [[...SHEET_HEADERS]] },
      });
    } else if (
      existingHeaders.length !== SHEET_HEADERS.length ||
      SHEET_HEADERS.some((header, index) => existingHeaders[index] !== header)
    ) {
      throw new ConfigurationError(
        "The Entries worksheet headers do not match the ShiftPay schema. Rename the tab or restore the expected headers.",
      );
    }

    await api.spreadsheets.batchUpdate({
      spreadsheetId: config.spreadsheetId,
      requestBody: {
        requests: [
          {
            updateSheetProperties: {
              properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
              fields: "gridProperties.frozenRowCount",
            },
          },
          {
            repeatCell: {
              range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 12 },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.082, green: 0.502, blue: 0.239 },
                  textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true },
                },
              },
              fields: "userEnteredFormat(backgroundColor,textFormat)",
            },
          },
          ...[
            { startColumnIndex: 3, endColumnIndex: 7 },
            { startColumnIndex: 8, endColumnIndex: 10 },
          ].map((range) => ({
            repeatCell: {
              range: { sheetId, startRowIndex: 1, ...range },
              cell: {
                userEnteredFormat: {
                  numberFormat: { type: "CURRENCY", pattern: "€#,##0.00;[Red]-€#,##0.00" },
                },
              },
              fields: "userEnteredFormat.numberFormat",
            },
          })),
        ],
      },
    });

    return { api, spreadsheetId: config.spreadsheetId, sheetId, clientEmail: config.serviceAccount.client_email };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new ConfigurationError(
      "ShiftPay could not access the Google Sheet. Check the Sheets API, URL, credentials, and sharing permission.",
    );
  }
}

async function getContext(): Promise<SheetContext> {
  if (!ensuredContext) {
    ensuredContext = initializeSheet().catch((error) => {
      ensuredContext = null;
      throw error;
    });
  }
  return ensuredContext;
}

function numberCell(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return Number.NaN;
}

function mapRow(row: unknown[], rowNumber: number): ShiftEntry {
  const candidate = {
    id: String(row[0] ?? ""),
    date: String(row[1] ?? ""),
    hoursWorked: numberCell(row[2]),
    deliveryEarnings: numberCell(row[3]),
    tips: numberCell(row[4]),
    fines: numberCell(row[5]),
    otherExpenses: numberCell(row[6]),
    notes: String(row[7] ?? ""),
    netEarnings: numberCell(row[8]),
    hourlyRate: numberCell(row[9]),
    createdAt: String(row[10] ?? ""),
    updatedAt: String(row[11] ?? ""),
  };
  const parsed = shiftEntrySchema.safeParse(candidate);
  if (!parsed.success) {
    throw new DataIntegrityError(`The Entries worksheet contains invalid data in row ${rowNumber}.`);
  }
  return parsed.data;
}

async function readRows(providedContext?: SheetContext): Promise<EntryRow[]> {
  const context = providedContext ?? (await getContext());
  try {
    const response = await context.api.spreadsheets.values.get({
      spreadsheetId: context.spreadsheetId,
      range: `${SHEET_NAME}!A2:L`,
      valueRenderOption: "UNFORMATTED_VALUE",
    });
    return (response.data.values ?? [])
      .map((row, index) => ({ row, rowNumber: index + 2 }))
      .filter(({ row }) => row.some((value) => String(value ?? "").trim() !== ""))
      .map(({ row, rowNumber }) => ({ entry: mapRow(row, rowNumber), rowNumber }));
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new ConfigurationError("ShiftPay could not read the Entries worksheet.");
  }
}

function normalizedInput(input: EntryInput): EntryInput {
  return {
    ...input,
    deliveryEarnings: roundMoney(input.deliveryEarnings),
    tips: roundMoney(input.tips),
    fines: roundMoney(input.fines),
    otherExpenses: roundMoney(input.otherExpenses),
    notes: input.notes.trim(),
  };
}

function entryToRow(entry: ShiftEntry) {
  return [
    entry.id,
    entry.date,
    entry.hoursWorked,
    entry.deliveryEarnings,
    entry.tips,
    entry.fines,
    entry.otherExpenses,
    entry.notes,
    entry.netEarnings,
    entry.hourlyRate,
    entry.createdAt,
    entry.updatedAt,
  ];
}

export async function listEntries(): Promise<ShiftEntry[]> {
  const rows = await readRows();
  return rows.map(({ entry }) => entry).sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt));
}

export async function createEntry(input: EntryInput): Promise<ShiftEntry> {
  const context = await getContext();
  const rows = await readRows(context);
  if (rows.some(({ entry }) => entry.date === input.date)) throw new DuplicateDateError();

  const normalized = normalizedInput(input);
  const timestamp = new Date().toISOString();
  const entry: ShiftEntry = {
    ...normalized,
    id: randomUUID(),
    ...calculateEntryValues(normalized),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  try {
    await context.api.spreadsheets.values.append({
      spreadsheetId: context.spreadsheetId,
      range: `${SHEET_NAME}!A:L`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [entryToRow(entry)] },
    });
    return entry;
  } catch {
    throw new ConfigurationError("ShiftPay could not add the entry to Google Sheets.");
  }
}

export async function updateEntry(id: string, input: EntryUpdate): Promise<ShiftEntry> {
  const context = await getContext();
  const rows = await readRows(context);
  const current = rows.find(({ entry }) => entry.id === id);
  if (!current) throw new EntryNotFoundError();
  if (current.entry.updatedAt !== input.updatedAt) throw new StaleEntryError();
  if (rows.some(({ entry }) => entry.id !== id && entry.date === input.date)) throw new DuplicateDateError();

  const normalized = normalizedInput(input);
  const entry: ShiftEntry = {
    ...normalized,
    id,
    ...calculateEntryValues(normalized),
    createdAt: current.entry.createdAt,
    updatedAt: new Date().toISOString(),
  };

  try {
    await context.api.spreadsheets.values.update({
      spreadsheetId: context.spreadsheetId,
      range: `${SHEET_NAME}!A${current.rowNumber}:L${current.rowNumber}`,
      valueInputOption: "RAW",
      requestBody: { values: [entryToRow(entry)] },
    });
    return entry;
  } catch {
    throw new ConfigurationError("ShiftPay could not update the Google Sheet entry.");
  }
}

export async function deleteEntry(id: string, updatedAt: string): Promise<void> {
  const context = await getContext();
  const rows = await readRows(context);
  const current = rows.find(({ entry }) => entry.id === id);
  if (!current) throw new EntryNotFoundError();
  if (current.entry.updatedAt !== updatedAt) throw new StaleEntryError();

  try {
    await context.api.spreadsheets.batchUpdate({
      spreadsheetId: context.spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: context.sheetId,
                dimension: "ROWS",
                startIndex: current.rowNumber - 1,
                endIndex: current.rowNumber,
              },
            },
          },
        ],
      },
    });
  } catch {
    throw new ConfigurationError("ShiftPay could not delete the Google Sheet entry.");
  }
}

export async function verifySheetSetup() {
  const context = await getContext();
  const entries = await readRows(context);
  return { clientEmail: context.clientEmail, worksheet: SHEET_NAME, entryCount: entries.length };
}

export function resetSheetContextForTests() {
  ensuredContext = null;
}
