# Synaptiq — As-Built Architecture

**HiDevs × Mastra AI Hackathon 2026 · Grand Finale submission**

This document describes the **implemented** system (not a future roadmap).  
For judge demo steps, see [HACKATHON_SUBMISSION.md](./HACKATHON_SUBMISSION.md).

---

## 1. Problem & Impact

Indian CBSE/ICSE students (Classes 6–12) need explanations grounded in their syllabus—not generic chatbot prose. Synaptiq is a TypeScript-native AI tutor that:

- Retrieves **board-, class-, and subject-filtered** syllabus chunks from **Qdrant**
- Generates explanations via **Mastra agents** (Groq LLM)
- Runs **Enkrypt AI** guardrails on every answer before delivery
- Offers **Quick Challenge** mastery checks after each explanation

**Target users:** Self-paced students preparing for board exams across Math, Science, English, Social/Humanities, and Commerce streams.

---

## 2. Mandatory Sponsor Stack

| Technology | Role in Synaptiq | Proof |
|------------|------------------|-------|
| **Mastra** | Orchestrates `synaptiq-doubt-pipeline` workflow; registers 3 agents + Qdrant vector store | `GET /health`, agent trail UI, `npm run test:sponsor` |
| **Qdrant** | Syllabus memory via `@mastra/qdrant` — 2,500+ seeded vectors | Retrieval on every `/ask`, `board`/`class`/`subject` filters |
| **Enkrypt AI** | Live hallucination, adherence, safety, relevancy checks | Workflow `verify` step; badge + trail in UI |

---

## 3. System Diagram

```
Student UI (React + Vite)
    │  SSE POST /ask
    ▼
Express + MastraServer
    │  runDoubtPipeline()
    ▼
Mastra Workflow: synaptiq-doubt-pipeline
    │
    ├─① retrieve ──► syllabus-search tool (Syllabus Retriever agent)
    │                    └─► @mastra/qdrant → Qdrant Cloud
    │
    ├─② tutor ─────► Tutor Agent (Groq llama-3.3-70b)
    │                    └─► structured [[ANSWER]] + optional [[RAW_MATH]]
    │
    └─③ verify ────► Enkrypt AI (4 guardrail endpoints)
                         └─► verified | flagged | blocked

POST /learn/check ──► Quick Check Evaluator Agent (Groq llama-3.1-8b)
```

---

## 4. Mastra Primitives Used

| Primitive | Implementation |
|-----------|----------------|
| `Mastra()` root instance | `backend/agents/index.ts` |
| `Agent` | `tutor`, `syllabus-retriever`, `quick-check-evaluator` |
| `createTool` | `syllabus-search` → Qdrant retrieval |
| `createWorkflow` + `createStep` | `synaptiq-doubt-pipeline` (retrieve → tutor → verify) |
| `QdrantVector` | `backend/integrations/qdrant-store.ts` |
| `MastraServer` (Express) | Auto-mounts `/api/agents`, workflow routes |
| Agent streaming | `tutorAgent.stream()` → SSE `tutor_chunk` events |
| Structured output | Tutor `[[ANSWER]]` / `[[REASONING_STEPS]]` / `[[RAW_MATH]]` blocks |

---

## 5. Agents

### Tutor Agent (`tutor`)
- **File:** `backend/agents/tutor.agent.ts`
- **Model:** Groq `llama-3.3-70b-versatile`
- **Used in:** Workflow step `tutor`, Quick Challenge session analysis
- **Modes:** Math worked steps, history narrative, English grammar, commerce worked examples

### Syllabus Retriever Agent (`syllabus-retriever`)
- **File:** `backend/agents/retriever.agent.ts`
- **Tool:** `syllabus-search` (`backend/agents/retriever.tool.ts`)
- **Used in:** Workflow step `retrieve` executes the Mastra tool → Qdrant
- **Filters:** `board`, `classLevel`, `subjectKey`

### Quick Check Evaluator (`quick-check-evaluator`)
- **File:** `backend/agents/quick-check.agent.ts`
- **Model:** Groq `llama-3.1-8b-instant`
- **Used in:** `POST /learn/check` — grades student short answers with partial credit

---

## 6. Data & Retrieval

- **Corpus:** Hand-seeded NCERT/CBSE + ICSE entries (`backend/pipeline/data/corpus/`)
- **Vectors:** 1536-dim hash embeddings (deterministic, no external embed API)
- **Seeding:** `npm run seed:qdrant`
- **Indexes:** `board`, `classLevel`, `subjectKey`, `topic`, `chapter` payload indexes
- **Fallback:** In-memory corpus only when `ALLOW_CORPUS_FALLBACK=true` (disabled in strict mode)

---

## 7. Safety (Enkrypt)

Every tutor response passes through `verifyTutorOutput()` (`backend/src/middleware/enkrypt.ts`):

1. Hallucination guardrail
2. Curriculum adherence
3. Safety detection
4. Relevancy check

Outcomes surface in the UI via `VerificationBadge` and agent trail step 4.

---

## 8. Frontend

- **Stack:** React 19 + Vite 6 + KaTeX markdown
- **Features:** Board/class/stream/subject selectors, SSE streaming, pipeline status, context panel, exam-question cards, Quick Challenge, “How was this answer built?” trail
- **Session:** `sessionStorage` for study context; `priorMessages` sent for follow-up questions

---

## 9. API Routes

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Live stack status (`stack.ready`) |
| POST | `/ask` | Main doubt pipeline (SSE default) |
| POST | `/learn/check` | Quick Challenge evaluation |
| POST | `/internal/verify` | Dev-only Enkrypt test (auth in production) |
| GET | `/api/agents` | Mastra auto-routes |

---

## 10. Verification Commands

```bash
cd backend
npm run typecheck
npm run test:sponsor      # Mastra + Qdrant + Enkrypt live
npm run test:answers      # Cross-subject answer quality
npm run test:coverage     # Quick Challenge all subjects
npm run ensure:qdrant-indexes  # ICSE board index
```

---

## 11. Deployment

- **Local:** `docker compose up -d` (Qdrant) + `npm run dev` (backend + frontend)
- **Docker:** `backend/Dockerfile` + `docker compose --profile full up`
- **CI:** `.github/workflows/ci.yml` — typecheck + unit smoke tests

---

## 12. Known Limitations

- Hash embeddings are not neural semantic search (trade-off for zero embed API cost)
- Mastery/quick-check sessions are in-memory (reset on server restart)
- No persistent Mastra memory store (conversation context passed per-request via `priorMessages`)

---

*Synaptiq — built for HiDevs × Mastra Hackathon 2026*
