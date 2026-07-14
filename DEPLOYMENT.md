# Deployment & environment setup

This file explains how to obtain credentials for Neon (Postgres) and Upstash (Redis) and where to set environment variables for local development and Vercel deployments.

1) Neon (Postgres) — obtain `DATABASE_URL`
- Create a project in Neon and a database. In the Neon dashboard, copy the provided `DATABASE_URL` (a full Postgres connection string). Keep this secret; store it in your backend host settings.

2) Upstash Redis — obtain REST URL and token
- Create a Redis database in Upstash. In the Upstash console, go to "REST" credentials and copy the `REST URL` and `REST TOKEN`.
- Use the REST credentials from server-side code only (do NOT expose the token to client-side code).

3) Local `.env` files (development)
- Copy the example files to real `.env` files and fill them:
  - `backend/.env.example` -> `backend/.env`
  - `frontend/.env.example` -> `frontend/.env`

4) Running locally
- Backend (from repo root):
  ```powershell
  cd backend
  npm install
  copy .env.example .env
  # edit .env to fill DATABASE_URL and Upstash values
  npm start # or `node index.js` depending on your package.json
  ```
- Frontend:
  ```powershell
  cd frontend
  npm install
  copy .env.example .env
  # edit .env to set VITE_API_URL
  npm run dev
  ```

5) Vercel deployment (frontend)
- In your Vercel project, go to Project Settings → Environment Variables.
- Add `VITE_API_URL` with value set to your backend's production URL (for example `https://api.example.com/api`).
- Set the Environment to `Production` (and add same key to Preview/Development if needed).

6) Backend hosting (server) — where to set server envs
- If you host your backend on Vercel (serverless functions), Render, Fly, etc., set these environment variables in that service's project settings:
  - `DATABASE_URL` = (Neon connection string)
  - `UPSTASH_REDIS_REST_URL` = (Upstash REST URL)
  - `UPSTASH_REDIS_REST_TOKEN` = (Upstash REST token)
  - `PORT` (optional; many platforms inject this automatically)

7) Security notes
- Never commit `.env` files with real secrets. Keep only `*.example` files in the repo.
- Use Upstash REST tokens only on the server.

8) Migrations (Prisma)
- Keep `prisma/migrations` committed to the repo so production can apply the same migrations.
- Locally create migrations after editing `prisma/schema.prisma`:
  ```powershell
  cd backend
  copy .env.example .env
  # set DATABASE_URL in backend/.env
  npx prisma migrate dev --name describe_change
  npx prisma generate
  ```
- In CI / production run:
  ```bash
  npx prisma migrate deploy
  ```

9) DB docs
- See `backend/DB_SCHEMA.md` for the canonical table and column list created by Prisma.

8) Quick test once deployed
- From any machine, test the frontend reads the API and the backend can reach the DB/Redis:
  ```bash
  curl -i "$(echo https://your-frontend.example.com)/"
  curl -i "https://your-backend.example.com/health" # or any health route
  ```

If you want, I can also add code to `backend/index.js` to validate env variables at startup and log clearer errors — shall I add that? 
