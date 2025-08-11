## Symptom Checker

An web app where users enter symptoms in natural language and get AI-generated possible causes, urgency level, safe next steps, and lifestyle advice. It can also summarize recent medical research using RAG.
🔗 Demo Video : https://youtu.be/cDqR8oD2zJs

### Features
🩺 AI symptom guidance — No diagnosis, but offers safety-first information.

📚 RAG research summaries — Pulls studies from PubMed and explains them in plain language.

⚡ Modern tech stack — Fast, responsive UI built with Next.js, TypeScript, and Tailwind CSS.

🔍 Privacy-friendly — No server-side storage of symptoms; session history is optional and client-side only.

### Tech Stack
- Frontend: Next.js + TypeScript + Tailwind
- Backend: Next.js API routes
- AI: Ollama (local LLM) — default
- RAG: PubMed E-Utilities for retrieval, LLM for summaries



### Ethics and Disclaimer
- This is not a medical device and should not be used for diagnosis.
- For emergencies, users are instructed to seek immediate medical care.
- No personal health data is stored on the server.



