import type { ApiFailure, ApiSuccess } from "@/lib/types";

export class ApiRequestError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: init?.body ? { "Content-Type": "application/json", ...init.headers } : init?.headers,
      cache: "no-store",
    });
  } catch {
    throw new ApiRequestError("NETWORK_ERROR", "Could not reach ShiftPay. Check your connection and try again.", 0);
  }

  const body = (await response.json()) as ApiSuccess<T> | ApiFailure;
  if (!response.ok || "error" in body) {
    const failure = body as ApiFailure;
    if (response.status === 401 && typeof window !== "undefined") window.location.assign("/login");
    throw new ApiRequestError(
      failure.error?.code ?? "REQUEST_FAILED",
      failure.error?.message ?? "The request failed.",
      response.status,
      failure.error?.fieldErrors,
    );
  }
  return body.data;
}
