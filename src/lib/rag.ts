import { z } from "zod";

export type ResearchDoc = {
  id: string;
  title: string;
  url: string;
  summary?: string;
  published?: string;
  source: "pubmed" | "other";
};

export type RagResult = {
  answer: string;
  citations: ResearchDoc[];
};

export type ResearchStructuredResult = {
  keyFindings: Array<{ title: string; detail: string }>;
  clinicalTakeaways: string[];
  lifestyleTips: string[];
  caveats: string[];
  disclaimer: string;
};

const PubMedSearchParams = z.object({
  query: z.string().min(1),
  retmax: z.number().int().min(1).max(10).default(5),
  apiKey: z.string().optional(),
});

export async function searchPubMed(params: z.infer<typeof PubMedSearchParams>): Promise<ResearchDoc[]> {
  const { query, retmax, apiKey } = PubMedSearchParams.parse(params);
  const url = new URL("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi");
  url.searchParams.set("db", "pubmed");
  url.searchParams.set("term", query);
  url.searchParams.set("retmode", "json");
  url.searchParams.set("retmax", String(retmax));
  if (apiKey) url.searchParams.set("api_key", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed PubMed search");
  const data = await res.json();
  const ids: string[] = data?.esearchresult?.idlist || [];
  if (ids.length === 0) return [];

  // Fetch summaries
  const summaryUrl = new URL("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi");
  summaryUrl.searchParams.set("db", "pubmed");
  summaryUrl.searchParams.set("id", ids.join(","));
  summaryUrl.searchParams.set("retmode", "json");
  if (apiKey) summaryUrl.searchParams.set("api_key", apiKey);
  const sumRes = await fetch(summaryUrl.toString());
  if (!sumRes.ok) throw new Error("Failed PubMed summary");
  const sumData = await sumRes.json();
  const result: ResearchDoc[] = ids.map((pmid) => {
    const doc = sumData?.result?.[pmid];
    const title: string = doc?.title || "Untitled";
    const pubdate: string = doc?.pubdate || undefined;
    return {
      id: pmid,
      title,
      url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      published: pubdate,
      source: "pubmed",
    };
  });
  return result;
}

export async function summarizeResearch(docs: ResearchDoc[], userQuery: string): Promise<RagResult> {
  if (docs.length === 0) {
    return {
      answer: "No relevant recent research found.",
      citations: [],
    };
  }

  const system = `You are a medical research explainer. Summarize findings in plain language for a layperson. Avoid giving diagnosis. Include caveats and encourage consulting a clinician for urgent concerns. Cite key papers with markdown links at the end.`;
  const context = docs
    .map((d, i) => `(${i + 1}) ${d.title} - ${d.url}${d.published ? ` (${d.published})` : ""}`)
    .join("\n");
  const user = `User symptoms/question: ${userQuery}\n\nPapers:\n${context}`;

  const host = process.env.OLLAMA_HOST || "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL || "llama3.1:8b";
  const res = await fetch(`${host}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      options: { temperature: 0.2 },
    }),
  });
  if (!res.ok) {
    throw new Error(`LLM request failed: ${res.status}`);
  }
  const data = await res.json();
  const answer = data?.message?.content || "";
  return { answer, citations: docs };
}

export async function summarizeResearchStructured(
  docs: ResearchDoc[],
  userQuery: string
): Promise<ResearchStructuredResult> {
  if (docs.length === 0) {
    return {
      keyFindings: [],
      clinicalTakeaways: [],
      lifestyleTips: [],
      caveats: [],
      disclaimer: "This is informational and not medical advice.",
    };
  }

  const host = process.env.OLLAMA_HOST || "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL || "llama3.1:8b";

  const schemaInstruction = `Return a strict JSON object with keys:
- keyFindings: array of { title: string, detail: string }
- clinicalTakeaways: string[]
- lifestyleTips: string[]
- caveats: string[]
- disclaimer: string
No extra commentary outside JSON.`;

  const context = docs
    .map((d, i) => `(${i + 1}) ${d.title} - ${d.url}${d.published ? ` (${d.published})` : ""}`)
    .join("\n");
  const user = `User symptoms/question: ${userQuery}\n\nPapers:\n${context}`;

  const res = await fetch(`${host}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      format: "json",
      messages: [
        { role: "system", content: schemaInstruction },
        { role: "user", content: user },
      ],
      options: { temperature: 0.2 },
    }),
  });
  if (!res.ok) {
    throw new Error(`LLM request failed: ${res.status}`);
  }
  const data = await res.json();
  const content = data?.message?.content || "{}";
  try {
    return JSON.parse(content) as ResearchStructuredResult;
  } catch {
    return {
      keyFindings: [],
      clinicalTakeaways: [],
      lifestyleTips: [],
      caveats: [],
      disclaimer: "This is informational and not medical advice.",
    };
  }
}


