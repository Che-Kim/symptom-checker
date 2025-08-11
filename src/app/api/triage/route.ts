import { NextRequest, NextResponse } from "next/server";
import { TriageInputSchema, runTriage } from "@/lib/triage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = TriageInputSchema.parse(body);
    const result = await runTriage(parsed);
    // Respect privacy: only echo back; persistence added via client consent
    return NextResponse.json({ ok: true, result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}


