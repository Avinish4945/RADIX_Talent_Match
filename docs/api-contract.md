# RADIX Talent Match — API and integration contract

## Integration rules

- Keep one FastAPI application at `backend/app/main.py`.
- HTTP endpoints belong in `backend/app/routes/`; business logic belongs in `backend/app/modules/<module>/` or shared `backend/app/services/`.
- Shared Pydantic models belong in `backend/app/schemas/`.
- Frontend API access goes through `frontend/src/infrastructure/api/apiClient.js`; pages should not each implement their own fetch configuration.
- Do not rename shared fields or category codes without notifying every module owner.
- Every module owner supplies a sample request/response and a test before integration.
- Use feature branches and pull requests. Avoid concurrent edits to `main.py`, shared schemas, and API client configuration.

## Canonical skill categories

| Code | Category |
|---|---|
| `COD` | Coding |
| `DSA` | Data Structures & Algorithms |
| `OOD` | Object-Oriented Design |
| `APTI` | Aptitude |
| `COMM` | Communication |
| `AI` | AI |
| `CLOUD` | Cloud |
| `SQL` | SQL |
| `SWE` | Software Engineering |
| `SYSD` | System Design |
| `NETW` | Networking |
| `OS` | Operating Systems |
| `OTHER` | Outside the standard categories |

Each skill uses `skill_name`, `category_code`, `evidence`, and `confidence`.

## Suggested Talent Check endpoint

`POST /api/talent-check`

Request (proposed; finalize with the frontend and Profile Builder owners):

```json
{
  "candidate_id": "candidate-001",
  "company": "Example Company"
}
```

Response (proposed; align with the official brief and dataset):

```json
{
  "company": "Example Company",
  "readiness_score": 76,
  "skillset_gap": [
    {
      "category_code": "DSA",
      "required_level": 8,
      "candidate_level": 5,
      "gap_size": 3,
      "gap": true
    }
  ]
}
```

Do not hard-code company requirements or readiness scores. Load company requirements from the official organizer dataset. Missing evidence should be represented as unknown or clearly disclosed, not silently treated as verified zero proficiency.

## Module ownership

- `jd_analytics/`: job description parsing and requirement extraction
- `resume_parsing/`: resume text extraction and candidate-skill extraction
- `profile_builder/`: profile validation, editing and persistence workflows
- `talent_check/`: company-level readiness scoring
- `skill_matching/`: candidate-to-specific-JD matching

These folders establish ownership boundaries; they do not require moving the current working services immediately.
