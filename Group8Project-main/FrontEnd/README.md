# VALORA frontend

React 19 single-page app for the VALORA estate platform. The source lives in [`app/`](app);
[`scripts/build.mjs`](scripts/build.mjs) bundles it with esbuild into `dist/`.

## Install

- Node.js 20 or newer
- Python 3.12
- A Neon (hosted PostgreSQL) database

## Run it

Database — create a project in Neon and copy its connection string into `backend/.env` as
`DATABASE_URL`, starting with `postgresql+asyncpg://` (see `.env.example`).

Backend — from `backend/`:

```
py -3 -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python -m alembic upgrade head
python -m uvicorn app.main:app --reload --port 8000
```

Frontend — from `FrontEnd/`:

```
npm install
npm run dev
```

Open http://localhost:4173. The API is at http://localhost:8000, with its docs at
http://localhost:8000/docs. No backend handy? Set `VITE_USE_MOCK_AUTH=true` in `FrontEnd/.env` to run
the app on the built-in mock instead.

`backend/.env` is read by `app/core/config.py`: keep `DATABASE_URL`, set `SECRET_KEY`, and leave
`DATABASE_SSL=false` for a local database.

Estate agents cannot register themselves. An HOA administrator creates their account from
**Create Agent Account** in the sidebar.

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
| `/head-admin`, `/registration-requests`, `/user-management` | estate administration (`hoa_admin`) |
