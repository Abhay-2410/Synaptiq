"""Generate Synaptiq architecture PDF from ARCHITECTURE.md"""
import re
from pathlib import Path
from fpdf import FPDF

MD_PATH = Path(__file__).parent / "ARCHITECTURE.md"
PDF_PATH = Path(__file__).parent / "Synaptiq-Architecture.pdf"

# Brand colors
NAVY = (15, 23, 42)
ACCENT = (59, 130, 246)
GRAY = (100, 116, 139)
LIGHT_BG = (248, 250, 252)
WHITE = (255, 255, 255)


class ArchPDF(FPDF):
    def header(self):
        if self.page_no() > 1:
            self.set_font("Helvetica", "I", 8)
            self.set_text_color(*GRAY)
            self.cell(0, 8, "Synaptiq - HiDevs x Mastra Hackathon Architecture", align="C")
            self.ln(4)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(*GRAY)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")

    def cover_page(self):
        self.add_page()
        self.set_fill_color(*NAVY)
        self.rect(0, 0, 210, 297, "F")
        self.ln(60)
        self.set_font("Helvetica", "B", 36)
        self.set_text_color(*WHITE)
        self.cell(0, 20, "Synaptiq", align="C", new_x="LMARGIN", new_y="NEXT")
        self.set_font("Helvetica", "", 16)
        self.set_text_color(200, 210, 230)
        self.cell(0, 12, "Production Architecture Document", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(10)
        self.set_draw_color(*ACCENT)
        self.set_line_width(0.8)
        self.line(60, self.get_y(), 150, self.get_y())
        self.ln(15)
        self.set_font("Helvetica", "", 12)
        self.cell(0, 8, "HiDevs x Mastra Hackathon  |  Round 1 Submission", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(8)
        self.set_font("Helvetica", "", 11)
        tags = "Mastra  |  Qdrant  |  Enkrypt AI  |  Next.js  |  PostgreSQL  |  Redis"
        self.cell(0, 8, tags, align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(40)
        self.set_font("Helvetica", "I", 10)
        self.cell(0, 8, "AI-Powered Adaptive Tutoring Multi-Agent System", align="C")

    def section_title(self, title: str, num: str = ""):
        self.ln(4)
        if self.get_y() > 250:
            self.add_page()
        self.set_fill_color(*LIGHT_BG)
        self.set_draw_color(*ACCENT)
        self.set_line_width(0.5)
        label = f"{num}. {title}" if num else title
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(*NAVY)
        self.cell(0, 10, label, new_x="LMARGIN", new_y="NEXT", fill=True)
        self.ln(3)

    def sub_title(self, title: str):
        self.ln(2)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(*ACCENT)
        self.multi_cell(0, 6, title)
        self.ln(1)

    def body(self, text: str):
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(30, 41, 59)
        self.multi_cell(0, 5.5, text)
        self.ln(2)

    def bullet(self, text: str):
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(30, 41, 59)
        x = self.get_x()
        self.cell(5, 5.5, "-")
        self.multi_cell(0, 5.5, text)
        self.set_x(x)

    def table(self, headers: list, rows: list, col_widths: list = None):
        if self.get_y() > 230:
            self.add_page()
        n = len(headers)
        if not col_widths:
            w = 190 / n
            col_widths = [w] * n
        # Header
        self.set_font("Helvetica", "B", 8)
        self.set_fill_color(*NAVY)
        self.set_text_color(*WHITE)
        for i, h in enumerate(headers):
            self.cell(col_widths[i], 7, h, border=1, fill=True)
        self.ln()
        # Rows
        self.set_font("Helvetica", "", 7.5)
        fill = False
        for row in rows:
            if self.get_y() > 270:
                self.add_page()
                self.set_font("Helvetica", "B", 8)
                self.set_fill_color(*NAVY)
                self.set_text_color(*WHITE)
                for i, h in enumerate(headers):
                    self.cell(col_widths[i], 7, h, border=1, fill=True)
                self.ln()
                self.set_font("Helvetica", "", 7.5)
            self.set_fill_color(*(LIGHT_BG if fill else WHITE))
            self.set_text_color(30, 41, 59)
            max_h = 7
            # Calculate row height
            cell_texts = []
            for i, cell in enumerate(row):
                cell_texts.append(str(cell))
            # Simple single-line rows
            for i, cell in enumerate(cell_texts):
                self.cell(col_widths[i], max_h, cell[:80], border=1, fill=True)
            self.ln()
            fill = not fill
        self.ln(3)

    def code_block(self, text: str):
        if self.get_y() > 240:
            self.add_page()
        self.set_fill_color(241, 245, 249)
        self.set_font("Courier", "", 7)
        self.set_text_color(30, 41, 59)
        lines = text.strip().split("\n")
        box_h = len(lines) * 4 + 4
        self.rect(self.get_x(), self.get_y(), 190, box_h, "F")
        self.ln(2)
        for line in lines:
            self.cell(0, 4, "  " + line[:95], new_x="LMARGIN", new_y="NEXT")
        self.ln(4)


def build_pdf():
    pdf = ArchPDF()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.cover_page()
    pdf.add_page()

    # 1. Problem & Impact
    pdf.section_title("Problem & Impact", "1")
    pdf.body(
        "Indian K-12 and competitive-exam students lose 40-60% of new material within 48 hours because "
        "tutoring apps deliver static content, not personalized re-sequencing tied to forgetting curves "
        "and mastery gaps. Synaptiq is a TypeScript-native AI tutoring system that replaces one-size-fits-all "
        "chatbots with a Mastra-orchestrated multi-agent pipeline: it diagnoses learning style, sequences "
        "curriculum by Bloom level and IRT difficulty, retrieves grounded explanations from Qdrant, and "
        "gates every turn through Enkrypt AI before a student sees it. Target users are self-paced learners "
        "(JEE/NEET/CBSE). Measurable outcomes: mastery score delta, time-to-remediation, hallucination block rate."
    )

    # 2. Agent Workflows
    pdf.section_title("Agent Workflows", "2")
    pdf.body("A session flows through five stages:")
    for stage in [
        "Onboarding - Identity Agent collects grade, goals, prior scores; writes profile to Postgres; seeds Qdrant.",
        "Intent routing - Supervisor Agent classifies turn (explain, practice, assess, review) and fans out.",
        "Adaptive planning - Style Detector, Forgetting-Curve Scheduler, IRT Calibrator run in parallel.",
        "Delivery - Tutor Agent generates explanations; calls Multimodal Tools on visual/kinesthetic hits.",
        "Assessment loop - Assessment Agent emits questions; wrong answers branch to Remediation Agent.",
    ]:
        pdf.bullet(stage)

    pdf.sub_title("Agent Justifications")
    agents = [
        ("Supervisor Agent", "Ambiguous questions waste 30%+ tokens without intent routing."),
        ("Learning Style Detector", "Visual learners retain 65% more with diagrammed concepts."),
        ("Curriculum Sequencer", "Exam syllabi are DAGs - topologically orders prerequisites."),
        ("Tutor Agent", "Grounds every answer in Qdrant chunks, not parametric memory."),
        ("Assessment Agent", "Forces active recall - the only signal IRT can calibrate on."),
        ("Remediation Agent", "Walks prerequisite graph in Qdrant to find true failure point."),
        ("Progress Tracker", "Surfaces mastery %, streak, next-review ETA from Postgres + Redis."),
        ("Bloom Classifier", "Mis-tagged questions let students pass drills but fail exams."),
        ("IRT Calibrator", "Adjusts difficulty theta to learner's zone of proximal development."),
        ("Forgetting-Curve Scheduler", "60% retention loss in 48h (Ebbinghaus) - re-sequences before decay."),
        ("Spaced-Repetition Engine", "Writes SM-2 intervals to Redis; surfaces due cards on session start."),
        ("RAG Retriever Agent", "Hybrid dense+filtered Qdrant queries scoped to subject and grade."),
        ("Identity / Onboarding Agent", "Bootstraps learner_profiles and seeds Qdrant namespaces per user."),
    ]
    pdf.table(["Agent", "Pain Point Addressed"], agents, [45, 145])

    # 3. Mastra Orchestration
    pdf.section_title("Mastra Orchestration", "3")
    pdf.body(
        "All agents register on a single Mastra instance with shared PostgresStore (threads) and "
        "QdrantVector (semantic memory). Curriculum Workflow uses createWorkflow graph with .then(), "
        ".parallel(), and .branch(). Tutor Branch calls tutorAgent.generate() with memory threadId. "
        "Multimodal Tools are createTool definitions with requireToolApproval and workflow.suspend(). "
        "RAG uses createVectorQueryTool with QDRANT_PROMPT. Frontend subscribes to tutorAgent.stream() SSE."
    )
    pdf.sub_title("Mastra Primitives Used")
    primitives = [
        ("Mastra() + registerAgent", "Root orchestrator instance"),
        ("createWorkflow + .then/.branch/.parallel", "Curriculum + assessment pipelines"),
        ("createStep", "Each workflow stage"),
        ("Agent.generate() / .stream()", "Tutor, Assessment, Supervisor agents"),
        ("createTool", "Diagram generator, code sandbox"),
        ("createVectorQueryTool", "RAG Retriever Agent"),
        ("Memory + PostgresStore", "Cross-session conversation continuity"),
        ("QdrantVector (@mastra/qdrant)", "Semantic memory backend"),
        ("suspend() / resume()", "Human-in-the-loop sandbox approval"),
        ("Observability spans", "enkrypt_check_id + qdrant_hit_ids attributes"),
    ]
    pdf.table(["Primitive", "Where Used"], primitives, [65, 125])

    # 4. Qdrant
    pdf.section_title("Qdrant Memory & Retrieval", "4")
    collections = [
        ("curriculum_chunks", "Textbook chunks (1536-dim)", "Filters: subject, grade, bloom_level"),
        ("learner_misconceptions", "Wrong-answer patterns per user", "Filter: user_id; upserted on fail"),
        ("session_summaries", "Compressed turn summaries", "Vector + thread_id filter"),
        ("multimodal_assets", "Diagram caption embeddings", "Linked to chunk_id for re-use"),
    ]
    pdf.table(["Collection", "Contents", "Retrieval"], collections, [50, 55, 85])
    pdf.body(
        "Ingestion: PDFs -> MDocument chunker -> embed() -> store.upsert(). "
        "Redis (Upstash) caches hot results (TTL 15 min) and SM-2 review queues. "
        "After remediation, misconception vectors upserted for faster future retrieval."
    )

    # 5. Enkrypt AI
    pdf.section_title("Enkrypt AI Evaluation Layer", "5")
    pdf.body(
        "Enkrypt is a first-class pipeline stage. Every turn passes through policy bundle synaptiq-tutor-v1."
    )
    pdf.sub_title("Pipeline Stages")
    pdf.code_block(
        "Student Input\n"
        "  -> STAGE 1 Pre-Ingress: PII mutate + detect (jailbreak/toxicity)\n"
        "  -> Mastra Supervisor -> Agents -> Qdrant RAG\n"
        "  -> STAGE 2 Post-Retrieval: adherence check (response vs context)\n"
        "  -> Tutor Agent .generate() / .stream()\n"
        "  -> STAGE 3 Post-Generation: hallucination + relevancy + PII mutate\n"
        "  -> STAGE 4 Policy Gate: /guardrails/policy/detect\n"
        "  -> Stream to Frontend"
    )
    pdf.sub_title("Failure Actions")
    failures = [
        ("PII (request)", "entity detected", "Mutate - store enkrypt_key in Redis"),
        ("Jailbreak/injection", "score > 0.85", "Block - log to safety_events"),
        ("Toxicity/NSFW", "score > 0.8", "Block - escalate for minors"),
        ("Adherence", "score < 0.7", "Retry widen topK; then escalate"),
        ("Hallucination", "is_hallucination: 1", "Retry strict_grounding; 2nd fail -> suspend()"),
        ("Relevancy", "score < 0.6", "Retry with Supervisor re-routing"),
        ("PII (response)", "entity detected", "Mutate before streaming"),
    ]
    pdf.table(["Check", "Threshold", "Action"], failures, [40, 40, 110])

    # 6. Frontend
    pdf.section_title("Frontend", "6")
    pdf.body(
        "Next.js 15 (App Router) on Vercel. Pages: /onboarding, /learn/[topicId], /assess/[sessionId], "
        "/progress. Split-pane learn view: SSE chat + Mermaid/Monaco panel. TanStack Query for API state. "
        "Clerk/NextAuth JWT auth. Safety Badge (green/amber/red) from Enkrypt stage-4. "
        "Progress dashboard shows IRT theta, Bloom breakdown, due review cards."
    )

    # 7. Backend & APIs
    pdf.section_title("Backend & APIs", "7")
    endpoints = [
        ("POST", "/api/v1/sessions", "Create session; Onboarding Workflow"),
        ("POST", "/api/v1/sessions/:id/message", "Full Enkrypt + Mastra pipeline; SSE"),
        ("GET", "/api/v1/sessions/:id/stream", "Resume in-flight Tutor stream"),
        ("POST", "/api/v1/assessments/:id/submit", "Assessment Workflow; IRT update"),
        ("GET", "/api/v1/curriculum/:userId", "Sequenced topic DAG"),
        ("GET", "/api/v1/progress/:userId", "Mastery, streak, SM-2 due cards"),
        ("POST", "/api/v1/reviews/:cardId/complete", "Mark spaced-repetition card done"),
        ("POST", "/api/v1/ingest", "Admin: PDF -> Qdrant upsert"),
        ("GET", "/api/v1/safety/events/:userId", "Enkrypt audit log"),
        ("POST", "/api/v1/workflows/:id/resume", "HITL resume after suspend()"),
    ]
    pdf.table(["Method", "Path", "Purpose"], endpoints, [18, 65, 107])

    # 8. Database
    pdf.section_title("Database", "8")
    pdf.sub_title("PostgreSQL (Neon)")
    tables = [
        "users - id, email, grade, exam_target, learning_style",
        "learner_profiles - user_id, irt_theta, bloom_distribution, style_scores",
        "sessions - id, user_id, thread_id, status, started_at",
        "messages - id, session_id, role, content_redacted, enkrypt_key, safety_status",
        "assessments - id, session_id, topic_id, bloom_level, difficulty_theta, correct",
        "mastery_records - user_id, topic_id, mastery_pct, last_practiced",
        "spaced_repetition_cards - id, user_id, topic_id, interval_days, ease_factor, due_at",
        "safety_events - id, session_id, stage, check_type, score, action",
        "curriculum_topics - id, subject, title, prerequisite_ids, bloom_level",
    ]
    for t in tables:
        pdf.bullet(t)
    pdf.sub_title("Redis (Upstash)")
    pdf.bullet("session:{id}:enkrypt_key - PII deanonymization")
    pdf.bullet("reviews:due:{userId} - SM-2 sorted set")
    pdf.bullet("Qdrant query cache (TTL 15 min); rate limits 100 req/min/user")

    # 9. Deployment
    pdf.section_title("Deployment", "9")
    deploy = [
        ("Frontend", "Vercel", "Edge SSR, PR preview deploys"),
        ("Mastra API", "Railway (Docker)", "Long-running workers for .stream()"),
        ("PostgreSQL", "Neon", "Branching DB per env"),
        ("Redis", "Upstash", "Serverless, same region as Railway"),
        ("Qdrant", "Qdrant Cloud", "Separate collections per env"),
        ("Enkrypt AI", "api.enkryptai.com", "API key per env in secrets"),
    ]
    pdf.table(["Layer", "Host", "Rationale"], deploy, [35, 50, 105])
    pdf.sub_title("CI/CD")
    pdf.body(
        "git push -> GitHub Actions (lint, typecheck, test) -> Docker build -> Railway deploy. "
        "Vercel auto-deploys frontend. main -> staging; tag v* -> production. "
        "Mastra agents scale horizontally on Railway replicas; PostgresStore ensures suspend/resume across replicas."
    )

    # 10. Judging Alignment
    pdf.section_title("Judging Alignment", "10")
    judging = [
        ("Mastra Integration", "25%", "Workflows, Agents, Tools, Memory, VectorQueryTool, suspend/resume"),
        ("Qdrant Integration", "20%", "4 collections, metadata filters, misconception write-back"),
        ("Enkrypt AI Coverage", "20%", "4-stage pipeline, 7 policies, block/retry/escalate matrix"),
        ("Agent Output Quality", "20%", "RAG-grounded Tutor + IRT Assessment + remediation loop"),
        ("Problem Impact", "15%", "Forgetting-curve scheduling, IRT, 48-hour retention targeting"),
    ]
    pdf.table(["Criterion", "Weight", "Synaptiq Coverage"], judging, [45, 20, 125])

    pdf.ln(8)
    pdf.set_font("Helvetica", "I", 9)
    pdf.set_text_color(*GRAY)
    pdf.cell(0, 8, "Synaptiq - Built with Mastra, Qdrant, and Enkrypt AI | HiDevs x Mastra Hackathon 2026", align="C")

    pdf.output(str(PDF_PATH))
    print(f"PDF generated: {PDF_PATH}")


if __name__ == "__main__":
    build_pdf()
