"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

export function LoadingCards() {
  return (
    <div className="space-y-4" aria-label="Loading entries" aria-busy="true">
      <div className="h-36 animate-pulse rounded-2xl bg-white/75" />
      <div className="grid grid-cols-2 gap-3"><div className="h-20 animate-pulse rounded-2xl bg-white/75" /><div className="h-20 animate-pulse rounded-2xl bg-white/75" /></div>
      <div className="h-32 animate-pulse rounded-2xl bg-white/75" />
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="card flex flex-col items-center px-5 py-9 text-center" role="alert">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-loss-light text-loss"><AlertCircle /></div>
      <p className="mt-3 font-semibold">Couldn’t load your earnings</p>
      <p className="mt-1 text-sm leading-6 text-muted">{message}</p>
      <button type="button" onClick={onRetry} className="mt-4 flex items-center gap-2 rounded-xl bg-earn px-4 py-2.5 text-sm font-bold text-white"><RefreshCw size={16} /> Try again</button>
    </div>
  );
}
