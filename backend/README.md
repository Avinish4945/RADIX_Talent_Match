# Backend

The backend is a FastAPI application in `app/main.py`. Run commands from this
directory so that imports resolve from the `app` package.

## Setup

From the repository root, copy `.env.example` to `backend/.env`, then set:

- `SUPABASE_URL` and `SUPABASE_KEY` for profile and job-description storage.
- `GROQ_API_KEY` for AI-based JD analysis and resume extraction.

Do not commit credentials. Install the backend dependencies and start the API:

```bash
cd backend
python -m venv .venv
# Activate .venv using the command for your shell.
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

The API listens at `http://127.0.0.1:8000`; OpenAPI documentation is available
at `http://127.0.0.1:8000/docs`.

Run backend tests from `backend/`:

```bash
python -m pytest tests
```

## API areas

| Prefix | Purpose |
| --- | --- |
| `/api/jd` | Upload, extract, analyze, list, retrieve, and delete saved job descriptions. JD analysis extracts skills and persists the result in Supabase. |
| `/api/resume` | Parse resume documents into candidate profile data. |
| `/api/profiles` | Create, list, retrieve, and update saved candidate profiles. |
| `/api/skill-match` | Compare saved JD skills against candidate skills. |
| `/api/talent-check` | Assess a candidate against configured proficiency requirements or check for skill presence from a saved JD. |
| `/api/health` | Basic service health check. |

JD and resume document endpoints accept PDF and DOCX files with a 10 MB maximum.
JD analysis and resume extraction use Groq when configured; document parsing
and some resume parsing paths have deterministic behavior.

## Code layout

```text
backend/
├── app/
│   ├── main.py                 # Configure FastAPI and register routers
│   ├── routes/                 # HTTP endpoints and request handling
│   ├── modules/                # Feature-specific business logic
│   ├── services/               # Shared integrations and services
│   ├── schemas/                # Shared Pydantic models and API contracts
│   └── utils/                  # Shared helpers and validation
├── tests/                      # Backend unit and API tests
├── scripts/                    # Development and demo scripts
├── uploads/                    # Temporary local document uploads
└── requirements.txt            # Backend runtime and test dependencies
```

Keep feature logic in `app/modules/<feature>/`, endpoints in `app/routes/`,
shared integrations in `app/services/`, and shared request/response models in
`app/schemas/`. Keep `app/main.py` focused on application setup and router
registration. Add or update tests when backend behavior changes.

The `jd_analytics`, `resume_parsing`, `profile_builder`, `talent_check`, and
`skill_matching` module folders mark feature ownership. Existing shared
services remain in `app/services/` until they can be moved without breaking
imports or API contracts.

## Configuration and data notes

- `RADIX_COMPANY_SKILLSETS_PATH` overrides the Talent Check requirements JSON
  path. The default is `data/talent_check_company_skillsets.json`.
- Checked-in company requirements are synthetic, not official benchmarks.
- Profile API reads and updates currently do not enforce authenticated
  ownership. Do not expose personal profile data publicly until server-side
  authentication and ownership checks are implemented.
