import { dataResponse } from "@/lib/server/api";
import { hasValidSession } from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return dataResponse({ authenticated: await hasValidSession() });
}
