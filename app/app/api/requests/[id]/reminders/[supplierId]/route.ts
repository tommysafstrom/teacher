import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUser, getUsers, getKids, getRequest, addReminder } from "@/lib/db";
import { sendMail, buildRequestEmail } from "@/lib/email";
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

  // Send reminder email to the supplier (fire-and-forget)
  const supplier = getUsers().find((u) => u.id === supplierId);
  if (supplier?.email) {
    const allKids = getKids();
    const kidLabels = request.kidIds.map((kid) => allKids.find((k) => k.id === kid)?.label ?? kid);
    const { subject, html } = buildRequestEmail({
      supplierName: supplier.name,
      kidLabels,
      requestId: id,
      kidIds: request.kidIds,
      dueDate: request.dueDate,
      note: request.note || undefined,
      isReminder: true,
    });
    sendMail(supplier.email, subject, html).catch(() => {});
  }

  return NextResponse.json(reminder, { status: 201 });
}
