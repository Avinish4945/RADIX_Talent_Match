from typing import Any

from app.schemas.profile import CandidateProfile
from app.services.supabase_client import supabase


def save_profile(profile: CandidateProfile, profile_id: str | None = None) -> str:
    """Create a profile or update its existing row to avoid duplicate records."""
    data = profile.model_dump(exclude={"id"})
    table = supabase.table("profiles")
    if profile_id:
        response = table.update({"profile_data": data}).eq("id", profile_id).execute()
        if response.data:
            return str(response.data[0]["id"])
        raise LookupError("Profile ID was not found; reload the profile before saving")

    response = table.insert({"profile_data": data}).execute()
    if response.data:
        return str(response.data[0]["id"])
    raise RuntimeError("Failed to save profile to database")


<<<<<<< HEAD
def get_profile_by_id(profile_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve profile data by profile ID from Supabase."""
    response = (
        supabase.table("profiles")
        .select("id, profile_data, created_at")
        .eq("id", profile_id)
        .execute()
    )

    if response.data:
        data = response.data[0].get("profile_data") or {}
        data["id"] = response.data[0]["id"]
        return data
    return None


def get_latest_profile() -> Optional[Dict[str, Any]]:
    """Retrieve the most recently saved profile from Supabase."""
    try:
        response = (
            supabase.table("profiles")
            .select("id, profile_data, created_at")
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if response.data:
            data = response.data[0].get("profile_data") or {}
            data["id"] = response.data[0]["id"]
            return data
    except Exception:
        pass
    return None


def list_profiles(limit: int = 100) -> List[Dict[str, Any]]:
    """Retrieve recent profiles from Supabase."""
    try:
        response = (
            supabase.table("profiles")
            .select("id, profile_data, created_at")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        profiles = []
        for row in response.data or []:
            profile_data = row.get("profile_data") or {}
            profile_id = str(row.get("id"))
            profiles.append(
                {
                    "id": profile_id,
                    "name": profile_data.get("name") or "Unnamed candidate",
                    "skills": profile_data.get("skills") or [],
                }
            )
        return profiles
    except Exception:
        return []
=======
def get_profile_by_id(profile_id: str) -> dict[str, Any] | None:
    response = (
        supabase.table("profiles")
        .select("id, profile_data")
        .eq("id", profile_id)
        .limit(1)
        .execute()
    )
    if not response.data:
        return None

    profile_data = response.data[0].get("profile_data") or {}
    return {**profile_data, "id": response.data[0]["id"]}


def list_profiles(limit: int = 100) -> list[dict[str, Any]]:
    response = (
        supabase.table("profiles")
        .select("id, profile_data, created_at")
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    profiles = []
    for row in response.data or []:
        profile_data = row.get("profile_data") or {}
        profile_id = row.get("id")
        if not isinstance(profile_id, str) or not isinstance(profile_data, dict):
            raise RuntimeError("Supabase returned an invalid profile record")
        profiles.append(
            {
                "id": profile_id,
                "name": profile_data.get("name") or "Unnamed candidate",
            }
        )
    return profiles
>>>>>>> f47fe0f (fix)


def update_profile(profile_id: str, profile: CandidateProfile) -> bool:
    """Update profile data by profile ID in Supabase."""
    dump = profile.model_dump(exclude={"id"})
    response = (
        supabase.table("profiles")
<<<<<<< HEAD
        .update({"profile_data": dump})
=======
        .update({"profile_data": profile.model_dump(exclude={"id"})})
>>>>>>> f47fe0f (fix)
        .eq("id", profile_id)
        .select("id")
        .execute()
    )
    return bool(response.data)
