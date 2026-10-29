# RADIX Talent Match

RADIX Talent Match is a web application for analyzing job descriptions,
building candidate profiles, matching candidate skills to saved JDs, and
assessing candidate skills against configured company requirements.

## Project layout

- `backend/` — FastAPI application, API integrations, and Python tests.
- `frontend/` — React application built with Vite.
- `data/` — Local sample data, including a clearly marked synthetic
  Talent Check requirements fixture.
- `docs/` — Feature-specific documentation.

For backend setup, API behavior, and code ownership, see
[backend/README.md](./backend/README.md).

## Requirements

- Python with `pip`
- Node.js and npm
- Supabase project credentials
- Groq API key for AI-based JD analysis

## Run locally

Create `backend/.env` from the root `.env.example` and configure
`SUPABASE_URL` and `SUPABASE_KEY`. Set `GROQ_API_KEY` to enable AI-based JD
analysis and resume extraction. Never commit credentials.

In one terminal:

```bash
cd backend
python -m venv .venv
# Activate .venv using the command for your shell.
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

In another terminal:

```bash
cd frontend
npm ci
npm run dev
```

The frontend is served at `http://localhost:5173`; the API is served at
`http://localhost:8000`. Interactive API documentation is available at
`http://localhost:8000/docs`.

## Validate

```bash
cd backend
python -m pytest tests
cd ../frontend
npm run build
npm run format:check
```

## Assessment data and deployment

The checked-in Talent Check company requirements are synthetic and are not
official company benchmarks. Replace them only with requirements supported by
reviewed source evidence before presenting results as official.

The API currently stores profile and job-description data in Supabase. Profile
endpoints do not yet enforce authenticated ownership, so do not expose personal
profile data in a public or multi-user deployment until server-side
authentication and owner checks are implemented.
