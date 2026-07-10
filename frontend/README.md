# Synaptiq Frontend

React + Vite chat UI for the Synaptiq AI tutoring backend.

## Run

```bash
# Terminal 1 — backend (port 3001)
cd ../backend && npm run dev

# Terminal 2 — frontend (port 5173)
npm install
npm run dev
```

Open **http://localhost:5173**

The Vite dev server proxies `/api/*` to `http://localhost:3001`.

## Features

- Streaming tutor responses via SSE (`POST /ask`)
- Live pipeline status (retrieve → tutor → verify)
- Collapsible reasoning steps and retrieved Qdrant context
- Enkrypt verification badges with per-check scores
- Session continuity across messages
- Example prompts for quick testing
