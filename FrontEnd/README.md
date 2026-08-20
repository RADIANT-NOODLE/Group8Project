# VALORA Frontend


## Current status

Registration and login work with the VALORA backend and PostgreSQL database when the backend is running. The current login and registration layout keeps the approved previous design while the home page and dashboard are completed by other team members. The full visual design can be reviewed afterwards.

## Run locally

Start the backend first from `backend`:

```bash
docker compose up -d --build db api
```

Then create a local frontend environment file from `.env.example` and run:

```bash
npm install
npm run dev
```

Open `http://localhost:4173`.

## Checks

```bash
npm test
npm run build
```

## Main routes

| Route | Purpose |
|---|---|
| `/login` | Sign in to an existing account |
| `/register` | Create a new account |
| `/app` | Simple protected dashboard |
