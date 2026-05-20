import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUser } from "@/lib/db";

export async function GET() {
  const store = await cookies();
  const userId = store.get("userId")?.value;
  if (!userId) {
    return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
  }
  const user = getUser(userId);
  if (!user) {
    return NextResponse.json({ error: "Användaren hittades inte" }, { status: 404 });
  }
  return NextResponse.json(user);
}
