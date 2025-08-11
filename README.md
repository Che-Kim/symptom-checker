## Symptom Checker

An educational web app where users enter symptoms in natural language and get AI-generated possible causes, urgency level, safe next steps, and lifestyle advice. It can also summarize recent medical research using RAG.

### Features
- Symptom input and AI guidance (no diagnosis; safety-first)
- RAG research summarizer powered by PubMed
- Next.js App Router, TypeScript, Tailwind CSS

### Stack
- Frontend: Next.js + TypeScript + Tailwind
- Backend: Next.js API routes
- AI: OpenAI Chat Completions
- RAG: PubMed E-Utilities for retrieval, LLM for lay summaries

### Quickstart
1. Copy envs:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in required keys in `.env.local`.
3. Install and run:
   ```bash
   npm install
   npm run dev
   ```
4. Open `http://localhost:3000`.

### Environment Variables
Create `.env.local` with:
```
# If using OpenAI (paid):
# OPENAI_API_KEY=sk-...

# If using free local Ollama (recommended):
# OLLAMA_HOST=http://localhost:11434
# OLLAMA_MODEL=llama3.1:8b

# Optional: NCBI API key for higher PubMed rate limits
# NCBI_API_KEY=...
```

### Deploy (Vercel)
1. Push to a Git repo.
2. Import in Vercel, set the same environment variables in Project Settings → Environment Variables.
3. Deploy.

### Notes and Ethics
- Not a medical device. For emergencies, instructs users to seek immediate care.
- No server-side storage of symptoms; session history is client-only and opt-in.

