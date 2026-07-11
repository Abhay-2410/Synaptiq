# 🧠 Synaptiq — The AI Tutor That Thinks the Way You Think

> *"Every student deserves a great teacher. Synaptiq makes that possible at scale."*

![Mastra](https://img.shields.io/badge/Built%20with-Mastra-00ff88?style=flat-square)
![Qdrant](https://img.shields.io/badge/Memory-Qdrant-ff4444?style=flat-square)
![Enkrypt AI](https://img.shields.io/badge/Safety-Enkrypt%20AI-blue?style=flat-square)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178c6?style=flat-square)

**CBSE (NCERT) + ICSE (CISCE) · Classes 6–12 · All streams**

---

## 🎯 The Problem

Students today have access to more information than ever — yet genuine understanding remains out of reach for most. Generic AI chatbots answer questions in isolation with no memory of past struggles, no awareness of knowledge gaps, and no ability to adapt to individual learning styles.

The result? Surface-level learning that collapses under exam pressure.

---

## 💡 The Solution

Synaptiq is a production-grade, multi-agent AI tutoring system built entirely on **Mastra** that goes beyond answering questions — it understands *how* you think, remembers *where* you've struggled, and meets you exactly where you are.

Supports **CBSE** and **ICSE** boards with board-aware syllabus retrieval, subject tabs (including ICSE History & Civics / Geography split), exam-style question generation, and Quick Challenge mastery tracking.

---

## 🤖 Mastra Agents & Pipeline

| Agent | Role |
|---|---|
| **Tutor Agent** | Step-by-step explanations grounded in syllabus (Groq LLM) |
| **Syllabus Retriever** | Qdrant vector search filtered by board, class, subject |
| **Quick Check Evaluator** | Grades short follow-up answers in Quick Challenge |
| **synaptiq-doubt-pipeline** | Mastra workflow: retrieve → tutor → Enkrypt verify |

---

## ⚡ Key Features

- 📚 **Board-aware** — CBSE (NCERT) and ICSE (CISCE) with separate junior subject layouts
- 🔍 **Qdrant retrieval** — syllabus corpus with board/class/subject filters
- 📝 **Exam-style questions** — practice questions with mark allocation, not just explanations
- 🛡️ **Enkrypt AI safety** — hallucination and curriculum adherence checks
- 🎯 **Quick Challenge** — short quiz after each answer with mastery tracking
- 📐 **STEM solver** — deterministic math/science steps for common problem types

---

## 🏗️ Architecture

Built with:
- **Mastra** — multi-agent orchestration + `synaptiq-doubt-pipeline` workflow
- **Qdrant Cloud** — semantic vector memory via `@mastra/qdrant`
- **Enkrypt AI** — safety verification before answer delivery
- **Groq** — Llama 3.3 70B (tutor) + Llama 3.1 8B (quick check)
- **React + Vite** — student chat UI with board/class/stream selectors

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Agent Framework | Mastra, TypeScript, Node.js |
| LLM | Groq (Llama 3.3 70B / 3.1 8B) |
| AI Safety | Enkrypt AI |
| Vector Store | Qdrant Cloud (`@mastra/qdrant`) |
| Backend | Node.js + Express |
| Frontend | React + Vite |

---

## Quick start

**Project folder:** `Mastra-Hackathon`

### PowerShell (Windows)

```powershell
cd D:\mastra\Mastra-Hackathon

# Backend (terminal 1)
cd backend; npm install; npm run dev

# Frontend (terminal 2)
cd D:\mastra\Mastra-Hackathon\frontend; npm install; npm run dev
```

Open http://localhost:5173 — backend at http://localhost:3001

### Bash / macOS / Linux

```bash
cd Mastra-Hackathon/backend
cp .env.example .env
# Add GROQ_API_KEY, QDRANT_URL, ENKRYPTAI_API_KEY
npm install
npm run seed:qdrant
npm run dev
```

### Strict stack (hackathon)

Every doubt runs through the **Mastra `synaptiq-doubt-pipeline` workflow**:

1. **Qdrant** — syllabus retrieval (board + class + subject filtered)
2. **Mastra Tutor agent** — grounded explanation
3. **Enkrypt AI** — live guardrails before delivery

Check live status: `GET /health` → `stack.ready`

| Env | Purpose |
|-----|---------|
| `STRICT_STACK_MODE=true` | Require sponsor integrations (default) |
| `ALLOW_CORPUS_FALLBACK=false` | Qdrant-only retrieval (default) |
| `USE_ENKRYPT_STUB=false` | Live Enkrypt API (set `ENKRYPTAI_API_KEY`) |

### POST /ask

```bash
curl -N -X POST http://localhost:3001/ask \
  -H "Content-Type: application/json" \
  -d '{"doubt":"Explain nationalism in India","boardId":"cbse","subjectId":"social","classLevel":10}'
```

---

## 👨‍💻 Built for HiDevs × Mastra Hackathon 2026

### Judging criteria alignment

| Criterion | Synaptiq evidence |
|-----------|-------------------|
| Mastra (25%) | 3 agents, `synaptiq-doubt-pipeline` workflow, `syllabus-search` tool, SSE streaming |
| Qdrant (20%) | `@mastra/qdrant` on every `/ask`, board/class/subject filters, 2500+ vectors |
| Enkrypt (20%) | Mandatory verify step, 4 guardrails, UI badge + agent trail |
| Output quality (20%) | Subject modes, STEM solver, exam questions, follow-up context |
| Impact (15%) | CBSE + ICSE, Classes 6–12, all streams |

📄 **[HACKATHON_SUBMISSION.md](./HACKATHON_SUBMISSION.md)** — 5-minute judge demo script  
📄 **[ARCHITECTURE.md](./ARCHITECTURE.md)** — as-built architecture (accurate)

### Verify sponsor stack

```bash
cd backend
npm run test:sponsor
```

### Docker (optional)

```bash
docker compose up -d              # Qdrant only
docker compose --profile full up  # Qdrant + backend (requires backend/.env)
```

---

*Synaptiq — Every doubt deserves more than a generic answer. Learn smarter.*
