# Deploy on Render

This project has two parts:
- **Web app (Next.js)** – UI, problem browser, editor (static data in `data/`).
- **Companion server (Node/Express)** – local execution & Python debug (`/api/execute`, `/api/debug/trace`, `/api/system/status`). Needs `python3`, `java/javac`, `g++` for full support.

## Option A: Blueprint (recommended)

1. Push this repo to GitHub.
2. In Render: **New +** → **Blueprint** → connect the repo (`render.yaml`).
3. Deploy. This creates:
   - `leetcode-revision-lab` (Node web service)
   - `lc-lab-companion` (Docker web service with python3, JDK 17, g++)
4. After both are live, copy the companion URL (e.g. `https://lc-lab-companion.onrender.com`).
5. In the **leetcode-revision-lab** service → **Environment** set:
   - `NEXT_PUBLIC_COMPANION_URL` = `<your companion URL>` (no trailing slash)
6. Trigger a **Manual Deploy → Clear build cache & deploy** for the web app (env is baked at build time for `NEXT_PUBLIC_*`).

## Option B: Manual setup

### 1) Companion (Docker web service)
- **New +** → **Web Service** → connect repo
- **Runtime:** Docker
- **Dockerfile Path:** `./companion-server/Dockerfile`
- **Docker Build Context Directory:** `./companion-server`
- **Plan:** Free (note: spins down on inactivity; first request may be slow)
- Deploy and note its URL.

### 2) Web app (Node web service)
- **New +** → **Web Service** → connect same repo
- **Runtime:** Node
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Environment variables:**
  - `NODE_VERSION` = `20`
  - `NEXT_PUBLIC_COMPANION_URL` = `https://<your-companion-service>.onrender.com`
- Deploy (rebuild required if you change `NEXT_PUBLIC_COMPANION_URL`).

## Notes
- **Free tier:** services sleep when idle; companion cold starts can take time and in-memory/nothing is persisted (fine here). Run/Debug may feel slow on first hit.
- **Execution limits:** companion runs user code with timeouts and temp dirs, but do not expose it publicly without auth/rate-limiting for untrusted users.
- **Without companion:** the site still works for browsing problems, reading solutions, notes/profile (local browser storage), but Run/Debug and toolchain status will show offline unless `NEXT_PUBLIC_COMPANION_URL` points to a reachable companion.
- **Local dev:** `npm run dev` (app) and `npm run companion` (companion at `http://localhost:3001`) — default behavior unchanged.
