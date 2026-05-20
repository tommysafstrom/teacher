import { NextRequest, NextResponse } from "next/server";
import { getKid, addDiagnosis, removeDiagnosis } from "@/lib/db";
import type { Diagnosis, DiagnosisLabel } from "@/lib/types";

const VALID_ID = /^k\d{3}$/;
const ALLOWED_LABELS: DiagnosisLabel[] = [
  "dyslexi",
  "adhd",
  "autismspektrum",
  "dyskalkyli",
  "språkstörning",
];

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

  let body: { label: DiagnosisLabel };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig JSON" }, { status: 400 });
  }

  if (!ALLOWED_LABELS.includes(body?.label)) {
    return NextResponse.json({ error: "Okänd diagnos" }, { status: 400 });
  }

  const diagnosis: Diagnosis = {
    id: `diag-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    label: body.label,
  };

  await addDiagnosis(id, diagnosis);
  return NextResponse.json(diagnosis, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!VALID_ID.test(id)) {
    return NextResponse.json({ error: "Ogiltigt elev-ID" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const diagnosisId = searchParams.get("diagnosisId") ?? "";
  if (!/^diag-\d+$/.test(diagnosisId)) {
    return NextResponse.json({ error: "Ogiltigt diagnos-ID" }, { status: 400 });
  }

  if (!getKid(id)) {
    return NextResponse.json({ error: "Elev hittades inte" }, { status: 404 });
  }

  await removeDiagnosis(id, diagnosisId);
  return NextResponse.json({ ok: true });
}
