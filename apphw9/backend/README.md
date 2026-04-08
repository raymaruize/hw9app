# Poetry Companion Backend

Tiny Node HTTP backend for poem matching.

## Local run

1. Open terminal in this folder.
2. Run:

npm start

3. Health check:

GET /health

4. Match endpoint:

POST /api/v1/match

## Deploy online (Render)

Use this folder as the service root.

- Runtime: Node
- Root Directory: backend
- Build Command: (empty)
- Start Command: npm start
- Auto deploy: enabled

After deploy, copy your service URL like:

https://your-service.onrender.com

Then in the app Settings screen set:

Backend Base URL = https://your-service.onrender.com

## Deploy online (Railway)

- Create a new project from your repo
- Set Root Directory to backend
- Start Command: npm start

Use the generated Railway URL as Backend Base URL in the app.

## Notes

- iPhone device cannot use localhost unless backend runs on-device.
- For physical device testing, use a public URL (Render/Railway) or your Mac LAN IP.
