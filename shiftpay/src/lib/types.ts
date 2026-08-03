export type HistoryFilter = "week" | "month" | "all";

export interface EntryInput {
  date: string;
  hoursWorked: number;
  deliveryEarnings: number;
  tips: number;
  fines: number;
  otherExpenses: number;
  notes: string;
}

export interface ShiftEntry extends EntryInput {
  id: string;
  netEarnings: number;
  hourlyRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface EntryUpdate extends EntryInput {
  updatedAt: string;
}

export interface SevenDayPoint {
  date: string;
  label: string;
  netEarnings: number;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export type ApiSuccess<T> = { data: T };
export type ApiFailure = { error: ApiErrorBody };

export type RequestStatus = "idle" | "loading" | "refreshing" | "saving" | "error";
