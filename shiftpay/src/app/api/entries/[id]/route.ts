import { z } from "zod";
import { dataResponse, errorResponse, unauthorizedResponse } from "@/lib/server/api";
import { hasValidSession } from "@/lib/server/auth";
import { deleteEntry, updateEntry } from "@/lib/server/sheets";
import { entryUpdateSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const deleteSchema = z.object({ updatedAt: z.string().datetime() }).strict();

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!(await hasValidSession())) return unauthorizedResponse();
  try {
    const input = entryUpdateSchema.parse(await request.json());
    return dataResponse(await updateEntry(params.id, input));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!(await hasValidSession())) return unauthorizedResponse();
  try {
    const input = deleteSchema.parse(await request.json());
    await deleteEntry(params.id, input.updatedAt);
    return dataResponse({ deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}
