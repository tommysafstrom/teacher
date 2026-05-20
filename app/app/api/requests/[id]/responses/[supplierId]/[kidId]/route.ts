import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUser, getRequest, getResponse, upsertResponse } from "@/lib/db";
import type { Response } from "@/lib/types";

const VALID_REQUEST_ID = /^req-\d+$/;
const VALID_USER_ID = /^u\d{3}$/;
const VALID_KID_ID = /^k\d{3}$/;

async function getCurrentUser() {
  const store = await cookies();
  const userId = store.get("userId")?.value;
  if (!userId) return null;
  return getUser(userId) ?? null;
}

type RouteParams = { params: Promise<{ id: string; supplierId: string; kidId: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id, supplierId, kidId } = await params;

  if (!VALID_REQUEST_ID.test(id) || !VALID_USER_ID.test(supplierId) || !VALID_KID_ID.test(kidId)) {
    return NextResponse.json({ error: "Ogiltiga parametrar" }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
  }

  const response = getResponse(id, supplierId, kidId);
  if (!response) {
    return NextResponse.json({ error: "Svar hittades inte" }, { status: 404 });
  }

  return NextResponse.json(response);
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { id, supplierId, kidId } = await params;

  if (!VALID_REQUEST_ID.test(id) || !VALID_USER_ID.test(supplierId) || !VALID_KID_ID.test(kidId)) {
    return NextResponse.json({ error: "Ogiltiga parametrar" }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
  }
  if (user.role !== "supplier" || user.id !== supplierId) {
    return NextResponse.json({ error: "Åtkomst nekad" }, { status: 403 });
  }

  const request = getRequest(id);
  if (!request) {
    return NextResponse.json({ error: "Förfrågan hittades inte" }, { status: 404 });
  }
  if (!request.supplierIds.includes(supplierId) || !request.kidIds.includes(kidId)) {
    return NextResponse.json({ error: "Ej tilldelad" }, { status: 403 });
  }

  let body: { answers: Record<string, string>; submit?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig JSON" }, { status: 400 });
  }

  const sanitizedAnswers: Record<string, string> = {};
  for (const [key, val] of Object.entries(body.answers ?? {})) {
    sanitizedAnswers[key] = String(val).trim().slice(0, 2000);
  }

  const existing = getResponse(id, supplierId, kidId);
  const now = new Date().toISOString();

  const updated: Response = {
    id: existing?.id ?? `resp-${Date.now()}`,
    requestId: id,
    supplierId,
    kidId,
    answers: sanitizedAnswers,
    lastActivityAt: now,
    submittedAt: body.submit ? now : existing?.submittedAt,
  };

  await upsertResponse(updated);
  return NextResponse.json(updated);
}
