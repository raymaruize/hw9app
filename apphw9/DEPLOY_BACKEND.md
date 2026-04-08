# Backend Deployment: What is needed

## Current status
- iOS app is running from Xcode.
- App will show `SOURCE: local` whenever backend/AI is unreachable.
- To get `SOURCE: backend` or `SOURCE: ai`, you must provide a reachable backend URL.

## Minimum required (must-have)
1. A backend service reachable from app runtime.
2. Endpoint `POST /api/v1/match` returning required fields.
3. Health endpoint `GET /health`.
4. Backend Base URL saved in app Settings.

This project already includes backend code at `backend/server.js`.

## What can be done now (immediately)

### Option A (recommended): Render deploy
1. Push `apphw9` to GitHub.
2. In Render, create **Blueprint** from repo root containing `render.yaml`.
3. Deploy service.
4. Copy URL like `https://poetry-companion-backend.onrender.com`.
5. In app Settings:
   - Backend Base URL = that URL
   - Tap Save
   - Tap Test Backend Connection

### Option B: local backend (simulator only)
1. Run backend locally:
   - `cd apphw9`
   - `npm run backend`
2. Use `http://localhost:3000` in app Settings.

### Option C: local backend (physical iPhone)
1. Run backend locally.
2. Find Mac LAN IP (e.g. `192.168.1.15`).
3. Set Backend Base URL to `http://<MAC_LAN_IP>:3000`.
4. Ensure same Wi‑Fi network and firewall allows port 3000.

## AI path requirements (optional)
- AI switch ON
- Valid AI Base URL (OpenAI-compatible)
- Exact model id (e.g. `gpt-4.1-mini`)
- Valid API key

If AI fails, app falls back to backend, then local.

## Quick verification checklist
- Test button says backend connection succeeded.
- Request recommendation from Input screen.
- Result screen shows `SOURCE: backend` (or `SOURCE: ai`).
- No warning banner about fallback to local.
