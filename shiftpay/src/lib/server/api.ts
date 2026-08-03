import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/server/errors";
import type { ApiFailure, ApiSuccess } from "@/lib/types";

export function dataResponse<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>({ data }, init);
}

export function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    const flattened = error.flatten().fieldErrors;
    const fieldErrors = Object.fromEntries(
      Object.entries(flattened).filter((entry): entry is [string, string[]] => Array.isArray(entry[1])),
    );
    return NextResponse.json<ApiFailure>(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Check the highlighted fields and try again.",
          fieldErrors,
        },
      },
      { status: 400 },
    );
  }
  if (error instanceof AppError) {
    return NextResponse.json<ApiFailure>(
      { error: { code: error.code, message: error.message, fieldErrors: error.fieldErrors } },
      { status: error.status },
    );
  }
  return NextResponse.json<ApiFailure>(
    { error: { code: "INTERNAL_ERROR", message: "ShiftPay could not complete this request." } },
    { status: 500 },
  );
}

export function unauthorizedResponse() {
  return NextResponse.json<ApiFailure>(
    { error: { code: "UNAUTHORIZED", message: "Sign in to continue." } },
    { status: 401 },
  );
}
