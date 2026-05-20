import { NextRequest, NextResponse } from "next/server";
import { getKid } from "@/lib/db";

const VALID_ID = /^k\d{3}$/;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!VALID_ID.test(id)) {
    return NextResponse.json({ error: "Ogiltigt elev-ID" }, { status: 400 });
  }
  const kid = getKid(id);
  if (!kid) {
    return NextResponse.json({ error: "Elev hittades inte" }, { status: 404 });
  }
  return NextResponse.json(kid);
}
