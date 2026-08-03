import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ data: { authenticated: false } });
  response.cookies.set({ name: SESSION_COOKIE, value: "", maxAge: 0, path: "/" });
  return response;
}
