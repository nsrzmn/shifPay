import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth/session";
import { errorResponse } from "@/lib/server/api";
import { passcodeMatches } from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const loginSchema = z.object({ passcode: z.string().min(1) }).strict();

export async function POST(request: Request) {
  try {
    const body = loginSchema.parse(await request.json());
    if (!passcodeMatches(body.passcode)) {
      return NextResponse.json(
        { error: { code: "INVALID_PASSCODE", message: "That passcode is not correct." } },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ data: { authenticated: true } });
    response.cookies.set({
      name: SESSION_COOKIE,
      value: await createSessionToken(body.passcode),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
