# Testing Synaptiq on your phone (iPhone / Android)

## 1. Same Wi‑Fi

Your phone and PC must be on the **same Wi‑Fi network**.

## 2. Start the servers (network-visible)

From the project root:

```bash
# Terminal 1 — backend
cd backend
npm run dev

# Terminal 2 — frontend (listens on all interfaces)
cd frontend
npm run dev
```

The frontend dev server prints a **Network** URL like `http://192.168.x.x:5173`.

## 3. Open on your phone

In Safari (iPhone) or Chrome (Android), open:

`http://YOUR_PC_IP:5173`

Replace `YOUR_PC_IP` with the address shown in the Vite terminal (e.g. `192.168.1.42`).

## 4. Windows firewall

If the page does not load, allow **Node.js** through Windows Firewall for private networks, or temporarily allow inbound TCP on ports **5173** and **3001**.

## 5. What to try on mobile

- Ask a doubt (chat + streaming answer)
- **Fix my notes** → Take photo / Choose file
- Collapse **Study setup** to save screen space
- Rotate portrait / landscape
- Class & subject changes from the study panel

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Page won't load | Check IP, Wi‑Fi, firewall |
| API errors | Ensure backend is running on port 3001 |
| Camera won't open | Use HTTPS in production; on local HTTP, "Choose file" still works |
| Input zooms on iPhone | Fixed via 16px font on inputs — refresh cache |

Direct API URL (only if proxy fails): set `VITE_API_URL=http://YOUR_PC_IP:3001` in `frontend/.env` and restart Vite.
