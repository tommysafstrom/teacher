import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUser, getRequest, updateRequest } from "@/lib/db";

const VALID_REQUEST_ID = /^req-\d+$/;
const VALID_USER_ID = /^u\d{3}$/;

async function getCurrentUser() {
  const store = await cookies();
  const userId = store.get("userId")?.value;
  if (!userId) return null;
  return getUser(userId) ?? null;
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; supplierId: string }> }
) {
  const { id, supplierId } = await params;

  if (!VALID_REQUEST_ID.test(id)) {
    return NextResponse.json({ error: "Ogiltigt förfrågnings-ID" }, { status: 400 });
  }
  if (!VALID_USER_ID.test(supplierId)) {
    return NextResponse.json({ error: "Ogiltigt leverantörs-ID" }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
  }
  if (user.role !== "requester") {
    return NextResponse.json({ error: "Endast samordnare kan ta bort tilldelningar" }, { status: 403 });
  }

  const request = getRequest(id);
  if (!request) {
    return NextResponse.json({ error: "Förfrågan hittades inte" }, { status: 404 });
  }

  await updateRequest(id, (r) => ({
    ...r,
    supplierIds: r.supplierIds.filter((s) => s !== supplierId),
  }));

  return NextResponse.json({ ok: true });
}
