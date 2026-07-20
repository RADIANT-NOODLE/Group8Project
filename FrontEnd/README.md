# VALORA Frontend

React app shell + login/register UI. Auth is client-side validation only for now.

## Setup

```bash
npm install
npm run dev
```

App: `http://localhost:4173`

```bash
npm run build   # → dist/
npm run preview
```

## Routes

| Path | Notes |
|------|--------|
| `/login` | Sign in form |
| `/register` | Create account |
| `/app` | Post-login placeholder |
| `/*` | Redirects to `/login` |

## Env

```bash
cp .env.example .env
```

`VITE_API_BASE_URL` is reserved for the backend. Not used yet.
