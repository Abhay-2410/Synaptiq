import '../load-env.js';
import cors from 'cors';
import express from 'express';
import { MastraServer } from '@mastra/express';
import {
  mastra,
  MASTRA_AGENT_IDS,
  MASTRA_WORKFLOW_IDS,
  checkLlmProviderAtStartup,
  getLlmProvider,
  isGroqReachable,
} from '../agents/index.js';
import { checkStackHealth, logStackHealthAtStartup } from '../integrations/health.js';
import { ensureQdrantCollection } from '../integrations/qdrant-store.js';
import { askRouter } from './routes/ask.js';
import { learnRouter } from './routes/learn.js';
import { verifyRouter } from './routes/verify.js';

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' }));

app.get('/', (_req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Synaptiq API</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 2rem; }
    main { max-width: 720px; margin: 0 auto; }
    h1 { color: #60a5fa; margin-bottom: 0.25rem; }
    p { color: #94a3b8; }
    code { background: #1e293b; padding: 0.15rem 0.4rem; border-radius: 4px; }
    ul { line-height: 1.8; }
    a { color: #93c5fd; }
    .stack { margin:1rem 0;padding:0.75rem 1rem;background:#1e293b;border-radius:8px;border:1px solid #334155; }
  </style>
</head>
<body>
  <main>
    <h1>Synaptiq Backend</h1>
    <p>Student doubt-solving — <strong>Mastra workflow</strong> + <strong>@mastra/qdrant</strong> + <strong>Enkrypt AI</strong></p>
    <div class="stack">
      Pipeline: Mastra <code>synaptiq-doubt-pipeline</code> workflow → Qdrant retrieval → Tutor agent → Enkrypt verify
    </div>
    <p style="margin:1rem 0;padding:0.75rem 1rem;background:#1e293b;border-radius:8px;border:1px solid #334155;">
      <strong>Student UI:</strong> open <a href="http://localhost:5173">http://localhost:5173</a>
    </p>
    <ul>
      <li><a href="/health">GET /health</a> — live stack status (Mastra + Qdrant + Enkrypt)</li>
      <li><code>POST /ask</code> — submit a student doubt (SSE or JSON)</li>
      <li><code>POST /learn/check</code> — Quick Challenge evaluation</li>
      <li><code>POST /internal/verify</code> — Enkrypt verification stage</li>
      <li><code>GET /api/agents</code> — Mastra agents</li>
    </ul>
  </main>
</body>
</html>`);
});

app.get('/health', async (_req, res) => {
  const stack = await checkStackHealth(MASTRA_AGENT_IDS, MASTRA_WORKFLOW_IDS);
  res.json({
    status: stack.ready ? 'ok' : 'degraded',
    service: 'synaptiq-backend',
    timestamp: new Date().toISOString(),
    stack,
    llm: {
      provider: getLlmProvider(),
      groqReachable: isGroqReachable(),
      tutorModel: process.env.TUTOR_MODEL ?? 'llama-3.3-70b-versatile',
      quickCheckModel: process.env.QUICK_CHECK_MODEL ?? 'llama-3.1-8b-instant',
    },
  });
});

app.use('/ask', askRouter);
app.use('/learn', learnRouter);
app.use('/internal/verify', verifyRouter);

const server = new MastraServer({ app, mastra });
await server.init();

await checkLlmProviderAtStartup();

try {
  await ensureQdrantCollection();
} catch (err) {
  console.error('[qdrant] Startup collection check failed:', err instanceof Error ? err.message : err);
}

await logStackHealthAtStartup(MASTRA_AGENT_IDS, MASTRA_WORKFLOW_IDS);

app.listen(PORT, () => {
  console.log(`Synaptiq backend listening on http://localhost:${PORT}`);
  console.log('  GET  /health            — Mastra + Qdrant + Enkrypt live status');
  console.log('  POST /ask               — Mastra workflow doubt pipeline');
  console.log('  POST /learn/check       — Quick Challenge (Mastra evaluator agent)');
  console.log('  POST /internal/verify   — Enkrypt verification');
});
