"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export function BottomSheet({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[2px] data-[state=open]:animate-in" />
        <Dialog.Content className="fixed bottom-0 left-1/2 z-50 max-h-[92dvh] w-full max-w-[390px] -translate-x-1/2 overflow-hidden rounded-t-[28px] bg-white shadow-sheet outline-none">
          <div className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-slate-200" />
          <div className="flex items-start justify-between px-5 pb-3 pt-4">
            <div>
              <Dialog.Title className="text-xl font-bold">{title}</Dialog.Title>
              {description && <Dialog.Description className="mt-1 text-sm text-muted">{description}</Dialog.Description>}
            </div>
            <Dialog.Close className="rounded-full bg-surface p-2 text-slate-500 transition hover:text-ink" aria-label="Close">
              <X size={19} />
            </Dialog.Close>
          </div>
          <div className="safe-bottom max-h-[calc(92dvh-82px)] overflow-y-auto px-5 pb-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
