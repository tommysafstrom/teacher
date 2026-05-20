import { NextResponse } from "next/server";
import { getKids } from "@/lib/db";

export async function GET() {
  return NextResponse.json(getKids());
}
