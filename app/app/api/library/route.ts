import { NextRequest, NextResponse } from "next/server";
import { getMaterials } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const challenge = searchParams.get("challenge");
  const subject = searchParams.get("subject");

  let items = getMaterials();

  if (challenge) {
    // Only allow known challenge values (prevent arbitrary filtering on injected strings)
    const safe = decodeURIComponent(challenge).replace(/[^a-zåäö]/gi, "");
    items = items.filter((m) =>
      m.challenges.some((c) => c.toLowerCase() === safe.toLowerCase())
    );
  }

  if (subject) {
    const safe = decodeURIComponent(subject).replace(/[^a-zåäö ]/gi, "");
    items = items.filter(
      (m) => m.subject.toLowerCase() === safe.toLowerCase()
    );
  }

  return NextResponse.json(items);
}
