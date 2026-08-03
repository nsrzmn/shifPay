"use client";

import { useEffect } from "react";
import { useSelectedEntry } from "@/hooks/useEntries";
import { useEntriesStore } from "@/lib/store";
import { EntryDetail } from "@/components/modals/EntryDetail";
import { EntryForm } from "@/components/modals/EntryForm";

export function ModalHost() {
  const modal = useEntriesStore((state) => state.modal);
  const closeModal = useEntriesStore((state) => state.closeModal);
  const entry = useSelectedEntry();

  useEffect(() => {
    if (modal !== "closed" && modal !== "create" && !entry) closeModal();
  }, [closeModal, entry, modal]);

  if (modal === "create") return <EntryForm mode="create" entry={null} />;
  if (modal === "edit" && entry) return <EntryForm key={`${entry.id}-${entry.updatedAt}`} mode="edit" entry={entry} />;
  if (modal === "detail" && entry) return <EntryDetail entry={entry} />;
  return null;
}
