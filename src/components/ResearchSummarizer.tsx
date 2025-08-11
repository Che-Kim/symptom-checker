"use client";
import { useState } from "react";
import type { ResearchDoc } from "@/lib/rag";

export type ResearchStructuredResult = {
  keyFindings: Array<{ title: string; detail: string }>;
  clinicalTakeaways: string[];
  lifestyleTips: string[];
  caveats: string[];
  disclaimer: string;
};

export default function ResearchSummarizer() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResearchStructuredResult | null>(null);
  const [citations, setCitations] = useState<ResearchDoc[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setResult(null);
    setCitations([]);
    try {
      const res = await fetch("/api/research?format=structured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      type ApiResearchResponse =
        | { ok: true; result: { structured: ResearchStructuredResult; citations: ResearchDoc[] } }
        | { ok: false; error: string };
      const json: ApiResearchResponse = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed research");
      setResult(json.result.structured);
      setCitations(json.result.citations || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSubmit} className="w-full space-y-3">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Curious about recent research about your symptoms?</label>
          <input
            className="w-full rounded-md border border-gray-200 bg-white p-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            placeholder="e.g., Long COVID fatigue and exercise"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
          />
        </div>
        <button className="inline-flex items-center justify-center rounded-md bg-black px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-900 disabled:opacity-60" disabled={loading}>
          {loading ? "Searching..." : "Find research"}
        </button>
      </form>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {result && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-4 shadow-sm animate-fade-in">
          {result.keyFindings?.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Key findings</div>
              <div className="grid grid-cols-1 gap-2">
                {result.keyFindings.map((f, idx) => (
                  <div key={idx} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <div className="font-semibold text-sm">{f.title}</div>
                    <p className="text-sm leading-relaxed mt-1">{f.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {result.clinicalTakeaways?.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Clinical takeaways</div>
              <ul className="space-y-1">
                {result.clinicalTakeaways.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span aria-hidden className="mt-0.5">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.lifestyleTips?.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Lifestyle tips</div>
              <ul className="space-y-1">
                {result.lifestyleTips.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span aria-hidden className="mt-0.5">💡</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.caveats?.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Caveats</div>
              <ul className="space-y-1">
                {result.caveats.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span aria-hidden className="mt-0.5">⚠️</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-xs text-gray-600">{result.disclaimer}</p>
          {citations.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Sources</div>
              <div className="space-y-2">
                {citations.map((c) => (
                  <div key={c.id} className="flex items-start gap-2 text-sm">
                    <span aria-hidden className="mt-0.5 text-blue-600">🔗</span>
                    <a className="text-blue-600 underline hover:text-blue-800" href={c.url} target="_blank" rel="noreferrer">
                      {c.title}
                      {c.published && <span className="text-gray-500"> ({c.published})</span>}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


