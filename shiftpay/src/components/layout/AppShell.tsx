"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { useEntryBootstrap } from "@/hooks/useEntries";
import { BottomNav } from "@/components/layout/BottomNav";
import { ModalHost } from "@/components/modals/ModalHost";

export function AppShell({ children }: { children: ReactNode }) {
  useEntryBootstrap();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-[390px] bg-surface shadow-2xl">
      <header className="flex items-center justify-between px-5 pb-1 pt-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-600">ShiftPay</p>
        <button
          type="button"
          onClick={logout}
          disabled={loggingOut}
          className="rounded-full p-2 text-slate-400 transition hover:bg-white hover:text-ink disabled:opacity-50"
          aria-label="Log out"
        >
          <LogOut size={18} aria-hidden="true" />
        </button>
      </header>
      <main className="px-5 pb-28">{children}</main>
      <BottomNav />
      <ModalHost />
    </div>
  );
}
