import type { TriageOutput } from "@/lib/triage";

function confidenceStyle(level: "low" | "medium" | "high") {
  switch (level) {
    case "high":
      return "bg-pink-50 text-pink-700 border-pink-200";
    case "medium":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "low":
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

function sortByConfidence(causes: TriageOutput["possibleCauses"]) {
  const order = { high: 0, medium: 1, low: 2 };
  return [...causes].sort((a, b) => order[a.confidence] - order[b.confidence]);
}

export default function AIResponse({ data }: { data: TriageOutput | null }) {
  if (!data) return null;
  return (
    <div className="max-w-[85%] rounded-2xl border border-gray-200 p-4 space-y-4 bg-white shadow-sm">
      {data.possibleCauses?.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Possible causes</div>
          <div className="grid grid-cols-1 gap-2">
            {sortByConfidence(data.possibleCauses).map((c, idx) => (
              <div
                key={idx}
                className={`rounded-lg border p-3 text-sm ${confidenceStyle(c.confidence)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{c.name}</div>
                  <span className="text-[10px] rounded-full px-2 py-0.5 border">
                    {c.confidence}
                  </span>
                </div>
                <p className="mt-1 leading-relaxed">{c.rationale}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.nextSteps?.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Next steps</div>
          <ul className="space-y-1">
            {data.nextSteps.map((s, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span aria-hidden className="mt-0.5">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.lifestyleAdvice?.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Lifestyle tips</div>
          <ul className="space-y-1">
            {data.lifestyleAdvice.map((s, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span aria-hidden className="mt-0.5">💡</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-gray-600">{data.disclaimer}</p>
    </div>
  );
}


