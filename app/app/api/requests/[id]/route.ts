import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUser, getRequest, updateRequest, getResponses, getReminders } from "@/lib/db";

const VALID_REQUEST_ID = /^req-\d+$/;

async function getCurrentUser() {
  const store = await cookies();
  const userId = store.get("userId")?.value;
  if (!userId) return null;
  return getUser(userId) ?? null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!VALID_REQUEST_ID.test(id)) {
    return NextResponse.json({ error: "Ogiltigt förfrågnings-ID" }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
  }

  const request = getRequest(id);
  if (!request) {
    return NextResponse.json({ error: "Förfrågan hittades inte" }, { status: 404 });
  }

  if (user.role === "supplier" && !request.supplierIds.includes(user.id)) {
    return NextResponse.json({ error: "Åtkomst nekad" }, { status: 403 });
  }

  const responses = getResponses().filter((r) => r.requestId === id);
  const reminders = getReminders().filter((r) => r.requestId === id);

  return NextResponse.json({ ...request, responses, reminders });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!VALID_REQUEST_ID.test(id)) {
    return NextResponse.json({ error: "Ogiltigt förfrågnings-ID" }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
  }
  if (user.role !== "requester") {
    return NextResponse.json({ error: "Endast samordnare kan stänga förfrågningar" }, { status: 403 });
  }

  const request = getRequest(id);
  if (!request) {
    return NextResponse.json({ error: "Förfrågan hittades inte" }, { status: 404 });
  }

  await updateRequest(id, (r) => ({ ...r, status: "closed" }));
  return NextResponse.json({ ok: true });
}
