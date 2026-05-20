import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUser, getUsers, getKids, getRequests, addRequest } from "@/lib/db";
import { sendMail, buildRequestEmail } from "@/lib/email";
import type { Request } from "@/lib/types";

const VALID_KID_ID = /^k\d{3}$/;
const VALID_USER_ID = /^u\d{3}$/;

async function getCurrentUser() {
  const store = await cookies();
  const userId = store.get("userId")?.value;
  if (!userId) return null;
  return getUser(userId) ?? null;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
  }

  const all = getRequests();
  const visible =
    user.role === "requester"
      ? all
      : all.filter((r) => r.supplierIds.includes(user.id));

  return NextResponse.json(visible);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
  }
  if (user.role !== "requester") {
    return NextResponse.json({ error: "Endast samordnare kan skapa förfrågningar" }, { status: 403 });
  }

  let body: { kidIds: string[]; supplierIds: string[]; note?: string; dueDate?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig JSON" }, { status: 400 });
  }

  if (!Array.isArray(body?.kidIds) || body.kidIds.length === 0) {
    return NextResponse.json({ error: "kidIds krävs" }, { status: 400 });
  }
  if (!Array.isArray(body?.supplierIds) || body.supplierIds.length === 0) {
    return NextResponse.json({ error: "supplierIds krävs" }, { status: 400 });
  }
  for (const id of body.kidIds) {
    if (!VALID_KID_ID.test(id)) {
      return NextResponse.json({ error: `Ogiltigt elev-ID: ${id}` }, { status: 400 });
    }
  }
  for (const id of body.supplierIds) {
    if (!VALID_USER_ID.test(id)) {
      return NextResponse.json({ error: `Ogiltigt leverantörs-ID: ${id}` }, { status: 400 });
    }
  }

  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
  const dueDate =
    body.dueDate && ISO_DATE.test(body.dueDate) ? body.dueDate : undefined;

  const request: Request = {
    id: `req-${Date.now()}`,
    requesterId: user.id,
    kidIds: body.kidIds,
    supplierIds: body.supplierIds,
    note: (body.note ?? "").trim().slice(0, 2000),
    ...(dueDate ? { dueDate } : {}),
    createdAt: new Date().toISOString(),
    status: "active",
  };

  await addRequest(request);

  // Send notification emails to each assigned supplier (fire-and-forget)
  const allUsers = getUsers();
  const allKids = getKids();
  const kidLabels = request.kidIds.map((id) => allKids.find((k) => k.id === id)?.label ?? id);
  for (const supplierId of request.supplierIds) {
    const supplier = allUsers.find((u) => u.id === supplierId);
    if (!supplier?.email) continue;
    const { subject, html } = buildRequestEmail({
      supplierName: supplier.name,
      kidLabels,
      requestId: request.id,
      kidIds: request.kidIds,
      dueDate: request.dueDate,
      note: request.note || undefined,
      isReminder: false,
    });
    sendMail(supplier.email, subject, html).catch(() => {});
  }

  return NextResponse.json(request, { status: 201 });
}
