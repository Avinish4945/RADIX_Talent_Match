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
        profile_id = profile_service.save_profile(profile)
        return {"id": profile_id, "message": "Profile saved successfully"}
    except Exception as exc:
        logger.error("Failed to save profile: %s", exc)
        raise HTTPException(
            status_code=500,
            detail="Failed to save profile. An internal error occurred.",
        ) from None


@router.get("/api/profiles/latest")
def get_latest_profile() -> Dict[str, Any]:
    profile = profile_service.get_latest_profile()
    if not profile:
        raise HTTPException(status_code=404, detail="No profile found")
    return profile


@router.get("/api/profiles/{profile_id}")
def get_profile(profile_id: str) -> Dict[str, Any]:
    profile = profile_service.get_profile_by_id(profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.get("/api/profiles")
def list_profiles(limit: int = 10) -> List[Dict[str, Any]]:
    return profile_service.list_profiles(limit=limit)
