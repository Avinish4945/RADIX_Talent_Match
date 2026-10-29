from typing import Any, Dict, List, Optional
from app.schemas.profile import CandidateProfile
from app.services.supabase_client import supabase


def save_profile(profile: CandidateProfile) -> str:
    """Save the candidate profile into Supabase profiles table and return the generated ID."""
    dump = profile.model_dump()
    response = supabase.table("profiles").insert({"profile_data": dump}).execute()

    if response.data:
        return str(response.data[0]["id"])
    raise RuntimeError("Failed to save profile to database")


def get_profile_by_id(profile_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve profile data by profile ID from Supabase."""
    response = supabase.table("profiles").select("id, profile_data, created_at").eq("id", profile_id).execute()

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


def list_profiles(limit: int = 10) -> List[Dict[str, Any]]:
    """Retrieve recent profiles from Supabase."""
    try:
        response = (
            supabase.table("profiles")
            .select("id, profile_data, created_at")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        results = []
        for item in response.data or []:
            prof = item.get("profile_data") or {}
            prof["id"] = item.get("id")
            results.append(prof)
        return results
    except Exception:
        return []
