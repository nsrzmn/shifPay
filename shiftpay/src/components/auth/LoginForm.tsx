"use client";

import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { apiRequest, ApiRequestError } from "@/lib/api-client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [passcode, setPasscode] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiRequest<{ authenticated: true }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ passcode }),
      });
      const from = searchParams.get("from");
      router.replace(from?.startsWith("/") ? from : "/dashboard");
      router.refresh();
    } catch (requestError) {
      if (requestError instanceof ApiRequestError && requestError.code === "CONFIGURATION_ERROR") {
        setError("ShiftPay is not configured. Check the deployment environment variables.");
      } else {
        setError(requestError instanceof Error ? requestError.message : "Could not sign in.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="w-full space-y-5 rounded-2xl bg-white p-6 shadow-card">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-earn-light text-earn">
        <LockKeyhole aria-hidden="true" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome to ShiftPay</h1>
        <p className="mt-2 text-sm leading-6 text-muted">Enter the passcode configured for this deployment.</p>
      </div>
      <div>
        <label htmlFor="passcode" className="mb-2 block text-sm font-semibold">Passcode</label>
        <div className="relative">
          <input
            id="passcode"
            type={visible ? "text" : "password"}
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
            className="field pr-12"
            autoComplete="current-password"
            autoFocus
            required
          />
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            className="absolute inset-y-0 right-0 px-4 text-slate-400"
            aria-label={visible ? "Hide passcode" : "Show passcode"}
          >
            {visible ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>
      </div>
      {error && <p role="alert" className="rounded-xl bg-loss-light px-3 py-2 text-sm text-loss">{error}</p>}
      <button
        type="submit"
        disabled={loading || !passcode}
        className="w-full rounded-2xl bg-earn px-4 py-3.5 font-bold text-white shadow-lg shadow-green-800/15 transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Unlock ShiftPay"}
      </button>
    </form>
  );
}
