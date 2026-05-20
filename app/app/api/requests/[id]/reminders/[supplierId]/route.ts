import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUser, getRequest, addReminder } from "@/lib/db";
import type { Reminder } from "@/lib/types";

const VALID_REQUEST_ID = /^req-\d+$/;
const VALID_USER_ID = /^u\d{3}$/;

async function getCurrentUser() {
  const store = await cookies();
  const userId = store.get("userId")?.value;
  if (!userId) return null;
  return getUser(userId) ?? null;
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; supplierId: string }> }
) {
  const { id, supplierId } = await params;

  if (!VALID_REQUEST_ID.test(id) || !VALID_USER_ID.test(supplierId)) {
    return NextResponse.json({ error: "Ogiltiga parametrar" }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
  }
  if (user.role !== "requester") {
    return NextResponse.json({ error: "Endast samordnare kan skicka påminnelser" }, { status: 403 });
  }

  const request = getRequest(id);
  if (!request) {
    return NextResponse.json({ error: "Förfrågan hittades inte" }, { status: 404 });
  }

  const reminder: Reminder = {
    id: `rem-${Date.now()}`,
    requestId: id,
    supplierId,
    sentAt: new Date().toISOString(),
  };

  await addReminder(reminder);
  return NextResponse.json(reminder, { status: 201 });
}
