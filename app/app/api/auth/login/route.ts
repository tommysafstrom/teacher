import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUser } from "@/lib/db";

const VALID_USER_ID = /^u\d{3}$/;

export async function POST(req: NextRequest) {
  let body: { userId: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig JSON" }, { status: 400 });
  }

  const { userId } = body ?? {};
  if (!userId || !VALID_USER_ID.test(userId)) {
    return NextResponse.json({ error: "Ogiltigt användar-ID" }, { status: 400 });
  }

  const user = getUser(userId);
  if (!user) {
    return NextResponse.json({ error: "Användaren hittades inte" }, { status: 404 });
  }

  const cookieStore = await cookies();
  cookieStore.set("userId", userId, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });

  return NextResponse.json({ role: user.role });
}
