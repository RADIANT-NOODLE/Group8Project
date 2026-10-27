# VALORA frontend

React 19 single-page app for the VALORA estate platform. The source lives in [`app/`](app);
[`scripts/build.mjs`](scripts/build.mjs) bundles it with esbuild into `dist/`.

## Install

- Node.js 20 or newer
- Docker Desktop (for the database and the API)

## Run it

Backend — from `backend/`. This starts Postgres and the API, and runs the migrations on startup:

```
docker compose up -d --build db api
```

Frontend — from `FrontEnd/`:

```
npm install
npm run dev
```

Open http://localhost:4173. The API is at http://localhost:8000, with its docs at
http://localhost:8000/docs. No backend handy? Set `VITE_USE_MOCK_AUTH=true` in `FrontEnd/.env` to run
the app on the built-in mock instead.

## Run the API without Docker

From `backend/`, with Python 3.12:

```
py -3 -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
docker compose up -d db
copy .env.example .env
python -m alembic upgrade head
python -m uvicorn app.main:app --reload --port 8000
```

In `.env`, keep `DATABASE_URL` and rename `JWT_SECRET` to `SECRET_KEY` — `app/core/config.py` reads
those two names.

## Checks

```
npm test        # 51 tests
npm run build
```

## Current status

Sign-in, registration, sign-out and the route guards run on the real backend (`/api/v1/auth/*`).
[`app/services/`](app/services) holds the API client, the auth service, the role map and the session
store. The remaining pages still read and write the local storage modules in [`app/data/`](app/data).

- Internal notes — the connection plan, the frontend audit and the phase reports — are kept outside this
  repository.

## Main routes

| Route | Purpose |
|---|---|
| `/` | public landing page |
| `/properties`, `/property/:propertyId` | public property browsing |
| `/login`, `/register` | authentication |
| `/dashboard` | signed-in workspace, rendered per role |
| `/intelligence` | property-scoped complaints and work-order insights |
| `/head-admin`, `/registration-requests`, `/user-management` | estate administration (`hoa_admin`) |
