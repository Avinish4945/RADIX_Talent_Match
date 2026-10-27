# Talent Check

The frontend loads selectable options from:

- `GET /api/talent-check/companies` returns `{"companies":["Company"]}` using
  the configured requirements dataset. It returns `503` when the dataset is
  missing and `422` when the dataset is invalid.
- `GET /api/talent-check/candidates` returns available candidate IDs and names.
  The current `demo-candidate` is temporary and enabled by default.

Run an assessment with `POST /api/talent-check/`:

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

Set `RADIX_USE_MOCK_PROFILES=false` to disable the temporary candidate.
`RADIX_COMPANY_SKILLSETS_PATH` can override the dataset path. Run tests from
backend with `python -m pytest tests/test_talent_check.py`.

## Reproducible local demonstration

The checked-in dataset currently marks itself as synthetic development data
(`_metadata.official` is `false`). The sequence below is repeatable for local
development, but its results must not be presented as real company
expectations. Replace it with the organizer-provided dataset before an official
demonstration; update the expected example calculations below if its values
differ.

1. Keep the repository-root `.env` configured with the existing backend
   credentials. Do not commit or print its values.
2. In a backend terminal:

   ```powershell
   cd backend
   python -m uvicorn app.main:app --reload
   ```

3. In a second terminal, from `backend/`, run the automated API demonstration:

   ```powershell
   python -m pytest tests/test_talent_check.py
   python scripts/demo_talent_check.py
   ```

   The script checks `/docs`, lists companies and candidates, submits a valid
   assessment, and verifies that unknown companies and candidates return 404.
4. Open `http://127.0.0.1:8000/docs`. Expand `POST /api/talent-check/`,
   select **Try it out**, and submit:

   ```json
   {
     "candidate_id": "demo-candidate",
     "company": "Example Company"
   }
   ```

   For the current synthetic fixture, assessed requirements are COD 7, DSA 8,
   COMM 6, SQL 6; the demo candidate has levels 7, 5, 6, and 6. Therefore the
   readiness score is `round(100 * (7 + 5 + 6 + 6) / (7 + 8 + 6 + 6)) = 89`.
   Assessed requirement weight is 27 and total company requirement weight is
   74, so coverage is `round(100 * 27 / 74) = 36%`. DSA is the only assessed
   gap, with a gap size of 3. Other required categories without a candidate
   level are reported as unknown, not as zero.
5. In Swagger, repeat the request with `company` set to
   `Unknown Demo Company`; expect HTTP 404. Repeat with
   `candidate_id` set to `missing-demo-candidate`; expect HTTP 404.
6. In another terminal, from `frontend/`, run:

   ```powershell
   npm run dev -- --host 127.0.0.1
   ```

   Open `http://127.0.0.1:5173/talent-check`, choose **Example Company** and
   **Demo Candidate**, then run the assessment. Confirm the displayed 89%
   readiness, 36% coverage, DSA gap of 3, and unknown skill statuses. The Vite
   development proxy forwards `/api` requests to FastAPI on port 8000.
