import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { MastraServer } from '@mastra/express';
import { mastra } from '../agents/index.js';
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
  </style>
</head>
<body>
  <main>
    <h1>Synaptiq Backend</h1>
    <p>Student doubt-solving API — Mastra + Qdrant + Enkrypt AI</p>
    <p style="margin:1rem 0;padding:0.75rem 1rem;background:#1e293b;border-radius:8px;border:1px solid #334155;">
      <strong>Student UI:</strong> open <a href="http://localhost:5173">http://localhost:5173</a> for the chat frontend.
    </p>
    <ul>
      <li><a href="/health">GET /health</a> — service status</li>
      <li><code>POST /ask</code> — submit a student doubt (SSE or JSON)</li>
      <li><code>POST /learn/check</code> — evaluate quick-check answer + update mastery</li>
      <li><code>POST /internal/verify</code> — Enkrypt verification stage</li>
      <li><code>GET /api/agents</code> — Mastra agents (via adapter)</li>
    </ul>
    <p>Example: <code>POST /ask</code> with body <code>{"doubt":"How do I solve x^2 - 5x + 6 = 0?","stream":false}</code></p>
  </main>
</body>
</html>`);
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'synaptiq-backend',
    pipeline: ['retrieve', 'tutor', 'verify'],
  });
});

// Custom Synaptiq routes (registered before Mastra adapter init)
app.use('/ask', askRouter);
app.use('/learn', learnRouter);
app.use('/internal/verify', verifyRouter);

const server = new MastraServer({ app, mastra });
await server.init();

app.listen(PORT, () => {
  console.log(`Synaptiq backend listening on http://localhost:${PORT}`);
  console.log('  GET  /                   — API landing page');
  console.log('  POST /ask              — submit a doubt (SSE or JSON)');
  console.log('  POST /learn/check      — evaluate quick-check mastery');
  console.log('  POST /internal/verify  — Enkrypt verification stage');
  console.log('  GET  /health           — health check');
});
