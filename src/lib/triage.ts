import { z } from "zod";

export const TriageInputSchema = z.object({
  symptoms: z.string().min(1, "Please describe your symptoms"),
  consentToStore: z.boolean().default(false),
});

export type TriageInput = z.infer<typeof TriageInputSchema>;

export type TriageOutput = {
  possibleCauses: Array<{ name: string; rationale: string; confidence: "low" | "medium" | "high" }>;
  urgency: "emergency" | "urgent" | "routine" | "self-care";
  nextSteps: string[];
  lifestyleAdvice: string[];
  disclaimer: string;
};

const TRIAGE_SYSTEM = `You are a cautious, helpful health information assistant.
You DO NOT diagnose. You provide possibilities with clear uncertainty and safety guidance.
Output concise, empathetic, and actionable advice, suitable for laypeople.
When symptoms suggest emergency red flags, set urgency to "emergency" and advise calling emergency services.
Always include a short safety disclaimer.`;

export async function runTriage(input: TriageInput): Promise<TriageOutput> {
  const { symptoms } = TriageInputSchema.parse(input);
  const userPrompt = `User symptoms: ${symptoms}\n\nReturn a strict JSON object with keys: possibleCauses (array of {name, rationale, confidence: one of low|medium|high}), urgency (one of emergency|urgent|routine|self-care), nextSteps (string[]), lifestyleAdvice (string[]), disclaimer (string).`;
  const host = process.env.OLLAMA_HOST || "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL || "llama3.1:8b";
  const res = await fetch(`${host}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      // Ask Ollama to return pure JSON if supported
      format: "json",
      messages: [
        { role: "system", content: TRIAGE_SYSTEM },
        { role: "user", content: userPrompt },
      ],
      options: { temperature: 0.1 },
    }),
  });
  if (!res.ok) {
    throw new Error(`LLM request failed: ${res.status}`);
  }
  const data = await res.json();
  const content = data?.message?.content || "{}";
  let parsed: TriageOutput;
  try {
    parsed = JSON.parse(content) as TriageOutput;
  } catch {
    // Fallback schema-safe parse attempt
    parsed = {
      possibleCauses: [],
      urgency: "routine",
      nextSteps: ["Consult a licensed clinician for personalized advice."],
      lifestyleAdvice: [],
      disclaimer: "This is informational only and not a diagnosis. If symptoms worsen or you are worried, seek medical care.",
    };
  }
  return parsed;
}


