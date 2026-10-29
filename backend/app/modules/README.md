# Feature modules

Each folder in this directory represents a backend feature and owns its
business logic. Keep HTTP endpoints in `app/routes/`, shared integrations in
`app/services/`, and shared Pydantic contracts in `app/schemas/`.

The backend entry point and full directory guide are documented in
[`../README.md`](../README.md).

Current feature areas:

- `jd_analytics/` — job description analysis
- `resume_parsing/` — resume parsing
- `profile_builder/` — candidate profile workflows
- `talent_check/` — company readiness assessment and scoring
- `skill_matching/` — candidate-to-job skill matching
