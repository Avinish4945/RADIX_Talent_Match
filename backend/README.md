# Backend

The backend has one FastAPI application: `app/main.py`. Run commands from this
directory so imports resolve from the `app` package:

```bash
python -m uvicorn app.main:app --reload
pytest
```

## Code layout

```text
backend/
├── app/
│   ├── main.py                 # Create the FastAPI app and register routes
│   ├── routes/                 # HTTP endpoints and request handling
│   ├── modules/                # Feature-specific business logic
│   ├── services/               # Shared integrations and services
│   ├── schemas/                # Shared Pydantic models and API contracts
│   └── utils/                  # Small shared helpers and validation
├── tests/                      # Backend unit and API tests
├── scripts/                    # Development and demo scripts
├── uploads/                    # Local development uploads; not source code
└── requirements.txt            # Python dependencies
```

Keep feature logic in `app/modules/<feature>/`, endpoints in `app/routes/`,
shared integrations in `app/services/`, and shared request/response models in
`app/schemas/`. `app/main.py` should only configure the application and include
routers. Add tests under `tests/` when changing backend behavior.

The `jd_analytics`, `resume_parsing`, `profile_builder`, `talent_check`, and
`skill_matching` module folders mark feature ownership. Existing shared
services remain in `app/services/` until a feature can be moved without
breaking its imports or API contract.
