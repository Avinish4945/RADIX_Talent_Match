from fastapi import APIRouter, HTTPException

from app.schemas.profile import CandidateProfile
from app.services import profile_service

router = APIRouter()


@router.post("/api/profiles")
def create_profile(profile: CandidateProfile) -> dict[str, str]:
    try:
        profile_id = profile_service.save_profile(profile)
        return {"id": profile_id, "message": "Profile saved successfully"}
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Failed to save profile. An internal error occurred.",
        ) from None


@router.get("/api/profiles/{profile_id}")
def get_profile(profile_id: str):
    profile = profile_service.get_profile_by_id(profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile
