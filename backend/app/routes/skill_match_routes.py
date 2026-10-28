"""Skill Matching route. The URL prefix (/api/skill-match) is added in main.py."""
from fastapi import APIRouter, HTTPException

from app.modules.skill_matching.service import SkillMatchRequest, run_match

router = APIRouter()


@router.post("")
def skill_match(payload: SkillMatchRequest):
    if not payload.jd_skills:
        raise HTTPException(422, detail="jd_skills must contain at least one skill")
    return run_match(payload)
