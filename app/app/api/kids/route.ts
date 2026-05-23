import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getKids, getUser, getRequests } from "@/lib/db";

export async function GET() {
  const store = await cookies();
  const userId = store.get("userId")?.value;
  const user = userId ? getUser(userId) : null;

  if (!user) {
    return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
  }

  if (user.role === "supplier") {
    const assignedKidIds = new Set(
      getRequests()
        .filter((r) => r.status === "active" && r.supplierIds.includes(user.id))
        .flatMap((r) => r.kidIds)
    );
    return NextResponse.json(getKids().filter((k) => assignedKidIds.has(k.id)));
  }

  return NextResponse.json(getKids());
}
