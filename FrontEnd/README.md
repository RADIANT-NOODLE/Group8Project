# VALORA Frontend

Frontend login and registration demo with validation, mock authentication, protected sessions, role display, logout, and a ready-to-connect API seam.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:4173`.

## Authentication mode

The offline demo is the default:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK_AUTH=true
```

Set `VITE_USE_MOCK_AUTH=false` only when the backend supplies register, login, and `/me`. Restart the frontend after changing `.env` because configuration is injected during the build.

## Routes

| Route | Behaviour |
| --- | --- |
| `/login` | Validated login; authenticated users redirect to `/app` |
| `/register` | Validated account creation with four roles |
| `/app` | Protected account summary and logout |
| Other | Redirect based on authentication state |

## Mock authentication

Mock users are stored locally so the demo works without the backend. Passwords are converted to salted SHA-256 digests before storage; plaintext passwords are never written to local or session storage. The public session contains only the token and public user fields.

Supported roles:

- `resident`
- `investor`
- `estate_agent`
- `hoa_admin`

## API seam

```text
Pages → AuthContext → authService → mockAuthService or authApi → API client
```

Pages contain no direct `fetch`, `localStorage`, or `sessionStorage` calls. API mode expects:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- Bearer access token
- HTTP 401, 409, and 422 errors
- CORS access for the frontend origin

## Test and build

```bash
npm run test
npm run build
npm run preview
```

Individual suites:

```bash
npm run test:phase3
npm run test:phase6
npm run test:phase7
```

## Demo flow

1. Open `/register` and create a mock account.
2. Confirm `/app` shows the correct name, email, and role.
3. Refresh; the session should remain active.
4. Log out; `/app` should redirect to `/login`.
5. Sign in using the mock account created in step 1.
6. Try the wrong password to confirm the safe generic error.

Non-functional password recovery and OAuth controls are intentionally excluded until their backend flows exist.
