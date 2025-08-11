import { NextRequest, NextResponse } from "next/server";
import { searchPubMed, summarizeResearch, summarizeResearchStructured } from "@/lib/rag";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ ok: false, error: "query is required" }, { status: 400 });
    }
    const apiKey = process.env.NCBI_API_KEY;
    const docs = await searchPubMed({ query, retmax: 5, apiKey });

    const format = req.nextUrl.searchParams.get("format");
    if (format === "structured") {
      const structured = await summarizeResearchStructured(docs, query);
      return NextResponse.json({ ok: true, result: { structured, citations: docs } });
    }

    const result = await summarizeResearch(docs, query);
    return NextResponse.json({ ok: true, result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}


