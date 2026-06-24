# 🧠 Synaptiq — The AI Tutor That Thinks the Way You Think

> *"Every student deserves a great teacher. Synaptiq makes that possible at scale."*

![Mastra](https://img.shields.io/badge/Built%20with-Mastra-00ff88?style=flat-square)
![Qdrant](https://img.shields.io/badge/Memory-Qdrant-ff4444?style=flat-square)
![Enkrypt AI](https://img.shields.io/badge/Safety-Enkrypt%20AI-blue?style=flat-square)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178c6?style=flat-square)

---

## 🎯 The Problem

Students today have access to more information than ever — yet genuine understanding remains out of reach for most. Generic AI chatbots answer questions in isolation with no memory of past struggles, no awareness of knowledge gaps, and no ability to adapt to individual learning styles.

The result? Surface-level learning that collapses under exam pressure.

---

## 💡 The Solution

Synaptiq is a production-grade, multi-agent AI tutoring system built entirely on **Mastra** that goes beyond answering questions — it understands *how* you think, remembers *where* you've struggled, and meets you exactly where you are.

---

## 🤖 7 Specialized Mastra Agents

| Agent | Role |
|---|---|
| **Tutor Agent** | Adapts explanations from ELI5 → Expert based on proficiency score |
| **Gap Tracker Agent** | Monitors wrong answers and builds a live knowledge gap report |
| **Resurface Agent** | Proactively nudges students using Ebbinghaus forgetting curve |
| **Quiz Agent** | Generates Socratic follow-up questions to reinforce understanding |
| **Teacher Oversight Agent** | Aggregates class-wide gaps for educator dashboards |
| **Vision AI Agent** | Parses handwritten notes and diagrams via GPT-4o Vision |
| **Sentiment Analysis Agent** | Detects frustration/confusion and adjusts tone in real time |

---

## ⚡ Key Differentiators

- 🧬 **Prerequisite Gap Detector** — teaches foundations before advanced concepts
- 📉 **Ebbinghaus Forgetting Curve** — mastery scores decay and trigger review nudges
- 🎓 **Bloom's Taxonomy Classifier** — calibrates explanation depth per query
- 📊 **XGBoost Weak Topic Predictor** — predicts future struggle areas proactively
- 🔄 **GraphRAG + Self-RAG** — multi-hop concept retrieval over Neo4j knowledge graph
- 🎯 **PPO Curriculum Sequencer** — RL agent finds optimal concept teaching order
- 🛡️ **Enkrypt AI Dual Safety Layer** — filters hallucinations at both RAG and LLM output stage

---

## 🏗️ Architecture

Built with:
- **Mastra** — multi-agent orchestration + 3 workflow automations
- **Qdrant Cloud** — semantic vector memory (HNSW + BM25 hybrid)
- **Neo4j Aura** — knowledge graph for concept prerequisite chains
- **Enkrypt AI** — hallucination detection + curriculum safety filter
- **PostgreSQL (Supabase)** — student knowledge graph + mastery tracking
- **Redis (Upstash)** — session cache + rate limiting
- **Langfuse** — full agent trace observability
- **React + TypeScript + Tailwind CSS** — student chat UI + progress dashboard

---

## 🔄 3 Mastra Workflow Automations

1. **onStudentQuery** — real-time doubt resolution pipeline
2. **dailyResurface** — cron-triggered spaced repetition nudges
3. **postSession** — knowledge graph update + forgetting curve reset

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Agent Framework | Mastra, TypeScript, Node.js |
| LLM Providers | Claude-3.5-Sonnet, GPT-4o-mini |
| AI Safety | Enkrypt AI |
| Vector Store | Qdrant Cloud |
| Knowledge Graph | Neo4j Aura |
| Database | PostgreSQL, Supabase, Prisma |
| Cache | Redis, Upstash |
| ML Models | XGBoost, RoBERTa, PPO |
| Voice AI | Whisper + ElevenLabs |
| Vision AI | GPT-4o Vision |
| Observability | Langfuse |
| Frontend | React, Tailwind CSS, Recharts |
| Notifications | Firebase Cloud Messaging, Twilio |
| Deployment | Vercel + Railway |

---

## 👨‍💻 Built for HiDevs × Mastra Hackathon 2026

*Synaptiq — Because no student should ever feel alone while studying.*
