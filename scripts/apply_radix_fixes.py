#!/usr/bin/env python3
"""Apply reviewed RADIX fixes from the repository root; aborts on unexpected source."""
from pathlib import Path
import json

ROOT = Path.cwd()

def edit(path, old, new):
    p = ROOT / path
    if not p.is_file():
        raise RuntimeError(f"Missing {path}")
    text = p.read_text(encoding="utf-8")
    # Normalize CRLF to LF for matching
    text_lf = text.replace("\r\n", "\n")
    old_lf = old.replace("\r\n", "\n")
    new_lf = new.replace("\r\n", "\n")
    n = text_lf.count(old_lf)
    if n != 1:
        raise RuntimeError(f"{path}: expected one anchor, found {n}; stopping")
    updated = text_lf.replace(old_lf, new_lf)
    # Restore original line ending style if CRLF was present
    if "\r\n" in text:
        updated = updated.replace("\n", "\r\n")
    p.write_text(updated, encoding="utf-8")
    print("updated", path)

edit("backend/app/services/profile_service.py",
'''def save_profile(profile: CandidateProfile) -> str:
    """Save the candidate profile into Supabase profiles table and return the generated ID."""
    dump = profile.model_dump()
    response = supabase.table("profiles").insert({"profile_data": dump}).execute()

    if response.data:
        return str(response.data[0]["id"])
    raise RuntimeError("Failed to save profile to database")
''',
'''def save_profile(profile: CandidateProfile, profile_id: Optional[str] = None) -> str:
    """Create a profile or update its existing row to avoid duplicate records."""
    dump = profile.model_dump(exclude={"id"})
    table = supabase.table("profiles")
    if profile_id:
        response = table.update({"profile_data": dump}).eq("id", profile_id).execute()
        if response.data:
            return str(response.data[0]["id"])
        raise LookupError("Profile ID was not found; reload the profile before saving")
    response = table.insert({"profile_data": dump}).execute()
    if response.data:
        return str(response.data[0]["id"])
    raise RuntimeError("Failed to save profile to database")
''')

edit("backend/app/routes/profile_routes.py",
'''@router.post("/api/profiles")
def create_profile(profile: CandidateProfile) -> dict[str, str]:
    try:
        profile_id = profile_service.save_profile(profile)
        return {"id": profile_id, "message": "Profile saved successfully"}
    except Exception as exc:
        logger.error("Failed to save profile: %s", exc)
        raise HTTPException(
            status_code=500,
            detail="Failed to save profile. An internal error occurred.",
        ) from None
''',
'''@router.post("/api/profiles")
def create_profile(profile: CandidateProfile) -> dict[str, str]:
    try:
        profile_id = profile_service.save_profile(profile, profile_id=profile.id)
        return {"id": profile_id, "message": "Profile saved successfully"}
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from None
    except Exception:
        logger.exception("Failed to save profile")
        raise HTTPException(
            status_code=500,
            detail="Failed to save profile. An internal error occurred.",
        ) from None
''')

edit("frontend/src/presentation/layouts/AppShell.jsx",
'''        if (savedId) {
          profileData = await getProfileByIdFromApi(savedId);
        }
        if (!profileData) {
          profileData = await getLatestProfileFromApi();
        }
''',
'''        if (savedId) {
          profileData = await getProfileByIdFromApi(savedId);
        }
        // Do not fall back to /profiles/latest: it is global, not user-scoped.
''')

edit("frontend/src/presentation/layouts/AppShell.jsx",
'''import {
  getLatestProfileFromApi,
  getProfileByIdFromApi,
} from "../../infrastructure/api/profileApi";
''',
'''import { getProfileByIdFromApi } from "../../infrastructure/api/profileApi";
''')

edit("frontend/src/presentation/routes/router.jsx",
'''        // loader: requireAuth,
        element: <AppShell />,
''',
'''        loader: requireAuth,
        element: <AppShell />,
''')

edit("frontend/src/presentation/routes/router.jsx",
'''            element: <TalentCheck />,
            // loader: requireAuth,
''',
'''            element: <TalentCheck />,
''')

edit("frontend/src/presentation/pages/workspace/profile-builder/ProfileBuilder.jsx",
'''    const payload = {
      name,
''',
'''    const payload = {
      id: profile.profileId || profile.id || undefined,
      name,
''')

edit("backend/app/routes/profile_routes.py",
'''@router.get("/api/profiles/latest")
def get_latest_profile() -> Dict[str, Any]:
    profile = profile_service.get_latest_profile()
    if not profile:
        raise HTTPException(status_code=404, detail="No profile found")
    return profile


''', "")

edit("backend/app/routes/profile_routes.py",
'''@router.get("/api/profiles")
def list_profiles(limit: int = 10) -> List[Dict[str, Any]]:
    return profile_service.list_profiles(limit=limit)
''', "")

edit("frontend/src/infrastructure/api/profileApi.js",
'''/**
 * Fetch the most recently saved profile via GET /api/profiles/latest.
 *
 * @returns {Promise<Object|null>}
 */
export async function getLatestProfileFromApi() {
  try {
    return await apiRequest("/profiles/latest");
  } catch (err) {
    // Return null if no profile exists yet in the database
    return null;
  }
}

/**
 * Fetch recent profiles list from the database.
 *
 * @param {number} limit
 * @returns {Promise<Array<Object>>}
 */
export async function listProfilesFromApi(limit = 10) {
  try {
    return await apiRequest(`/profiles?limit=${limit}`);
  } catch (err) {
    return [];
  }
}
''', "")

req_path = ROOT / "backend/requirements.txt"
req = req_path.read_text(encoding="utf-8")
if req.count("supabase==2.33.0\n") != 2:
    raise RuntimeError("Expected duplicate Supabase pin; stopping")
req_path.write_text(req.replace("supabase==2.33.0\n", "", 1), encoding="utf-8")
print("updated backend/requirements.txt")

dataset_path = ROOT / "data/talent_check_company_skillsets.json"
data = json.loads(dataset_path.read_text(encoding="utf-8"))
metadata = data.setdefault("_metadata", {})
metadata["official"] = False
metadata["status"] = "provisional_mapping_requires_human_verification"
metadata["purpose"] = "Provisional mappings based on listed job-description PDFs; category and proficiency levels require traceable evidence and review."
metadata["verification_note"] = "PDF filenames alone do not prove each category/level mapping. Confirm each requirement against the source and organizer brief."
metadata["verified_benchmarks"] = []
dataset_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print("updated data/talent_check_company_skillsets.json")

edit("backend/tests/test_talent_check.py",
'''    assert payload["_metadata"]["official"] is True
''',
'''    assert payload["_metadata"]["official"] is False
    assert payload["_metadata"]["status"] == "provisional_mapping_requires_human_verification"
''')

edit("backend/tests/test_talent_check.py",
'''    assert "Google LLC" in payload["_metadata"]["verified_benchmarks"]
''',
'''    assert payload["_metadata"]["verified_benchmarks"] == []
''')

print("Review git diff. The profile-by-ID API still needs real server-side authentication and owner checks before multi-user deployment.")
