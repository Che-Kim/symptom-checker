"use client";
import { useState } from "react";
import type { TriageOutput } from "@/lib/triage";

type Props = {
  onTriage: (data: TriageOutput, symptoms: string) => void;
  onLoadingChange?: (loading: boolean) => void;
};

export default function SymptomForm({ onTriage, onLoadingChange }: Props) {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    onLoadingChange?.(true);
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      });
      type ApiTriageResponse = { ok: true; result: TriageOutput } | { ok: false; error: string };
      const json: ApiTriageResponse = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed triage");
      onTriage(json.result, symptoms);
      setSymptoms("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <textarea
            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={1}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as unknown as React.FormEvent);
              }
            }}
            placeholder="Describe your symptoms..."
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !symptoms.trim()}
          className="flex-shrink-0 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed -mt-1"
        >
          {loading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 3a7.5 7.5 0 006.15 13.65z" />
            </svg>
          )}
        </button>
      </div>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </form>
  );
}


