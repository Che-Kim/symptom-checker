"use client";
import { useEffect, useState } from "react";
import type { TriageOutput } from "@/lib/triage";

type SessionItem = {
  id: string;
  timestamp: number;
  symptoms: string;
  triage: TriageOutput | null;
};

const STORAGE_KEY = "symptom_sessions_v1";

export default function SessionHistory() {
  const [items, setItems] = useState<SessionItem[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setItems(JSON.parse(raw));
      } catch {}
    }
  }, []);

  function clear() {
    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
  }

  if (items.length === 0) return null;
  return (
    <div className="w-full rounded border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Session history (private to your device)</h3>
        <button className="text-xs underline" onClick={clear}>Clear</button>
      </div>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.id} className="rounded border p-2 text-sm">
            <div className="text-xs text-gray-500">
              {new Date(it.timestamp).toLocaleString()}
            </div>
            <div className="font-medium">Symptoms</div>
            <div className="text-gray-700">{it.symptoms}</div>
            {it.triage?.urgency && (
              <div className="mt-1 text-xs">Urgency: {it.triage.urgency}</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function appendSession(symptoms: string, triage: TriageOutput) {
  const raw = localStorage.getItem(STORAGE_KEY);
  const items: SessionItem[] = raw ? JSON.parse(raw) : [];
  items.unshift({ id: crypto.randomUUID(), timestamp: Date.now(), symptoms, triage });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50)));
}


