# Talent Check

Endpoint: `POST /api/talent-check/`
Request: `{"candidate_id":"demo-candidate","company":"Example Company"}`

Response fields: `company`, `readiness_score`, `coverage_percent`, `skillset_gap`.
Each category item contains `category_code`, `required_level`, `candidate_level`,
`gap_size`, `gap`, and `status`.

Scoring on assessed categories:
`round(100 * sum(min(candidate_level, required_level)) / sum(required_level))`.
`gap_size = max(0, required_level - candidate_level)`. Candidate levels are 0–10;
company levels are 1–10. Only explicit numeric candidate levels count as assessed.
Unknown levels remain null and are excluded from score; `coverage_percent` discloses
assessed share. If nothing is assessed, readiness score is null.

Dataset format supports `{"companies":{"Company":[{"category_code":"COD","required_level":7}]}}`
or a list of objects with `name` and `requirements`/`skills`. Adapt loader to official
organizer file if its shape differs. Never use the example file as official data.

The `demo-candidate` profile is temporary and enabled by default. Set
`RADIX_USE_MOCK_PROFILES=false` to disable it. `RADIX_COMPANY_SKILLSETS_PATH` can
override the dataset path. Run tests from backend with `python -m pytest tests/test_talent_check.py`.
