import { NextRequest, NextResponse } from "next/server";
import { getKid, addScreening } from "@/lib/db";
import { deriveTraits, buildSummary } from "@/lib/screening";
import type { Screening, ScreeningAnswer } from "@/lib/types";

const VALID_ID = /^k\d{3}$/;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!VALID_ID.test(id)) {
    return NextResponse.json({ error: "Ogiltigt elev-ID" }, { status: 400 });
  }
  if (!getKid(id)) {
    return NextResponse.json({ error: "Elev hittades inte" }, { status: 404 });
  }

  let body: { answers: ScreeningAnswer[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig JSON" }, { status: 400 });
  }

  if (!Array.isArray(body?.answers)) {
    return NextResponse.json({ error: "Svar saknas" }, { status: 400 });
  }

  for (const a of body.answers) {
    if (typeof a.questionId !== "string" || !/^q\d+$/.test(a.questionId)) {
      return NextResponse.json({ error: "Ogiltigt fråge-ID" }, { status: 400 });
    }
    if (typeof a.checked !== "boolean") {
      return NextResponse.json({ error: "Ogiltigt svar (måste vara true/false)" }, { status: 400 });
    }
  }

  const traits = deriveTraits(body.answers);
  const summary = buildSummary(traits, body.answers);

  const screening: Screening = {
    id: `scr-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    traits,
    answers: body.answers,
    summary,
  };

  await addScreening(id, screening);
  return NextResponse.json(screening, { status: 201 });
}
