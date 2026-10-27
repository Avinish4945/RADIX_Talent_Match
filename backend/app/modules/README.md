# Backend module ownership

Each module owner keeps module-specific business logic and tests inside their module folder. Register HTTP routers in `backend/app/routes/` and include them in `backend/app/main.py` only after the module exposes a stable contract.

Current JD Analytics code remains in `backend/app/routes/jd_routes.py` and `backend/app/services/` until it can be moved safely. Do not perform broad file moves during the hackathon without checking imports and testing the full flow.
