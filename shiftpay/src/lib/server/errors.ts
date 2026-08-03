export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ConfigurationError extends AppError {
  constructor(message = "ShiftPay is not configured correctly.") {
    super("CONFIGURATION_ERROR", message, 503);
  }
}

export class DataIntegrityError extends AppError {
  constructor(message = "The Entries worksheet contains invalid data.") {
    super("SHEET_INTEGRITY_ERROR", message, 503);
  }
}

export class DuplicateDateError extends AppError {
  constructor() {
    super("DUPLICATE_DATE", "An entry already exists for this date.", 409);
  }
}

export class EntryNotFoundError extends AppError {
  constructor() {
    super("ENTRY_NOT_FOUND", "This entry no longer exists.", 404);
  }
}

export class StaleEntryError extends AppError {
  constructor() {
    super("STALE_ENTRY", "This entry changed on another device. Refresh and try again.", 409);
  }
}
