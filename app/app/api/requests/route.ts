import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUser, getRequests, addRequest } from "@/lib/db";
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

  let body: { kidIds: string[]; supplierIds: string[]; note?: string };
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

  const request: Request = {
    id: `req-${Date.now()}`,
    requesterId: user.id,
    kidIds: body.kidIds,
    supplierIds: body.supplierIds,
    note: (body.note ?? "").trim().slice(0, 2000),
    createdAt: new Date().toISOString(),
    status: "active",
  };

  await addRequest(request);
  return NextResponse.json(request, { status: 201 });
}
