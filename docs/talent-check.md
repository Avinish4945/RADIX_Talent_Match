# Talent Check

## API

- `GET /api/talent-check/companies` returns `{"companies":["Company"]}` from
  the configured company-requirements dataset. It returns `503` when the file is
  missing and `422` when its contents are invalid.
- `GET /api/talent-check/candidates` returns candidate IDs and names. The
  `demo-candidate` is temporary mock data enabled by default.
- `POST /api/talent-check/` accepts
  `{"candidate_id":"demo-candidate","company":"Example Company"}` and returns
  `company`, `readiness_score`, `coverage_percent`, and `skillset_gap`.

Each `skillset_gap` item contains `category_code`, `required_level`,
`candidate_level`, `gap_size`, `gap`, and `status`.

## Scoring and unknown evidence

For assessed categories:

`round(100 * sum(min(candidate_level, required_level)) / sum(required_level))`

Candidate levels are integers from 0–10; company requirement levels are 1–10.
A candidate skill only counts as assessed when it has a category and an explicit
numeric `level`. A skill-name string, a skill with no level, or missing evidence
does **not** imply proficiency: it remains unknown. Unknown levels are excluded
from the readiness calculation and shown in `coverage_percent`. If nothing is
assessed, `readiness_score` is `null`.

The shared `SkillEvidence` schema carries `skill_name`, `category_code`,
`evidence`, `confidence`, and optional `level`. Profile Builder still accepts
legacy string skill names for backwards compatibility; those strings cannot be
scored until they are categorized and explicitly assessed.

## Dataset

The default path is `data/talent_check_company_skillsets.json`. The repository
includes a clearly marked synthetic fixture so a fresh clone can run the demo.
Its `_metadata.official` value is `false`: **these values are not real company
requirements and must not be represented as such.** Replace the fixture with
organizer-provided data before an official presentation.

The loader supports either
`{"companies":{"Company":[{"category_code":"COD","required_level":7}]}}`
or a list of entries with `name` and `requirements`/`skills`. If the organizers
provide a different format, adapt the loader rather than silently guessing.

Set `RADIX_USE_MOCK_PROFILES=false` to disable the temporary candidate.
`RADIX_COMPANY_SKILLSETS_PATH` overrides the dataset path.

## Reproducible local verification

From `backend/`:

```powershell
python -m pytest tests/test_talent_check.py -v
python scripts/demo_talent_check.py
```

Start the API in a separate terminal first:

```powershell
cd backend
python -m uvicorn app.main:app --reload
```

Then open `http://127.0.0.1:8000/docs` and submit:

```json
{
  "candidate_id": "demo-candidate",
  "company": "Example Company"
}
```

With the synthetic fixture, assessed requirements are COD 7, DSA 8, COMM 6,
and SQL 6; the demo candidate has levels 7, 5, 6, and 6. The expected readiness
is 89, and coverage is 36% (assessed weight 27 of total weight 74). DSA is the
only assessed gap (3 levels). Other required categories are unknown, not zero.

The demo script also checks that unknown companies and candidate IDs return
HTTP 404. For the browser workflow, start the frontend with `npm run dev` from
`frontend/`, open `http://127.0.0.1:5173/talent-check`, and choose Example
Company and Demo Candidate. This only verifies the local synthetic workflow;
the organizer dataset and a real Profile Builder integration remain separate
acceptance checks.
