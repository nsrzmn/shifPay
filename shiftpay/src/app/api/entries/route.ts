import { dataResponse, errorResponse, unauthorizedResponse } from "@/lib/server/api";
import { hasValidSession } from "@/lib/server/auth";
import { createEntry, listEntries } from "@/lib/server/sheets";
import { entryInputSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await hasValidSession())) return unauthorizedResponse();
  try {
    return dataResponse(await listEntries(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  if (!(await hasValidSession())) return unauthorizedResponse();
  try {
    const input = entryInputSchema.parse(await request.json());
    return dataResponse(await createEntry(input), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
