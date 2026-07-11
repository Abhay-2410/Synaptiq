# HiDevs × Mastra Hackathon — Judge Demo Guide

**Project:** Synaptiq  
**Repo:** https://github.com/Abhay-2410/Synaptiq  
**Stack:** Mastra · Qdrant · Enkrypt AI · Groq · TypeScript

---

## 30-Second Pitch

Synaptiq is a CBSE/ICSE AI tutor (Classes 6–12) where **every doubt** runs through a **Mastra workflow**: Syllabus Retriever tool → Qdrant → Tutor agent → Enkrypt verification → optional Quick Challenge.

---

## Live Demo Script (5 minutes)

### 1. Show stack health (10s)
Open http://localhost:5173 — header shows **🟢 All integrations live ✓**  
Or: `GET http://localhost:3001/health` → `"ready": true`

### 2. Mastra workflow (60s)
- Select **CBSE · Class 10 · Social**
- Ask: *Explain nationalism in India*
- Expand **💡 How was this answer built?**
- Point out steps:
  1. Mastra pipeline coordinator
  2. **Syllabus Retriever agent → syllabus-search tool**
  3. Qdrant vector memory
  4. Tutor agent (Groq)
  5. **Enkrypt AI safety review**

### 3. Qdrant retrieval (30s)
- Expand **Textbook material used** panel — show retrieved chunks with topics
- Mention: 2,518 vectors, `board` + `class` + `subject` metadata filters
- ICSE demo: switch board → **ICSE · Hist & Civics · Class 8**

### 4. Enkrypt verification (20s)
- Show green **Verified** badge on answer
- Explain: 4 live guardrail API calls before delivery

### 5. Quick Challenge (60s)
- Complete the 3–4 question quiz after an answer
- Show partial-credit feedback and final analysis

### 6. Precision / follow-up (30s)
- Ask exam questions: *Give me 2 practice questions on work and energy*
- Follow up: *give me examples for the above questions*
- Show per-question worked examples (not generic tangents)

---

## CLI Verification (for technical judges)

```bash
cd backend
npm run test:sponsor
```

Expected output: `✓ PASS: Mastra + Qdrant + Enkrypt integrated and live`

---

## Judging Criteria Alignment

| Criterion (weight) | How Synaptiq demonstrates it |
|--------------------|-------------------------------|
| Mastra Integration Depth (25%) | 3 agents, 1 workflow, 1 tool, Qdrant vector store, SSE streaming, MastraServer routes |
| Qdrant Integration Quality (20%) | Live queries every `/ask`, metadata filtering, 2500+ seeded corpus, ICSE board index |
| Enkrypt AI Coverage (20%) | Mandatory verify step, 4 guardrails, UI badge + trail, health probe |
| Agent Output Quality (20%) | Subject-specific modes, STEM solver, structured compare answers, exam questions |
| Problem Impact & Novelty (15%) | Real CBSE/ICSE syllabus coverage, board-aware, Classes 6–12 all streams |

---

## Environment Required for Demo

| Key | Purpose |
|-----|---------|
| `GROQ_API_KEY` | Tutor + Quick Check LLM |
| `QDRANT_URL` + `QDRANT_API_KEY` | Vector memory |
| `ENKRYPTAI_API_KEY` | Safety layer |
| `STRICT_STACK_MODE=true` | Require all three sponsors |

---

## What NOT to claim

- ❌ Postgres/Redis/Next.js (not in this build — see ARCHITECTURE.md for accurate stack)
- ❌ Neural embeddings (uses deterministic hash embeddings)
- ❌ Spaced repetition / IRT (future roadmap only)

---

*Good luck at the Grand Finale — July 12, Bengaluru*
