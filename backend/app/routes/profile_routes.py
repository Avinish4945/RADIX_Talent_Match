import logging
from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException

from app.schemas.profile import CandidateProfile
from app.services import profile_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/api/profiles")
def create_profile(profile: CandidateProfile) -> dict[str, str]:
    try:
        profile_id = profile_service.save_profile(profile, profile_id=profile.id)
        return {"id": profile_id, "message": "Profile saved successfully"}
    except LookupError as error:
        raise HTTPException(status_code=404, detail=str(error)) from None
    except Exception:
        logger.exception("Failed to save profile")
        raise HTTPException(
            status_code=500,
            detail="Failed to save profile. An internal error occurred.",
        ) from None


@router.get("/api/profiles")
def list_profiles(limit: int = 100) -> dict[str, list[dict[str, Any]]]:
    return {"profiles": profile_service.list_profiles(limit=limit)}


@router.get("/api/profiles/{profile_id}")
def get_profile(profile_id: str) -> dict[str, Any]:
    profile = profile_service.get_profile_by_id(profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.put("/api/profiles/{profile_id}")
def update_profile(profile_id: str, profile: CandidateProfile) -> dict[str, str]:
    try:
        updated = profile_service.update_profile(profile_id, profile)
    except Exception:
        logger.exception("Failed to update profile %s", profile_id)
        raise HTTPException(
            status_code=500,
            detail="Failed to update profile. An internal error occurred.",
        ) from None

    if not updated:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {"id": profile_id, "message": "Profile updated successfully"}
