# Synaptiq

Personalized multi-agent AI tutor for the **HiDevs × Mastra Hackathon 2026**  
Track: **Student Doubt-Solving & Learning Agent**

## Stack

| Layer | Tech |
|-------|------|
| Orchestration | Mastra |
| Retrieval | Qdrant |
| Verification | Enkrypt AI |
| Backend | Node.js + Express |
| Frontend | React (Step 6) |

## Project structure

```
Mastra-Hackathon/
├── backend/
│   ├── agents/              # Mastra agent configs (Tutor lands in Step 3)
│   │   ├── index.ts
│   │   └── tutor.agent.ts
│   ├── pipeline/            # retrieve → tutor → verify chain
│   │   ├── index.ts
│   │   ├── types.ts
│   │   └── stages/
│   │       ├── retrieve.ts  # Step 4 — Qdrant
│   │       ├── tutor.ts     # Step 3 — Mastra Tutor
│   │       └── verify.ts    # Step 5 — Enkrypt
│   └── src/
│       ├── index.ts         # Express + Mastra adapter
│       ├── routes/
│       │   ├── ask.ts       # POST /ask
│       │   └── verify.ts    # POST /internal/verify
│       ├── middleware/
│       │   └── enkrypt.ts   # Enkrypt stub / real API
│       └── lib/
│           └── sse.ts
├── frontend/                # Step 6 — React chat UI
└── ARCHITECTURE.md
```

## Quick start (Steps 1–2)

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### POST /ask

```bash
# Streaming (SSE, default)
curl -N -X POST http://localhost:3001/ask \
  -H "Content-Type: application/json" \
  -d '{"doubt":"How do I solve x^2 - 5x + 6 = 0?"}'

# JSON response
curl -X POST http://localhost:3001/ask \
  -H "Content-Type: application/json" \
  -d '{"doubt":"Explain the quadratic formula","stream":false}'
```

### POST /internal/verify

Internal verification stage — same contract the pipeline uses between Tutor output and final response.

## Build sequence

- [x] **Step 1** — Project skeleton
- [x] **Step 2** — Backend routes (`/ask`, `/internal/verify`, streaming)
- [ ] **Step 3** — Mastra Tutor agent
- [ ] **Step 4** — Qdrant retrieval + seed script
- [ ] **Step 5** — Enkrypt verification middleware (real credentials)
- [ ] **Step 6** — React frontend
