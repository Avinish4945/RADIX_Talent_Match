# RADIX Talent Match implementation bundle

## Apply

Extract this bundle into the root of your local `RADIX_Talent_Match` checkout,
merging the included folders, then run from the repository root:

```bash
python scripts/apply_radix_fixes.py
git diff --check
git diff
```

The script fails closed if expected source anchors do not match the current checkout.
Review the diff before committing.

## Included

- Update a profile row by its existing ID instead of inserting a duplicate.
- Return 404 for a stale profile ID rather than silently creating another row.
- Remove globally-scoped `/api/profiles/latest` and profile-list endpoints and remove
  the frontend's global latest-profile fallback.
- Restore the frontend workspace route guard.
- Remove duplicate Supabase dependency pin.
- Mark benchmark category/level mappings as provisional until audited against source
  evidence and reviewed by the organizer.
- Add GitHub Actions CI for backend tests, frontend clean install/build, and formatting.
- Add persistence regression tests.

## Validation

```bash
cd backend && pytest -q
cd ../frontend && npm ci && npm run build && npm run format:check
```

## Security limitation — do not ignore

This reduces accidental cross-profile leakage but does **not** finish multi-user
authorization. `/api/profiles/{profile_id}` still lacks an authenticated identity and
owner check; frontend route guards are not a security boundary. Before public/multi-user
deployment, use real server-side authentication, store an immutable owner ID with each
profile, enforce ownership on every read/update, and test cross-user denial. Do not
expose personal profile data publicly until then.

The JSON still contains the existing company requirements and source-PDF references.
A list of PDF filenames is not proof that each category and level is accurate; create
a requirement-to-source evidence table and get the mappings reviewed before calling
them official.
