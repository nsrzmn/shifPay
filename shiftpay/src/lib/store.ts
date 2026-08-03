"use client";

import { create } from "zustand";
import { apiRequest } from "@/lib/api-client";
import type { EntryInput, EntryUpdate, HistoryFilter, RequestStatus, ShiftEntry } from "@/lib/types";

export type ModalState = "closed" | "create" | "detail" | "edit";

interface EntriesStore {
  entries: ShiftEntry[];
  loaded: boolean;
  status: RequestStatus;
  error: string | null;
  filter: HistoryFilter;
  modal: ModalState;
  selectedEntryId: string | null;
  loadEntries: (background?: boolean) => Promise<void>;
  createEntry: (input: EntryInput) => Promise<ShiftEntry>;
  updateEntry: (id: string, input: EntryUpdate) => Promise<ShiftEntry>;
  deleteEntry: (id: string, updatedAt: string) => Promise<void>;
  setFilter: (filter: HistoryFilter) => void;
  openCreate: () => void;
  openDetail: (id: string) => void;
  openEdit: (id: string) => void;
  closeModal: () => void;
}

export const useEntriesStore = create<EntriesStore>((set, get) => ({
  entries: [],
  loaded: false,
  status: "idle",
  error: null,
  filter: "week",
  modal: "closed",
  selectedEntryId: null,

  loadEntries: async (background = false) => {
    const hasEntries = get().entries.length > 0;
    set({ status: background && hasEntries ? "refreshing" : "loading", error: null });
    try {
      const entries = await apiRequest<ShiftEntry[]>("/api/entries");
      set({ entries, loaded: true, status: "idle", error: null });
    } catch (error) {
      set({
        status: "error",
        error: error instanceof Error ? error.message : "Could not load your entries.",
      });
    }
  },

  createEntry: async (input) => {
    set({ status: "saving", error: null });
    try {
      const entry = await apiRequest<ShiftEntry>("/api/entries", { method: "POST", body: JSON.stringify(input) });
      await get().loadEntries(true);
      set({ modal: "detail", selectedEntryId: entry.id });
      return entry;
    } catch (error) {
      set({ status: "idle" });
      throw error;
    }
  },

  updateEntry: async (id, input) => {
    set({ status: "saving", error: null });
    try {
      const entry = await apiRequest<ShiftEntry>(`/api/entries/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      });
      await get().loadEntries(true);
      set({ modal: "detail", selectedEntryId: entry.id });
      return entry;
    } catch (error) {
      set({ status: "idle" });
      if (error instanceof Error && "code" in error && error.code === "STALE_ENTRY") {
        await get().loadEntries(true);
      }
      throw error;
    }
  },

  deleteEntry: async (id, updatedAt) => {
    set({ status: "saving", error: null });
    try {
      await apiRequest<{ deleted: true }>(`/api/entries/${id}`, {
        method: "DELETE",
        body: JSON.stringify({ updatedAt }),
      });
      set({ modal: "closed", selectedEntryId: null });
      await get().loadEntries(true);
    } catch (error) {
      set({ status: "idle" });
      if (error instanceof Error && "code" in error && error.code === "STALE_ENTRY") {
        await get().loadEntries(true);
      }
      throw error;
    }
  },

  setFilter: (filter) => set({ filter }),
  openCreate: () => set({ modal: "create", selectedEntryId: null }),
  openDetail: (id) => set({ modal: "detail", selectedEntryId: id }),
  openEdit: (id) => set({ modal: "edit", selectedEntryId: id }),
  closeModal: () => set({ modal: "closed", selectedEntryId: null }),
}));
